import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AccountService } from '../services/AccountService';
import { body, query, validationResult } from 'express-validator';

export class AccountController {
  static async getAccounts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        isActive,
        search
      } = req.query;

      const filters: any = {};
      if (type && type !== '') filters.type = type;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (search && search !== '') filters.search = search;

      const result = await AccountService.getAccounts(
        req.user!.id,
        filters,
        Number(page),
        Number(limit)
      );


      res.json({
        success: true,
        data: {
          accounts: result.accounts,
          pagination: result.pagination
        }
      });
    } catch (error) {
      console.error('Get accounts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch accounts'
      });
    }
  }

  static async getAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const account = await AccountService.getAccount(id, req.user!.id);

      res.json({
        success: true,
        data: account
      });
    } catch (error) {
      console.error('Get account error:', error);
      const statusCode = error instanceof Error && error.message === 'Account not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch account'
      });
    }
  }

  static async createAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, type, balance, currency } = req.body;

      const accountData = {
        userId: req.user!.id,
        name,
        type,
        balance: balance ? parseFloat(balance) : 0,
        currency: currency || 'USD'
      };

      const account = await AccountService.createAccount(accountData);

      res.status(201).json({
        success: true,
        data: account
      });
    } catch (error) {
      console.error('Create account error:', error);
      const statusCode = error instanceof Error && error.message === 'User not found' ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create account'
      });
    }
  }

  static async updateAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Convert balance if provided
      if (updateData.balance) {
        updateData.balance = parseFloat(updateData.balance);
      }

      const account = await AccountService.updateAccount(id, req.user!.id, updateData);

      res.json({
        success: true,
        data: account
      });
    } catch (error) {
      console.error('Update account error:', error);
      const statusCode = error instanceof Error && error.message === 'Account not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update account'
      });
    }
  }

  static async deleteAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await AccountService.deleteAccount(id, req.user!.id);

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      const statusCode = error instanceof Error && (
        error.message === 'Account not found' || 
        error.message.includes('Cannot delete account with existing transactions')
      ) ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete account'
      });
    }
  }

  static async getAccountSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const summary = await AccountService.getAccountSummary(req.user!.id);

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get account summary error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get account summary'
      });
    }
  }

  static async getAccountsByType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const accounts = await AccountService.getAccountsByType(req.user!.id, type);

      res.json({
        success: true,
        data: accounts
      });
    } catch (error) {
      console.error('Get accounts by type error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get accounts by type'
      });
    }
  }
}
