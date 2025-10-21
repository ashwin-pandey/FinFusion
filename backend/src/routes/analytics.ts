import express, { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { query, validationResult } from 'express-validator';

const router = express.Router();

// Get dashboard overview
router.get('/overview', authenticate, [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
], (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
}, AnalyticsController.getDashboardOverview);

// Get spending trends
router.get('/trends', authenticate, [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  query('groupBy').optional().isIn(['day', 'week', 'month']).withMessage('Group by must be day, week, or month')
], (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
}, AnalyticsController.getSpendingTrends);

// Get category breakdown
router.get('/category-breakdown', authenticate, [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  query('type').optional().isIn(['INCOME', 'EXPENSE']).withMessage('Type must be INCOME or EXPENSE')
], (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
}, AnalyticsController.getCategoryBreakdown);

// Get budget performance
router.get('/budget-performance', authenticate, [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
], (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
}, AnalyticsController.getBudgetPerformance);

// Get financial insights
router.get('/insights', authenticate, AnalyticsController.getFinancialInsights);

export default router;