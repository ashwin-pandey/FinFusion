import express, { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { LoanController } from '../controllers/LoanController';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Create loan
router.post('/', authenticate, [
  body('name').notEmpty().withMessage('Loan name is required'),
  body('type').isIn(['PERSONAL', 'HOME', 'CAR', 'EDUCATION', 'BUSINESS', 'CREDIT_CARD', 'OTHER']).withMessage('Invalid loan type'),
  body('originalPrincipal').isDecimal().withMessage('Original principal must be a valid number'),
  body('originalInterestRate').isDecimal().withMessage('Original interest rate must be a valid number'),
  body('originalTermMonths').isInt({ min: 1 }).withMessage('Original term must be a positive integer'),
  body('originalStartDate').isISO8601().withMessage('Original start date must be a valid date'),
  body('currentBalance').isDecimal().withMessage('Current balance must be a valid number'),
  body('accountId').isUUID().withMessage('Account ID must be a valid UUID'),
  body('currentInterestRate').optional().isDecimal().withMessage('Current interest rate must be a valid number'),
  body('remainingTermMonths').optional().isInt({ min: 0 }).withMessage('Remaining term must be a non-negative integer'),
  body('isExistingLoan').optional().isBoolean().withMessage('Is existing loan must be a boolean'),
  body('totalPaid').optional().isDecimal().withMessage('Total paid must be a valid number'),
  body('totalInterestPaid').optional().isDecimal().withMessage('Total interest paid must be a valid number'),
  body('lastPaymentDate').optional().isISO8601().withMessage('Last payment date must be a valid date')
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
}, LoanController.createLoan);

// Get all loans
router.get('/', authenticate, LoanController.getLoans);

// Get loan by ID
router.get('/:id', authenticate, [
  param('id').isUUID().withMessage('Invalid loan ID')
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
}, LoanController.getLoanById);

// Update loan
router.put('/:id', authenticate, [
  param('id').isUUID().withMessage('Invalid loan ID'),
  body('name').optional().notEmpty().withMessage('Loan name cannot be empty'),
  body('currentBalance').optional().isDecimal().withMessage('Current balance must be a valid number'),
  body('currentInterestRate').optional().isDecimal().withMessage('Current interest rate must be a valid number'),
  body('remainingTermMonths').optional().isInt({ min: 0 }).withMessage('Remaining term must be a non-negative integer'),
  body('status').optional().isIn(['ACTIVE', 'PAID_OFF', 'DEFAULTED', 'REFINANCED', 'PAUSED']).withMessage('Invalid loan status'),
  body('totalPaid').optional().isDecimal().withMessage('Total paid must be a valid number'),
  body('totalInterestPaid').optional().isDecimal().withMessage('Total interest paid must be a valid number'),
  body('lastPaymentDate').optional().isISO8601().withMessage('Last payment date must be a valid date'),
  body('nextPaymentDate').optional().isISO8601().withMessage('Next payment date must be a valid date')
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
}, LoanController.updateLoan);

// Delete loan
router.delete('/:id', authenticate, [
  param('id').isUUID().withMessage('Invalid loan ID')
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
}, LoanController.deleteLoan);

// Get loan summary
router.get('/summary/overview', authenticate, LoanController.getLoanSummary);

// Make loan payment
router.post('/:id/payments', authenticate, [
  param('id').isUUID().withMessage('Invalid loan ID'),
  body('amount').isDecimal().withMessage('Payment amount must be a valid number'),
  body('paymentDate').isISO8601().withMessage('Payment date must be a valid date'),
  body('description').optional().isString().withMessage('Description must be a string')
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
}, LoanController.makeLoanPayment);

// Get loan payments
router.get('/:id/payments', authenticate, [
  param('id').isUUID().withMessage('Invalid loan ID')
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
}, LoanController.getLoanPayments);

// Calculate EMI
router.get('/calculate/emi', authenticate, [
  query('principal').isDecimal().withMessage('Principal must be a valid number'),
  query('annualRate').isDecimal().withMessage('Annual rate must be a valid number'),
  query('termMonths').isInt({ min: 1 }).withMessage('Term must be a positive integer')
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
}, LoanController.calculateEMI);

// Get loan progress
router.get('/:id/progress', authenticate, [
  param('id').isUUID().withMessage('Invalid loan ID')
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
}, LoanController.getLoanProgress);

// Calculate pre-payment scenario
router.post('/:id/calculate-prepayment', authenticate, [
  param('id').isUUID().withMessage('Invalid loan ID'),
  body('amount').isDecimal().withMessage('Pre-payment amount must be a valid number')
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
}, LoanController.calculatePrePayment);

// Get pre-payment analytics
router.get('/analytics/prepayments', authenticate, LoanController.getPrePaymentAnalytics);

// Scheduled payments
router.post('/:loanId/scheduled-payments', authenticate, LoanController.createScheduledPayments);
router.delete('/payments/:paymentId', authenticate, LoanController.deleteScheduledPayment);
router.get('/overdue-payments', authenticate, LoanController.getOverduePayments);
router.get('/:loanId/payment-history', authenticate, LoanController.getPaymentHistory);

// Recalculate remaining terms for all loans
router.post('/recalculate-terms', authenticate, LoanController.recalculateRemainingTerms);

export default router;
