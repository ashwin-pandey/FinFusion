import express, { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { PaymentMethodController } from '../controllers/PaymentMethodController';
import { body, validationResult, param } from 'express-validator';

const router = express.Router();

// Get all payment methods
router.get('/', PaymentMethodController.getAllPaymentMethods);

// Get payment method by code
router.get('/code/:code', [
  param('code').isString().withMessage('Code must be a string')
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
}, PaymentMethodController.getPaymentMethodByCode);

// Create payment method (Admin only)
router.post('/', authenticate, [
  body('code').isString().withMessage('Code is required'),
  body('name').isString().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('isActive').optional().isBoolean().withMessage('IsActive must be a boolean')
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
}, PaymentMethodController.createPaymentMethod);

// Update payment method (Admin only)
router.put('/:id', authenticate, [
  param('id').isUUID().withMessage('ID must be a valid UUID'),
  body('code').optional().isString().withMessage('Code must be a string'),
  body('name').optional().isString().withMessage('Name must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('isActive').optional().isBoolean().withMessage('IsActive must be a boolean')
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
}, PaymentMethodController.updatePaymentMethod);

// Delete payment method (Admin only)
router.delete('/:id', authenticate, [
  param('id').isUUID().withMessage('ID must be a valid UUID')
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
}, PaymentMethodController.deletePaymentMethod);

// Deactivate payment method (Admin only)
router.put('/:id/deactivate', authenticate, [
  param('id').isUUID().withMessage('ID must be a valid UUID')
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
}, PaymentMethodController.deactivatePaymentMethod);

export default router;


