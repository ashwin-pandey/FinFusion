import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/ToastContainer';
import notificationService from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';

interface ToastData {
  id: string;
  title: string;
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  duration?: number;
}

interface NotificationContextType {
  showToast: (title: string, message: string, type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO', duration?: number) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const { user } = useAuth();

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((
    title: string, 
    message: string, 
    type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO',
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastData = {
      id,
      title,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    // Also save to database for persistence
    if (user?.id) {
      console.log('Creating notification:', { userId: user.id, title, message, type });
      notificationService.createNotification({
        userId: user.id,
        title,
        message,
        type
      }).then(() => {
        console.log('Notification saved to database successfully');
      }).catch((err: any) => {
        console.error('Failed to save notification to database:', err);
        console.error('Error response:', err.response);
        console.error('Error response data:', err.response?.data);
      });
    }
  }, [user]);

  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    showToast(title, message, 'SUCCESS', duration);
  }, [showToast]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    showToast(title, message, 'ERROR', duration);
  }, [showToast]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    showToast(title, message, 'WARNING', duration);
  }, [showToast]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    showToast(title, message, 'INFO', duration);
  }, [showToast]);

  const contextValue: NotificationContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </NotificationContext.Provider>
  );
};
