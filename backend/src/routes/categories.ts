import express, { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { CategoryController } from '../controllers/CategoryController';
import { body, validationResult, query } from 'express-validator';

const router = express.Router();

// Get all categories
router.get('/', authenticate, [
  query('type').optional().isIn(['INCOME', 'EXPENSE']).withMessage('Type must be INCOME or EXPENSE'),
  query('isSystem').optional().isBoolean().withMessage('Is system must be a boolean')
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
}, CategoryController.getCategories);

// Get single category
router.get('/:id', authenticate, CategoryController.getCategoryById);

// Create custom category
router.post('/', authenticate, [
  body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('type').isIn(['INCOME', 'EXPENSE']).withMessage('Type must be INCOME or EXPENSE'),
  body('icon').optional().isString().withMessage('Icon must be a string'),
  body('color').optional().isString().withMessage('Color must be a string'),
  body('parentCategoryId').optional().isUUID().withMessage('Parent category ID must be a valid UUID')
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
}, CategoryController.createCategory);

// Update category
router.put('/:id', authenticate, [
  body('name').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('icon').optional().isString().withMessage('Icon must be a string'),
  body('color').optional().isString().withMessage('Color must be a string'),
  body('parentCategoryId').optional().isUUID().withMessage('Parent category ID must be a valid UUID')
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
}, CategoryController.updateCategory);

// Delete category
router.delete('/:id', authenticate, CategoryController.deleteCategory);

// Get category hierarchy
router.get('/hierarchy', authenticate, CategoryController.getCategoryHierarchy);

// Get category statistics
router.get('/stats', authenticate, CategoryController.getCategoryStats);

export default router;