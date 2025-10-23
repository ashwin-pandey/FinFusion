import { Request, Response } from 'express';
import { TransactionService } from '../services/TransactionService';
import { BudgetService } from '../services/BudgetService';
import { AuthRequest } from '../middleware/auth';

export class TransactionController {
  static async getTransactions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        categoryId,
        startDate,
        endDate,
        search,
        paymentMethod,
        isRecurring
      } = req.query;

      const filters: any = {};
      
      if (type) filters.type = type;
      if (categoryId) filters.categoryId = categoryId;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (search) filters.search = search;
      if (paymentMethod) filters.paymentMethod = paymentMethod;
      if (isRecurring !== undefined) filters.isRecurring = isRecurring === 'true';

      const result = await TransactionService.getTransactions(
        req.user!.id,
        filters,
        Number(page),
        Number(limit)
      );

      res.json({
        success: true,
        data: result.transactions,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch transactions'
      });
    }
  }

  static async getTransactionById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const transaction = await TransactionService.getTransactionById(id, req.user!.id);

      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Get transaction error:', error);
      const statusCode = error instanceof Error && error.message === 'Transaction not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transaction'
      });
    }
  }

  static async createTransaction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        amount,
        type,
        categoryId,
        accountId,
        date,
        description,
        paymentMethod,
        isRecurring,
        recurringFrequency
      } = req.body;

      const transactionData = {
        userId: req.user!.id,
        amount: parseFloat(amount),
        type,
        categoryId,
        accountId,
        date: new Date(date),
        description,
        paymentMethod,
        isRecurring: isRecurring || false,
        recurringFrequency
      };

      const transaction = await TransactionService.createTransaction(transactionData);

      // Check budget alerts after creating transaction
      try {
        await BudgetService.checkBudgetAlerts(req.user!.id);
      } catch (alertError) {
        console.error('Budget alert check failed:', alertError);
        // Don't fail the transaction creation if alert checking fails
      }

      res.status(201).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      const statusCode = error instanceof Error && (
        error.message === 'Category not found' || 
        error.message === 'Access denied to category'
      ) ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create transaction'
      });
    }
  }

  static async updateTransaction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Convert amount and date if provided
      if (updateData.amount) updateData.amount = parseFloat(updateData.amount);
      if (updateData.date) updateData.date = new Date(updateData.date);

      const transaction = await TransactionService.updateTransaction(id, req.user!.id, updateData);

      // Check budget alerts after updating transaction
      try {
        await BudgetService.checkBudgetAlerts(req.user!.id);
      } catch (alertError) {
        console.error('Budget alert check failed:', alertError);
        // Don't fail the transaction update if alert checking fails
      }

      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      const statusCode = error instanceof Error && (
        error.message === 'Transaction not found' ||
        error.message === 'Category not found' ||
        error.message === 'Access denied to category'
      ) ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update transaction'
      });
    }
  }

  static async deleteTransaction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await TransactionService.deleteTransaction(id, req.user!.id);

      res.json({
        success: true,
        message: 'Transaction deleted successfully'
      });
    } catch (error) {
      console.error('Delete transaction error:', error);
      const statusCode = error instanceof Error && error.message === 'Transaction not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete transaction'
      });
    }
  }

  static async getTransactionAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const analytics = await TransactionService.getTransactionAnalytics(
        req.user!.id,
        start,
        end
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get transaction analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch transaction analytics'
      });
    }
  }

  static async importTransactions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { transactions } = req.body;

      if (!Array.isArray(transactions)) {
        res.status(400).json({
          success: false,
          error: 'Transactions must be an array'
        });
        return;
      }

      const result = await TransactionService.importTransactions(req.user!.id, transactions);

      res.json({
        success: true,
        data: {
          imported: result.success,
          errors: result.errors,
          total: transactions.length
        }
      });
    } catch (error) {
      console.error('Import transactions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to import transactions'
      });
    }
  }

  static async exportTransactions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate, format = 'csv' } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const filters: any = {};
      if (start) filters.startDate = start;
      if (end) filters.endDate = end;

      const result = await TransactionService.getTransactions(
        req.user!.id,
        filters,
        1,
        10000 // Large limit for export
      );

      if (format === 'csv') {
        // Convert to CSV format
        const csvHeader = 'Date,Type,Category,Amount,Description,Payment Method\n';
        const csvRows = result.transactions.map(transaction => {
          return [
            transaction.date.toISOString().split('T')[0],
            transaction.type,
            transaction.category?.name || 'Unknown',
            transaction.amount,
            transaction.description || '',
            transaction.paymentMethod || ''
          ].join(',');
        }).join('\n');

        const csv = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
        res.send(csv);
      } else if (format === 'json') {
        res.json({
          success: true,
          data: result.transactions
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Unsupported export format'
        });
      }
    } catch (error) {
      console.error('Export transactions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export transactions'
      });
    }
  }
}
