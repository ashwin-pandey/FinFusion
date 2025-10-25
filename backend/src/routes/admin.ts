import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AdminController } from '../controllers/AdminController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

// Get all users
router.get('/users', AdminController.getAllUsers);

// Update user role
router.put('/users/:userId/role', [
  body('role').isIn(['ADMIN', 'MANAGER', 'USER']).withMessage('Invalid role')
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
}, AdminController.updateUserRole);

// Toggle user status (activate/deactivate)
router.put('/users/:userId/status', [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
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
}, AdminController.toggleUserStatus);

// Delete user
router.delete('/users/:userId', AdminController.deleteUser);

export default router;