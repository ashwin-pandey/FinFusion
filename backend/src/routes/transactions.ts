import express, { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { TransactionController } from '../controllers/TransactionController';
import { body, validationResult, query } from 'express-validator';

const router = express.Router();

// Get all transactions with filtering
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['INCOME', 'EXPENSE', 'TRANSFER']).withMessage('Type must be INCOME, EXPENSE, or TRANSFER'),
  query('categoryId').optional().isUUID().withMessage('Category ID must be a valid UUID'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  query('search').optional().isString().withMessage('Search must be a string')
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
}, TransactionController.getTransactions);

// Get single transaction
router.get('/:id', authenticate, TransactionController.getTransactionById);

// Create transaction
router.post('/', authenticate, [
  body('amount').isDecimal().withMessage('Amount must be a valid decimal'),
  body('type').isIn(['INCOME', 'EXPENSE', 'TRANSFER']).withMessage('Type must be INCOME, EXPENSE, or TRANSFER'),
  body('categoryId').optional().isUUID().withMessage('Category ID must be a valid UUID'),
  body('accountId').optional().isUUID().withMessage('Account ID must be a valid UUID'),
  body('toAccountId').optional().isUUID().withMessage('To Account ID must be a valid UUID'),
  body('date').isISO8601().withMessage('Date must be a valid ISO date'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('paymentMethodId').optional().isUUID().withMessage('Payment method ID must be a valid UUID'),
  body('isRecurring').optional().isBoolean().withMessage('Is recurring must be a boolean'),
  body('recurringFrequency').optional().isIn(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).withMessage('Invalid recurring frequency')
], (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  // Custom validation for transfers
  const { type, categoryId, accountId, toAccountId } = req.body;
  
  if (type === 'TRANSFER') {
    // For transfers, categoryId is not required, but accountId and toAccountId are required
    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: [{ param: 'accountId', msg: 'Account ID is required for transfers', location: 'body' }]
      });
    }
    if (!toAccountId) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: [{ param: 'toAccountId', msg: 'To Account ID is required for transfers', location: 'body' }]
      });
    }
    if (accountId === toAccountId) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: [{ param: 'toAccountId', msg: 'Cannot transfer to the same account', location: 'body' }]
      });
    }
  } else {
    // For non-transfers, categoryId is required
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: [{ param: 'categoryId', msg: 'Category ID is required for income and expense transactions', location: 'body' }]
      });
    }
  }

  next();
}, TransactionController.createTransaction);

// Update transaction
router.put('/:id', authenticate, [
  body('amount').optional().isDecimal().withMessage('Amount must be a valid decimal'),
  body('type').optional().isIn(['INCOME', 'EXPENSE']).withMessage('Type must be INCOME or EXPENSE'),
  body('categoryId').optional().isUUID().withMessage('Category ID must be a valid UUID'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('paymentMethodId').optional().isUUID().withMessage('Payment method ID must be a valid UUID'),
  body('isRecurring').optional().isBoolean().withMessage('Is recurring must be a boolean'),
  body('recurringFrequency').optional().isIn(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).withMessage('Invalid recurring frequency')
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
}, TransactionController.updateTransaction);

// Delete transaction
router.delete('/:id', authenticate, TransactionController.deleteTransaction);

// Get transaction analytics
router.get('/analytics/overview', authenticate, TransactionController.getTransactionAnalytics);

// Import transactions
router.post('/import', authenticate, TransactionController.importTransactions);

// Export transactions
router.get('/export', authenticate, TransactionController.exportTransactions);

export default router;