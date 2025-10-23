import express, { Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AccountController } from '../controllers/AccountController';
import { body, query, validationResult } from 'express-validator';

const router = express.Router();

// Get all accounts
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().custom((value) => {
    if (value === '' || value === undefined || value === null) return true;
    return ['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'CASH', 'INVESTMENT', 'LOAN', 'OTHER'].includes(value);
  }).withMessage('Invalid account type'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
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
}, AccountController.getAccounts);

// Get single account
router.get('/:id', authenticate, AccountController.getAccount);

// Create new account
router.post('/', authenticate, [
  body('name').trim().notEmpty().withMessage('Account name is required'),
  body('type').isIn(['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'CASH', 'INVESTMENT', 'LOAN', 'OTHER']).withMessage('Invalid account type'),
  body('balance').optional().isFloat({ min: 0 }).withMessage('Balance must be a positive number'),
  body('currency').optional().isString().withMessage('Currency must be a string')
], (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
}, AccountController.createAccount);

// Update account
router.put('/:id', authenticate, [
  body('name').optional().trim().notEmpty().withMessage('Account name cannot be empty'),
  body('type').optional().isIn(['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'CASH', 'INVESTMENT', 'LOAN', 'OTHER']).withMessage('Invalid account type'),
  body('balance').optional().isFloat().withMessage('Balance must be a number'),
  body('currency').optional().isString().withMessage('Currency must be a string'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
}, AccountController.updateAccount);

// Delete account
router.delete('/:id', authenticate, AccountController.deleteAccount);

// Get account summary
router.get('/summary/overview', authenticate, AccountController.getAccountSummary);

// Get accounts by type
router.get('/type/:type', authenticate, [
  query('type').isIn(['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'CASH', 'INVESTMENT', 'LOAN', 'OTHER']).withMessage('Invalid account type')
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
}, AccountController.getAccountsByType);

export default router;
