import React, { useState } from 'react';
import { Button } from '@fluentui/react-components';
import { 
  Alert24Regular, 
  Navigation24Regular, 
  SignOut24Regular,
  Person24Regular,
  Dismiss24Regular
} from '@fluentui/react-icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import './TopBar.css';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfileClick = () => {
    setShowProfilePanel(!showProfilePanel);
    setShowNotificationPanel(false);
  };

  const handleNotificationToggle = () => {
    // DISABLED: Notification panel temporarily disabled
    // setShowNotificationPanel(!showNotificationPanel);
    // setShowProfilePanel(false);
    // if (!showNotificationPanel) {
    //   fetchNotifications();
    // }
    console.log('Notification panel is temporarily disabled');
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      // You could add a toast notification here if you want
      console.log('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleManageProfile = () => {
    navigate('/profile');
    setShowProfilePanel(false);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Button
            className="menu-btn"
            appearance="subtle"
            icon={<Navigation24Regular />}
            onClick={onMenuClick}
          />
          <h1 className="topbar-title">FinFusion</h1>
        </div>
        
        <div className="topbar-right">
          {/* DISABLED: Notification button temporarily disabled */}
          {/* <Button
            className="notification-btn"
            appearance="subtle"
            icon={<Alert24Regular />}
            onClick={handleNotificationToggle}
          >
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </Button> */}
          
          <Button
            className="profile-btn"
            appearance="subtle"
            icon={<Person24Regular />}
            onClick={handleProfileClick}
          >
            {/* {user?.username} */}
          </Button>
        </div>
      </div>

      {/* Profile Panel */}
      {showProfilePanel && (
        <>
          <div className="panel-backdrop" onClick={() => setShowProfilePanel(false)} />
          <div className="profile-panel show">
            <div className="profile-panel-header">
              <h3>Profile</h3>
              <Button
                appearance="subtle"
                icon={<Dismiss24Regular />}
                onClick={() => setShowProfilePanel(false)}
              />
            </div>
            <div className="profile-panel-content">
              <div className="profile-info">
                <div className="profile-avatar">
                  <Person24Regular />
                </div>
                <div className="profile-details">
                  <h4>{user?.name}</h4>
                  <p>{user?.email}</p>
                  {user?.username && <p>@{user.username}</p>}
                </div>
              </div>
              <div className="profile-actions">
                <Button
                  className="action-btn edit-btn"
                  onClick={handleManageProfile}
                >
                  Manage Profile
                </Button>
                <Button
                  className="action-btn danger-btn logout-btn"
                  appearance="secondary"
                  icon={<SignOut24Regular />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Notification Panel - DISABLED FOR NOW */}
      {/* {showNotificationPanel && (
        <>
          <div className="panel-backdrop" onClick={() => setShowNotificationPanel(false)} />
          <div className="notification-panel show">
            <div className="notification-panel-header">
              <h3>Notifications</h3>
              <div className="notification-actions">
                <Button
                  className="mark-all-read-btn"
                  appearance="primary"
                  onClick={handleMarkAllAsRead}
                  disabled={notifications.filter(n => !n.isRead).length === 0}
                >
                  Mark All Read
                </Button>
                <Button
                  appearance="subtle"
                  icon={<Dismiss24Regular />}
                  onClick={() => setShowNotificationPanel(false)}
                />
              </div>
            </div>
            <div className="notification-panel-content">
              {isLoading ? (
                <div className="loading">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="empty-notifications">
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.isRead ? 'unread' : 'read'}`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span className="notification-time">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {!notification.isRead && <div className="notification-dot"></div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )} */}
    </>
  );
};

export default TopBar;
