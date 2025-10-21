import express, { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { BudgetController } from '../controllers/BudgetController';
import { body, validationResult, query } from 'express-validator';

const router = express.Router();

// Get all budgets
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('periodType').optional().isIn(['MONTHLY', 'QUARTERLY', 'YEARLY']).withMessage('Invalid period type'),
  query('categoryId').optional().isUUID().withMessage('Category ID must be a valid UUID')
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
}, BudgetController.getBudgets);

// Get single budget
router.get('/:id', authenticate, BudgetController.getBudgetById);

// Create budget
router.post('/', authenticate, [
  body('categoryId').isUUID().withMessage('Category ID must be a valid UUID'),
  body('amount').isDecimal().withMessage('Amount must be a valid decimal'),
  body('periodType').isIn(['MONTHLY', 'QUARTERLY', 'YEARLY']).withMessage('Invalid period type'),
  body('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
  body('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
  body('alertThreshold').optional().isInt({ min: 1, max: 100 }).withMessage('Alert threshold must be between 1 and 100'),
  body('allowRollover').optional().isBoolean().withMessage('Allow rollover must be a boolean')
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
}, BudgetController.createBudget);

// Update budget
router.put('/:id', authenticate, [
  body('amount').optional().isDecimal().withMessage('Amount must be a valid decimal'),
  body('periodType').optional().isIn(['MONTHLY', 'QUARTERLY', 'YEARLY']).withMessage('Invalid period type'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  body('alertThreshold').optional().isInt({ min: 1, max: 100 }).withMessage('Alert threshold must be between 1 and 100'),
  body('allowRollover').optional().isBoolean().withMessage('Allow rollover must be a boolean')
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
}, BudgetController.updateBudget);

// Delete budget
router.delete('/:id', authenticate, BudgetController.deleteBudget);

// Get budget recommendations
router.get('/recommendations', authenticate, BudgetController.getBudgetRecommendations);

// Get budget analytics
router.get('/analytics', authenticate, BudgetController.getBudgetAnalytics);

// Get budget performance
router.get('/performance', authenticate, BudgetController.getBudgetPerformance);

// Check budget alerts
router.post('/check-alerts', authenticate, BudgetController.checkBudgetAlerts);

// Get budget alerts
router.get('/:budgetId/alerts', authenticate, BudgetController.getBudgetAlerts);

// Acknowledge alert
router.put('/alerts/:alertId/acknowledge', authenticate, BudgetController.acknowledgeAlert);

export default router;