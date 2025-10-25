import { PrismaClient, Notification as PrismaNotification, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}

export interface UpdateNotificationData {
  title?: string;
  message?: string;
  type?: NotificationType;
  isRead?: boolean;
}

export interface NotificationFilters {
  userId: string;
  isRead?: boolean;
  type?: NotificationType;
}

export class NotificationModel {
  static async create(data: CreateNotificationData): Promise<Notification> {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type
      }
    });
  }

  static async findById(id: string): Promise<Notification | null> {
    return await prisma.notification.findUnique({
      where: { id }
    });
  }

  static async findMany(
    filters: NotificationFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: Notification[]; total: number }> {
    const where: any = {
      userId: filters.userId
    };

    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    return { notifications, total };
  }

  static async update(id: string, data: UpdateNotificationData): Promise<Notification> {
    return await prisma.notification.update({
      where: { id },
      data
    });
  }

  static async markAsRead(id: string): Promise<Notification> {
    return await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }

  static async delete(id: string): Promise<void> {
    await prisma.notification.delete({
      where: { id }
    });
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }
}


