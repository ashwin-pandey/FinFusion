import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export class NotificationController {
  static async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, isRead, type } = req.query;
      const userId = req.user!.id;

      const notifications = await NotificationService.getNotifications(
        userId,
        {
          isRead: isRead ? String(isRead).toLowerCase() === 'true' : undefined,
          type: type as any
        },
        Number(page),
        Number(limit)
      );

      res.json({ success: true, data: notifications });
    } catch (error: any) {
      logger.error('Error getting notifications:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getNotificationById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const notification = await NotificationService.getNotificationById(id, userId);
      res.json({ success: true, data: notification });
    } catch (error: any) {
      logger.error(`Error getting notification by ID ${req.params.id}:`, error);
      res.status(404).json({ success: false, error: error.message });
    }
  }

  static async updateNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, message, type, isRead } = req.body;
      const userId = req.user!.id;

      const notification = await NotificationService.updateNotification(
        id,
        { title, message, type, isRead },
        userId
      );

      res.json({ success: true, data: notification });
    } catch (error: any) {
      logger.error(`Error updating notification ID ${req.params.id}:`, error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await NotificationService.markAsRead(id, userId);
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error: any) {
      logger.error(`Error marking notification as read ID ${req.params.id}:`, error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      await NotificationService.markAllAsRead(userId);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
      logger.error('Error marking all notifications as read:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deleteNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await NotificationService.deleteNotification(id, userId);
      res.status(204).send(); // No content
    } catch (error: any) {
      logger.error(`Error deleting notification ID ${req.params.id}:`, error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const count = await NotificationService.getUnreadCount(userId);
      res.json({ success: true, data: { count } });
    } catch (error: any) {
      logger.error('Error getting unread count:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, message, type } = req.body;
      const userId = req.user!.id;

      const notification = await NotificationService.createNotification({
        userId,
        title,
        message,
        type
      });

      res.status(201).json({ success: true, data: notification });
    } catch (error: any) {
      logger.error('Error creating notification:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }
}


