import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { AuthRequest } from '../middleware/auth';

export class AnalyticsController {
  static async getDashboardOverview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const overview = await AnalyticsService.getDashboardOverview(req.user!.id, start, end);

      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      console.error('Get dashboard overview error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard overview'
      });
    }
  }

  static async getSpendingTrends(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate, groupBy } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const validGroupBy = ['day', 'week', 'month', 'quarter', 'year'];
      const groupByParam = validGroupBy.includes(groupBy as string) 
        ? (groupBy as 'day' | 'week' | 'month' | 'quarter' | 'year') 
        : 'month';

      const trends = await AnalyticsService.getSpendingTrends(
        req.user!.id,
        start,
        end,
        groupByParam
      );

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('Get spending trends error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch spending trends'
      });
    }
  }

  static async getCategoryBreakdown(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate, type } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const typeParam = type as 'INCOME' | 'EXPENSE';

      const breakdown = await AnalyticsService.getCategoryBreakdown(
        req.user!.id,
        start,
        end,
        typeParam
      );

      res.json({
        success: true,
        data: breakdown
      });
    } catch (error) {
      console.error('Get category breakdown error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch category breakdown'
      });
    }
  }

  static async getBudgetPerformance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const performance = await AnalyticsService.getBudgetPerformance(req.user!.id, start, end);

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

  static async getFinancialInsights(req: AuthRequest, res: Response): Promise<void> {
    try {
      const insights = await AnalyticsService.getFinancialInsights(req.user!.id);

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error('Get financial insights error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch financial insights'
      });
    }
  }
}
