import { Request, Response } from 'express';
import { RecurringTransactionService } from '../services/RecurringTransactionService';
import { AuthRequest } from '../middleware/auth';

export class RecurringTransactionController {
  /**
   * Create a new recurring transaction
   */
  static async createRecurringTransaction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        amount,
        type,
        categoryId,
        accountId,
        description,
        recurringFrequency,
        startDate,
        endDate,
        paymentMethod
      } = req.body;

      if (!amount || !type || !categoryId || !recurringFrequency || !startDate) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
        return;
      }

      const recurringTransaction = await RecurringTransactionService.createRecurringTransaction({
        userId: req.user!.id,
        amount: parseFloat(amount),
        type,
        categoryId,
        accountId,
        description,
        recurringFrequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        paymentMethod
      });

      res.status(201).json({
        success: true,
        data: recurringTransaction
      });
    } catch (error: any) {
      console.error('Create recurring transaction error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create recurring transaction'
      });
    }
  }

  /**
   * Get all recurring transactions for the user
   */
  static async getRecurringTransactions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const recurringTransactions = await RecurringTransactionService.getUserRecurringTransactions(req.user!.id);

      res.status(200).json({
        success: true,
        data: recurringTransactions
      });
    } catch (error: any) {
      console.error('Get recurring transactions error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get recurring transactions'
      });
    }
  }

  /**
   * Delete a recurring transaction
   */
  static async deleteRecurringTransaction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await RecurringTransactionService.deleteRecurringTransaction(id, req.user!.id);

      res.status(200).json({
        success: true,
        message: 'Recurring transaction deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete recurring transaction error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete recurring transaction'
      });
    }
  }

  /**
   * Process recurring transactions (admin endpoint)
   */
  static async processRecurringTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.body;
      
      if (date) {
        await RecurringTransactionService.processRecurringTransactions(new Date(date));
      } else {
        await RecurringTransactionService.processRecurringTransactions();
      }

      res.status(200).json({
        success: true,
        message: 'Recurring transactions processed successfully'
      });
    } catch (error: any) {
      console.error('Process recurring transactions error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process recurring transactions'
      });
    }
  }
}


