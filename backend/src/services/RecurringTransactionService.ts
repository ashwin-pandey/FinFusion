import { PrismaClient } from '@prisma/client';
import { TransactionModel } from '../models/Transaction';
import { AccountModel } from '../models/Account';

const prisma = new PrismaClient();

export interface CreateRecurringTransactionData {
  userId: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  accountId?: string;
  description: string;
  recurringFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: Date;
  endDate?: Date;
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'UPI' | 'OTHER';
}

export class RecurringTransactionService {
  /**
   * Create a recurring transaction template
   */
  static async createRecurringTransaction(data: CreateRecurringTransactionData): Promise<any> {
    return await prisma.transaction.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        accountId: data.accountId,
        date: data.startDate,
        description: data.description,
        paymentMethod: data.paymentMethod,
        isRecurring: true,
        recurringFrequency: data.recurringFrequency
      }
    });
  }

  /**
   * Process all recurring transactions for a given date
   * This should be called by a cron job or scheduler
   */
  static async processRecurringTransactions(date: Date = new Date()): Promise<void> {
    console.log(`Processing recurring transactions for ${date.toISOString()}`);

    // Get all recurring transactions
    const recurringTransactions = await prisma.transaction.findMany({
      where: {
        isRecurring: true
      },
      include: {
        user: true,
        category: true,
        account: true
      }
    });

    for (const recurringTx of recurringTransactions) {
      try {
        // Check if we should create a transaction for this date
        const shouldCreate = await this.shouldCreateTransaction(recurringTx, date);
        
        if (shouldCreate) {
          // Check if transaction already exists for this period
          const existingTransaction = await this.findExistingTransaction(recurringTx, date);
          
          if (!existingTransaction) {
            await this.createRecurringInstance(recurringTx, date);
            console.log(`Created recurring transaction for user ${recurringTx.userId} on ${date.toISOString()}`);
          }
        }
      } catch (error) {
        console.error(`Error processing recurring transaction ${recurringTx.id}:`, error);
      }
    }
  }

  /**
   * Check if a recurring transaction should be created for the given date
   */
  private static async shouldCreateTransaction(recurringTx: any, date: Date): Promise<boolean> {
    const startDate = new Date(recurringTx.date);
    const today = new Date(date);
    
    // Don't create if before start date
    if (today < startDate) return false;

    // Don't create if after end date (if specified)
    if (recurringTx.endDate && today > new Date(recurringTx.endDate)) return false;

    const frequency = recurringTx.recurringFrequency;
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    switch (frequency) {
      case 'DAILY':
        return daysDiff >= 0;
      
      case 'WEEKLY':
        return daysDiff >= 0 && daysDiff % 7 === 0;
      
      case 'MONTHLY':
        return this.isMonthlyMatch(startDate, today);
      
      case 'QUARTERLY':
        return this.isQuarterlyMatch(startDate, today);
      
      case 'YEARLY':
        return this.isYearlyMatch(startDate, today);
      
      default:
        return false;
    }
  }

  /**
   * Check if dates match for monthly recurrence
   */
  private static isMonthlyMatch(startDate: Date, currentDate: Date): boolean {
    return startDate.getDate() === currentDate.getDate();
  }

  /**
   * Check if dates match for quarterly recurrence
   */
  private static isQuarterlyMatch(startDate: Date, currentDate: Date): boolean {
    const startMonth = startDate.getMonth();
    const currentMonth = currentDate.getMonth();
    const startDay = startDate.getDate();
    const currentDay = currentDate.getDate();
    
    // Check if it's the same day and the month difference is a multiple of 3
    return startDay === currentDay && (currentMonth - startMonth) % 3 === 0;
  }

  /**
   * Check if dates match for yearly recurrence
   */
  private static isYearlyMatch(startDate: Date, currentDate: Date): boolean {
    return startDate.getMonth() === currentDate.getMonth() && 
           startDate.getDate() === currentDate.getDate();
  }

  /**
   * Find existing transaction for the same recurring pattern
   */
  private static async findExistingTransaction(recurringTx: any, date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.transaction.findFirst({
      where: {
        userId: recurringTx.userId,
        amount: recurringTx.amount,
        type: recurringTx.type,
        categoryId: recurringTx.categoryId,
        accountId: recurringTx.accountId,
        description: recurringTx.description,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        isRecurring: false // Don't match other recurring templates
      }
    });
  }

  /**
   * Create an instance of a recurring transaction
   */
  private static async createRecurringInstance(recurringTx: any, date: Date): Promise<any> {
    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: recurringTx.userId,
        amount: recurringTx.amount,
        type: recurringTx.type,
        categoryId: recurringTx.categoryId,
        accountId: recurringTx.accountId,
        date: date,
        description: recurringTx.description,
        paymentMethod: recurringTx.paymentMethod,
        isRecurring: false, // This is an instance, not a template
        recurringFrequency: null
      }
    });

    // Update account balance if account is specified
    if (recurringTx.accountId) {
      const account = await AccountModel.findById(recurringTx.accountId, recurringTx.userId);
      if (account) {
        const amountChange = recurringTx.type === 'INCOME' ? recurringTx.amount : -recurringTx.amount;
        await AccountModel.updateBalance(recurringTx.accountId, amountChange);
      }
    }

    return transaction;
  }

  /**
   * Get all recurring transactions for a user
   */
  static async getUserRecurringTransactions(userId: string): Promise<any[]> {
    return await prisma.transaction.findMany({
      where: {
        userId: userId,
        isRecurring: true
      },
      include: {
        category: true,
        account: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Delete a recurring transaction template
   */
  static async deleteRecurringTransaction(transactionId: string, userId: string): Promise<void> {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: userId,
        isRecurring: true
      }
    });

    if (!transaction) {
      throw new Error('Recurring transaction not found');
    }

    await prisma.transaction.delete({
      where: {
        id: transactionId
      }
    });
  }
}
