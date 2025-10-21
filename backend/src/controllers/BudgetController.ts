import { Request, Response } from 'express';
import { BudgetService } from '../services/BudgetService';
import { AuthRequest } from '../middleware/auth';

export class BudgetController {
  static async getBudgets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        periodType,
        categoryId
      } = req.query;

      const filters: any = {};
      if (periodType) filters.periodType = periodType;
      if (categoryId) filters.categoryId = categoryId;

      const result = await BudgetService.getBudgets(
        req.user!.id,
        filters,
        Number(page),
        Number(limit)
      );

      res.json({
        success: true,
        data: result.budgets,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get budgets error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch budgets'
      });
    }
  }

  static async getBudgetById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const budget = await BudgetService.getBudgetById(id, req.user!.id);

      res.json({
        success: true,
        data: budget
      });
    } catch (error) {
      console.error('Get budget error:', error);
      const statusCode = error instanceof Error && error.message === 'Budget not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch budget'
      });
    }
  }

  static async createBudget(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        categoryId,
        amount,
        periodType,
        startDate,
        endDate,
        alertThreshold,
        allowRollover
      } = req.body;

      const budgetData = {
        userId: req.user!.id,
        categoryId,
        amount: parseFloat(amount),
        periodType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        alertThreshold: alertThreshold || 80,
        allowRollover: allowRollover || false
      };

      const budget = await BudgetService.createBudget(budgetData);

      res.status(201).json({
        success: true,
        data: budget
      });
    } catch (error) {
      console.error('Create budget error:', error);
      const statusCode = error instanceof Error && (
        error.message === 'Category not found' ||
        error.message === 'Access denied to category' ||
        error.message === 'Budget already exists for this category and time period'
      ) ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create budget'
      });
    }
  }

  static async updateBudget(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Convert amount and dates if provided
      if (updateData.amount) updateData.amount = parseFloat(updateData.amount);
      if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
      if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

      const budget = await BudgetService.updateBudget(id, req.user!.id, updateData);

      res.json({
        success: true,
        data: budget
      });
    } catch (error) {
      console.error('Update budget error:', error);
      const statusCode = error instanceof Error && (
        error.message === 'Budget not found' ||
        error.message === 'Budget already exists for this category and time period'
      ) ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update budget'
      });
    }
  }

  static async deleteBudget(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await BudgetService.deleteBudget(id, req.user!.id);

      res.json({
        success: true,
        message: 'Budget deleted successfully'
      });
    } catch (error) {
      console.error('Delete budget error:', error);
      const statusCode = error instanceof Error && error.message === 'Budget not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete budget'
      });
    }
  }

  static async getBudgetRecommendations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const recommendations = await BudgetService.getBudgetRecommendations(req.user!.id);

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Get budget recommendations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch budget recommendations'
      });
    }
  }

  static async getBudgetAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const analytics = await BudgetService.getBudgetAnalytics(req.user!.id, start, end);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get budget analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch budget analytics'
      });
    }
  }

  static async getBudgetPerformance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const performance = await BudgetService.getBudgetPerformance(req.user!.id, start, end);

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      console.error('Get budget performance error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch budget performance'
      });
    }
  }

  static async checkBudgetAlerts(req: AuthRequest, res: Response): Promise<void> {
    try {
      await BudgetService.checkBudgetAlerts(req.user!.id);

      res.json({
        success: true,
        message: 'Budget alerts checked successfully'
      });
    } catch (error) {
      console.error('Check budget alerts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check budget alerts'
      });
    }
  }

  static async getBudgetAlerts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { budgetId } = req.params;
      const alerts = await BudgetService.getBudgetAlerts(budgetId, req.user!.id);

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Get budget alerts error:', error);
      const statusCode = error instanceof Error && error.message === 'Budget not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch budget alerts'
      });
    }
  }

  static async acknowledgeAlert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      await BudgetService.acknowledgeAlert(alertId, req.user!.id);

      res.json({
        success: true,
        message: 'Alert acknowledged successfully'
      });
    } catch (error) {
      console.error('Acknowledge alert error:', error);
      const statusCode = error instanceof Error && error.message === 'Alert not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to acknowledge alert'
      });
    }
  }
}
