import { NotificationModel, CreateNotificationData, UpdateNotificationData, NotificationFilters } from '../models/Notification';

export interface NotificationListResult {
  notifications: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class NotificationService {
  static async createNotification(data: CreateNotificationData): Promise<any> {
    return await NotificationModel.create(data);
  }

  static async getNotifications(
    userId: string,
    filters: Partial<NotificationFilters> = {},
    page: number = 1,
    limit: number = 20
  ): Promise<NotificationListResult> {
    const notificationFilters: NotificationFilters = {
      userId,
      ...filters
    };

    const { notifications, total } = await NotificationModel.findMany(
      notificationFilters,
      page,
      limit
    );

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getNotificationById(id: string, userId: string): Promise<any> {
    const notification = await NotificationModel.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found');
    }
    return notification;
  }

  static async updateNotification(id: string, data: UpdateNotificationData, userId: string): Promise<any> {
    const notification = await NotificationModel.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found');
    }
    return await NotificationModel.update(id, data);
  }

  static async markAsRead(id: string, userId: string): Promise<any> {
    const notification = await NotificationModel.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found');
    }
    return await NotificationModel.markAsRead(id);
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await NotificationModel.markAllAsRead(userId);
  }

  static async deleteNotification(id: string, userId: string): Promise<void> {
    const notification = await NotificationModel.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found');
    }
    await NotificationModel.delete(id);
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return await NotificationModel.getUnreadCount(userId);
  }

  // Helper method to create system notifications
  static async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO' = 'INFO'
  ): Promise<any> {
    return await NotificationModel.create({
      userId,
      title,
      message,
      type
    });
  }
}


