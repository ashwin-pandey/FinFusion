import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: Date;
  endDate: Date;
  alertThreshold: number;
  allowRollover: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    icon?: string;
    color?: string;
  };
  alerts?: BudgetAlert[];
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  thresholdPercentage: number;
  triggeredAt: Date;
  isAcknowledged: boolean;
}

export interface CreateBudgetData {
  userId: string;
  categoryId: string;
  amount: number;
  periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: Date;
  endDate: Date;
  alertThreshold?: number;
  allowRollover?: boolean;
}

export interface UpdateBudgetData {
  amount?: number;
  periodType?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate?: Date;
  endDate?: Date;
  alertThreshold?: number;
  allowRollover?: boolean;
}

export interface BudgetFilters {
  userId: string;
  periodType?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface BudgetWithSpending extends Budget {
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
}

export interface BudgetRecommendation {
  category: {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    icon?: string;
    color?: string;
  };
  averageMonthlySpending: number;
  recommendedBudget: number;
  transactionCount: number;
}

export class BudgetModel {
  static async create(data: CreateBudgetData): Promise<Budget> {
    return await prisma.budget.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId,
        amount: data.amount,
        periodType: data.periodType,
        startDate: data.startDate,
        endDate: data.endDate,
        alertThreshold: data.alertThreshold || 80,
        allowRollover: data.allowRollover || false
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true
          }
        }
      }
    });
  }

  static async findById(id: string, userId: string): Promise<Budget | null> {
    return await prisma.budget.findFirst({
      where: {
        id,
        userId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true
          }
        },
        alerts: {
          orderBy: { triggeredAt: 'desc' }
        }
      }
    });
  }

  static async findMany(
    filters: BudgetFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ budgets: Budget[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const where: any = {
      userId: filters.userId
    };

    if (filters.periodType) where.periodType = filters.periodType;
    if (filters.categoryId) where.categoryId = filters.categoryId;

    if (filters.startDate || filters.endDate) {
      where.OR = [
        {
          startDate: { lte: filters.endDate },
          endDate: { gte: filters.startDate }
        }
      ];
    }

    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true,
              icon: true,
              color: true
            }
          },
          alerts: {
            orderBy: { triggeredAt: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.budget.count({ where })
    ]);

    return { budgets, total };
  }

  static async update(id: string, userId: string, data: UpdateBudgetData): Promise<Budget> {
    return await prisma.budget.update({
      where: { id },
      data: {
        ...data,
        ...(data.amount && { amount: data.amount }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate })
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true
          }
        }
      }
    });
  }

  static async delete(id: string, userId: string): Promise<void> {
    await prisma.budget.delete({
      where: { id }
    });
  }

  static async getSpendingForBudget(budgetId: string, userId: string): Promise<number> {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId }
    });

    if (!budget) return 0;

    // Get all sub-categories of the budget category
    const subCategories = await prisma.category.findMany({
      where: {
        parentCategoryId: budget.categoryId
      },
      select: { id: true }
    });

    // Create array of category IDs (main category + all sub-categories)
    const categoryIds = [budget.categoryId, ...subCategories.map(cat => cat.id)];

    const spending = await prisma.transaction.aggregate({
      where: {
        userId,
        categoryId: { in: categoryIds },
        type: 'EXPENSE',
        date: {
          gte: budget.startDate,
          lte: budget.endDate
        }
      },
      _sum: { amount: true }
    });

    return Number(spending._sum.amount || 0);
  }

  static async getBudgetsWithSpending(
    filters: BudgetFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ budgets: BudgetWithSpending[]; total: number }> {
    const { budgets, total } = await this.findMany(filters, page, limit);

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spentAmount = await this.getSpendingForBudget(budget.id, budget.userId);
        const remainingAmount = budget.amount - spentAmount;
        const utilizationPercentage = budget.amount > 0 
          ? (spentAmount / budget.amount) * 100 
          : 0;

        return {
          ...budget,
          allocatedAmount: budget.amount,
          spentAmount,
          remainingAmount,
          utilizationPercentage: Number(utilizationPercentage.toFixed(2))
        };
      })
    );

    return { budgets: budgetsWithSpending, total };
  }

  static async checkForOverlappingBudgets(
    userId: string,
    categoryId: string,
    startDate: Date,
    endDate: Date,
    excludeBudgetId?: string
  ): Promise<boolean> {
    const where: any = {
      userId,
      categoryId,
      OR: [
        {
          startDate: { lte: endDate },
          endDate: { gte: startDate }
        }
      ]
    };

    if (excludeBudgetId) {
      where.id = { not: excludeBudgetId };
    }

    const count = await prisma.budget.count({ where });
    return count > 0;
  }

  static async getRecommendations(userId: string): Promise<BudgetRecommendation[]> {
    // Get spending patterns for the last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const spendingByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: threeMonthsAgo }
      },
      _sum: { amount: true },
      _avg: { amount: true },
      _count: { amount: true }
    });

    const recommendations = await Promise.all(
      spendingByCategory.map(async (item: any) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true
          }
        });

        if (!category) return null;

        const averageMonthlySpending = Number(item._avg.amount) * Number(item._count.amount) / 3;
        const recommendedBudget = Math.ceil(averageMonthlySpending * 1.1); // 10% buffer

        return {
          category,
          averageMonthlySpending: Number(averageMonthlySpending.toFixed(2)),
          recommendedBudget,
          transactionCount: item._count.amount
        };
      })
    );

    return recommendations.filter(Boolean) as BudgetRecommendation[];
  }

  static async createAlert(
    budgetId: string,
    thresholdPercentage: number
  ): Promise<BudgetAlert> {
    return await prisma.budgetAlert.create({
      data: {
        budgetId,
        thresholdPercentage,
        triggeredAt: new Date()
      }
    });
  }

  static async getAlerts(budgetId: string): Promise<BudgetAlert[]> {
    return await prisma.budgetAlert.findMany({
      where: { budgetId },
      orderBy: { triggeredAt: 'desc' }
    });
  }

  static async acknowledgeAlert(alertId: string): Promise<void> {
    await prisma.budgetAlert.update({
      where: { id: alertId },
      data: { isAcknowledged: true }
    });
  }
}
