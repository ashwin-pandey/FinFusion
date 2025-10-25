import express from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authenticate } from '../middleware/auth';
import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Middleware to handle validation errors
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
  }
  next();
};

// All routes require authentication
router.use(authenticate);

// Get notifications
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('isRead').optional().isBoolean().withMessage('isRead must be a boolean'),
  query('type').optional().isIn(['SUCCESS', 'ERROR', 'WARNING', 'INFO']).withMessage('Invalid notification type'),
], validate, NotificationController.getNotifications);

// Get notification by ID
router.get('/:id', [
  param('id').isUUID().withMessage('ID must be a valid UUID'),
], validate, NotificationController.getNotificationById);

// Update notification
router.put('/:id', [
  param('id').isUUID().withMessage('ID must be a valid UUID'),
  body('title').optional().isString().notEmpty().withMessage('Title cannot be empty'),
  body('message').optional().isString().notEmpty().withMessage('Message cannot be empty'),
  body('type').optional().isIn(['SUCCESS', 'ERROR', 'WARNING', 'INFO']).withMessage('Invalid notification type'),
  body('isRead').optional().isBoolean().withMessage('isRead must be a boolean'),
], validate, NotificationController.updateNotification);

// Mark notification as read
router.patch('/:id/read', [
  param('id').isUUID().withMessage('ID must be a valid UUID'),
], validate, NotificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', NotificationController.markAllAsRead);

// Delete notification
router.delete('/:id', [
  param('id').isUUID().withMessage('ID must be a valid UUID'),
], validate, NotificationController.deleteNotification);

// Get unread count
router.get('/unread/count', NotificationController.getUnreadCount);

// Create notification
router.post('/', [
  body('title').isString().notEmpty().withMessage('Title is required'),
  body('message').isString().notEmpty().withMessage('Message is required'),
  body('type').isIn(['SUCCESS', 'ERROR', 'WARNING', 'INFO']).withMessage('Invalid notification type'),
], validate, NotificationController.createNotification);

export default router;


