import { API_ENDPOINTS } from '../config/api';
import { Notification, NotificationFilters } from '../types';

const fetchNotifications = async (filters?: NotificationFilters): Promise<{ notifications: Notification[]; pagination: any }> => {
  const token = localStorage.getItem('accessToken');
  const queryParams = new URLSearchParams();
  
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.isRead !== undefined) queryParams.append('isRead', filters.isRead.toString());
  if (filters?.type) queryParams.append('type', filters.type);

  const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch notifications');
  }

  const data = await response.json();
  return data.data;
};

const getNotificationById = async (id: string): Promise<Notification> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch notification');
  }

  const data = await response.json();
  return data.data;
};

const updateNotification = async (id: string, data: Partial<Notification>): Promise<Notification> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update notification');
  }

  const responseData = await response.json();
  return responseData.data;
};

const markAsRead = async (id: string): Promise<void> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to mark notification as read');
  }
};

const markAllAsRead = async (): Promise<void> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to mark all notifications as read');
  }
};

const deleteNotification = async (id: string): Promise<void> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete notification');
  }
};

const getUnreadCount = async (): Promise<number> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/unread/count`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch unread count');
  }

  const data = await response.json();
  return data.data.count;
};

const createNotification = async (data: { userId: string; title: string; message: string; type: string }): Promise<void> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create notification');
  }
};

export default {
  fetchNotifications,
  getNotificationById,
  updateNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification,
};
