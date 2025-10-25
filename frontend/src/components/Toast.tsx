import React, { useEffect } from 'react';
import { CheckmarkCircle24Regular, ErrorCircle24Regular, Warning24Regular, Info24Regular } from '@fluentui/react-icons';
import './Toast.css';

interface ToastProps {
  id: string;
  title: string;
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, title, message, type, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'SUCCESS':
        return <CheckmarkCircle24Regular className="toast-icon success" />;
      case 'ERROR':
        return <ErrorCircle24Regular className="toast-icon error" />;
      case 'WARNING':
        return <Warning24Regular className="toast-icon warning" />;
      case 'INFO':
        return <Info24Regular className="toast-icon info" />;
      default:
        return <Info24Regular className="toast-icon info" />;
    }
  };

  return (
    <div className={`toast toast-${type.toLowerCase()}`}>
      <div className="toast-content">
        {getIcon()}
        <div className="toast-text">
          <div className="toast-title">{title}</div>
          <div className="toast-message">{message}</div>
        </div>
        <button className="toast-close" onClick={() => onClose(id)}>
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;


