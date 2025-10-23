import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT' | 'LOAN' | 'OTHER';
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccountData {
  userId: string;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT' | 'LOAN' | 'OTHER';
  balance?: number;
  currency?: string;
  isActive?: boolean;
}

export interface UpdateAccountData {
  name?: string;
  type?: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT' | 'LOAN' | 'OTHER';
  balance?: number;
  currency?: string;
  isActive?: boolean;
}

export interface AccountFilters {
  userId: string;
  type?: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT' | 'LOAN' | 'OTHER';
  isActive?: boolean;
  search?: string;
}

export class AccountModel {
  static async create(data: CreateAccountData): Promise<Account> {
    return await prisma.account.create({
      data: {
        userId: data.userId,
        name: data.name,
        type: data.type,
        balance: data.balance || 0,
        currency: data.currency || 'USD',
        isActive: data.isActive ?? true
      }
    });
  }

  static async findById(id: string, userId: string): Promise<Account | null> {
    return await prisma.account.findFirst({
      where: { id, userId }
    });
  }

  static async findMany(
    filters: AccountFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ accounts: Account[]; total: number }> {
    const where: any = {
      userId: filters.userId
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive'
      };
    }

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.account.count({ where })
    ]);

    return { accounts, total };
  }

  static async update(id: string, userId: string, data: UpdateAccountData): Promise<Account> {
    return await prisma.account.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.balance !== undefined && { balance: data.balance }),
        ...(data.currency && { currency: data.currency }),
        ...(data.isActive !== undefined && { isActive: data.isActive })
      }
    });
  }

  static async delete(id: string, userId: string): Promise<void> {
    // Check if account has transactions
    const transactionCount = await prisma.transaction.count({
      where: { accountId: id }
    });

    if (transactionCount > 0) {
      throw new Error('Cannot delete account with existing transactions. Please transfer or delete transactions first.');
    }

    await prisma.account.delete({
      where: { id }
    });
  }

  static async updateBalance(id: string, amount: number): Promise<Account> {
    return await prisma.account.update({
      where: { id },
      data: {
        balance: {
          increment: amount
        }
      }
    });
  }

  static async getTotalBalance(userId: string): Promise<number> {
    const result = await prisma.account.aggregate({
      where: { userId, isActive: true },
      _sum: { balance: true }
    });

    return Number(result._sum.balance || 0);
  }

  static async getAccountsByType(userId: string, type: string): Promise<Account[]> {
    return await prisma.account.findMany({
      where: { userId, type: type as any, isActive: true },
      orderBy: { name: 'asc' }
    });
  }
}
