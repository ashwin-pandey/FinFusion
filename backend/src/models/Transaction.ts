import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  date: Date;
  description?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'OTHER';
  isRecurring: boolean;
  recurringFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    icon?: string;
    color?: string;
  };
}

export interface CreateTransactionData {
  userId: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  date: Date;
  description?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'OTHER';
  isRecurring?: boolean;
  recurringFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

export interface UpdateTransactionData {
  amount?: number;
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  date?: Date;
  description?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'OTHER';
  isRecurring?: boolean;
  recurringFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

export interface TransactionFilters {
  userId: string;
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'OTHER';
  isRecurring?: boolean;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
}

export class TransactionModel {
  static async create(data: CreateTransactionData): Promise<Transaction> {
    return await prisma.transaction.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        date: data.date,
        description: data.description,
        paymentMethod: data.paymentMethod,
        isRecurring: data.isRecurring || false,
        recurringFrequency: data.recurringFrequency
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

  static async findById(id: string, userId: string): Promise<Transaction | null> {
    return await prisma.transaction.findFirst({
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
        }
      }
    });
  }

  static async findMany(
    filters: TransactionFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const where: any = {
      userId: filters.userId
    };

    if (filters.type) where.type = filters.type;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
    if (filters.isRecurring !== undefined) where.isRecurring = filters.isRecurring;

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search, mode: 'insensitive' } },
        { category: { name: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
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
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ]);

    return { transactions, total };
  }

  static async update(id: string, userId: string, data: UpdateTransactionData): Promise<Transaction> {
    return await prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        ...(data.amount && { amount: data.amount }),
        ...(data.date && { date: data.date })
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
    await prisma.transaction.delete({
      where: { id }
    });
  }

  static async getSummary(filters: TransactionFilters): Promise<TransactionSummary> {
    const where: any = {
      userId: filters.userId
    };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    const [incomeData, expenseData, totalCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true }
      }),
      prisma.transaction.count({ where })
    ]);

    const totalIncome = Number(incomeData._sum.amount || 0);
    const totalExpenses = Number(expenseData._sum.amount || 0);

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      transactionCount: totalCount
    };
  }

  static async getSpendingByCategory(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{ categoryId: string; categoryName: string; amount: number; transactionCount: number }>> {
    const where: any = {
      userId,
      type: 'EXPENSE'
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const spending = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where,
      _sum: { amount: true },
      _count: { amount: true }
    });

    const categoryDetails = await Promise.all(
      spending.map(async (item: any) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
          select: { name: true }
        });

        return {
          categoryId: item.categoryId,
          categoryName: category?.name || 'Unknown',
          amount: Number(item._sum.amount || 0),
          transactionCount: item._count.amount
        };
      })
    );

    return categoryDetails.sort((a, b) => b.amount - a.amount);
  }
}
