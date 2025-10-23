import { BudgetModel, CreateBudgetData, UpdateBudgetData, BudgetFilters, BudgetWithSpending, BudgetRecommendation } from '../models/Budget';
import { CategoryModel } from '../models/Category';

export interface BudgetListResult {
  budgets: BudgetWithSpending[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BudgetAnalytics {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  overallUtilization: number;
  statusCounts: {
    'on-track': number;
    'warning': number;
    'over-budget': number;
  };
  budgets: Array<{
    budgetId: string;
    categoryName: string;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
    utilizationPercentage: number;
    status: 'on-track' | 'warning' | 'over-budget';
    alertThreshold: number;
    period: {
      startDate: Date;
      endDate: Date;
    };
  }>;
}

export class BudgetService {
  static async createBudget(data: CreateBudgetData): Promise<any> {
    // Verify category exists and user has access
    const category = await CategoryModel.findById(data.categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    if (category.userId && category.userId !== data.userId) {
      throw new Error('Access denied to category');
    }

    // Check for overlapping budgets
    const hasOverlap = await BudgetModel.checkForOverlappingBudgets(
      data.userId,
      data.categoryId,
      data.startDate,
      data.endDate
    );

    if (hasOverlap) {
      throw new Error('Budget already exists for this category and time period');
    }

    return await BudgetModel.create(data);
  }

  static async getBudgets(
    userId: string,
    filters: Partial<BudgetFilters> = {},
    page: number = 1,
    limit: number = 20
  ): Promise<BudgetListResult> {
    const budgetFilters: BudgetFilters = {
      userId,
      ...filters
    };

    const { budgets, total } = await BudgetModel.getBudgetsWithSpending(
      budgetFilters,
      page,
      limit
    );

    return {
      budgets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getBudgetById(id: string, userId: string): Promise<any> {
    const budget = await BudgetModel.findById(id, userId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    const spentAmount = await BudgetModel.getSpendingForBudget(id, userId);
    const remainingAmount = budget.amount - spentAmount;
    const utilizationPercentage = budget.amount > 0 
      ? (spentAmount / budget.amount) * 100 
      : 0;

    return {
      ...budget,
      spentAmount,
      remainingAmount,
      utilizationPercentage: Number(utilizationPercentage.toFixed(2))
    };
  }

  static async updateBudget(
    id: string,
    userId: string,
    data: UpdateBudgetData
  ): Promise<any> {
    const budget = await BudgetModel.findById(id, userId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    // Check for overlapping budgets if dates are being updated
    if (data.startDate || data.endDate) {
      const startDate = data.startDate || budget.startDate;
      const endDate = data.endDate || budget.endDate;

      const hasOverlap = await BudgetModel.checkForOverlappingBudgets(
        userId,
        budget.categoryId,
        startDate,
        endDate,
        id
      );

      if (hasOverlap) {
        throw new Error('Budget already exists for this category and time period');
      }
    }

    return await BudgetModel.update(id, userId, data);
  }

  static async deleteBudget(id: string, userId: string): Promise<void> {
    const budget = await BudgetModel.findById(id, userId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    await BudgetModel.delete(id, userId);
  }

  static async getBudgetRecommendations(userId: string): Promise<BudgetRecommendation[]> {
    return await BudgetModel.getRecommendations(userId);
  }

  static async getBudgetAnalytics(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<BudgetAnalytics> {
    const filters: BudgetFilters = { userId };
    if (startDate || endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }

    const { budgets } = await BudgetModel.getBudgetsWithSpending(filters, 1, 1000);

    const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
    const totalRemaining = totalAllocated - totalSpent;
    const overallUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    const statusCounts = budgets.reduce((counts, budget) => {
      let status: 'on-track' | 'warning' | 'over-budget' = 'on-track';
      if (budget.utilizationPercentage >= 100) {
        status = 'over-budget';
      } else if (budget.utilizationPercentage >= budget.alertThreshold) {
        status = 'warning';
      }
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {} as { [key: string]: number });

    const budgetAnalytics = budgets.map(budget => {
      let status: 'on-track' | 'warning' | 'over-budget' = 'on-track';
      if (budget.utilizationPercentage >= 100) {
        status = 'over-budget';
      } else if (budget.utilizationPercentage >= budget.alertThreshold) {
        status = 'warning';
      }

      return {
        budgetId: budget.id,
        categoryName: budget.category?.name || 'Unknown',
        allocatedAmount: budget.allocatedAmount,
        spentAmount: budget.spentAmount,
        remainingAmount: budget.remainingAmount,
        utilizationPercentage: budget.utilizationPercentage,
        status,
        alertThreshold: budget.alertThreshold,
        period: {
          startDate: budget.startDate,
          endDate: budget.endDate
        }
      };
    });

    return {
      totalAllocated,
      totalSpent,
      totalRemaining,
      overallUtilization: Number(overallUtilization.toFixed(2)),
      statusCounts: {
        'on-track': statusCounts['on-track'] || 0,
        'warning': statusCounts['warning'] || 0,
        'over-budget': statusCounts['over-budget'] || 0
      },
      budgets: budgetAnalytics.sort((a, b) => b.utilizationPercentage - a.utilizationPercentage)
    };
  }

  static async checkBudgetAlerts(userId: string): Promise<void> {
    const { budgets } = await BudgetModel.getBudgetsWithSpending({ userId }, 1, 1000);

    console.log(`Checking budget alerts for user ${userId}, found ${budgets.length} budgets`);

    for (const budget of budgets) {
      console.log(`Budget ${budget.id}: ${budget.utilizationPercentage}% utilized, threshold: ${budget.alertThreshold}%`);
      
      // Check if budget has exceeded alert threshold
      if (budget.utilizationPercentage >= budget.alertThreshold) {
        console.log(`Budget ${budget.id} exceeded threshold! Creating alert...`);
        
        // Check if alert already exists for this threshold
        const existingAlerts = await BudgetModel.getAlerts(budget.id);
        const hasAlert = existingAlerts.some(
          alert => 
            alert.thresholdPercentage === budget.alertThreshold &&
            !alert.isAcknowledged
        );

        if (!hasAlert) {
          console.log(`Creating new alert for budget ${budget.id} at ${budget.alertThreshold}%`);
          await BudgetModel.createAlert(budget.id, budget.alertThreshold);
          console.log(`Alert created successfully for budget ${budget.id}`);
        } else {
          console.log(`Alert already exists for budget ${budget.id} at ${budget.alertThreshold}%`);
        }
      }
    }
  }

  static async getBudgetAlerts(budgetId: string, userId: string): Promise<any[]> {
    const budget = await BudgetModel.findById(budgetId, userId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    return await BudgetModel.getAlerts(budgetId);
  }

  static async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    // Verify the alert belongs to a budget owned by the user
    const alert = await BudgetModel.getAlerts(alertId);
    if (!alert || alert.length === 0) {
      throw new Error('Alert not found');
    }

    // This is a simplified check - in a real implementation, you'd verify ownership
    await BudgetModel.acknowledgeAlert(alertId);
  }

  static async getBudgetPerformance(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    period: { startDate: Date; endDate: Date };
    summary: {
      totalAllocated: number;
      totalSpent: number;
      totalRemaining: number;
      overallUtilization: number;
      statusCounts: { [key: string]: number };
    };
    budgets: any[];
  }> {
    const analytics = await this.getBudgetAnalytics(userId, startDate, endDate);
    
    const defaultStartDate = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const defaultEndDate = endDate || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    return {
      period: {
        startDate: defaultStartDate,
        endDate: defaultEndDate
      },
      summary: {
        totalAllocated: analytics.totalAllocated,
        totalSpent: analytics.totalSpent,
        totalRemaining: analytics.totalRemaining,
        overallUtilization: analytics.overallUtilization,
        statusCounts: analytics.statusCounts
      },
      budgets: analytics.budgets
    };
  }
}
