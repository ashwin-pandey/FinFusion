import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../contexts/CurrencyContext';
import { CURRENCIES } from '../contexts/CurrencyContext';
import { 
  Button, 
  Input, 
  Text, 
  Field,
  MessageBar,
  MessageBarBody,
  MessageBarTitle
} from '@fluentui/react-components';
import { 
  Person24Regular, 
  Key24Regular, 
  Settings24Regular,
  Save24Regular,
  Edit24Regular,
  Shield24Regular,
  Mail24Regular,
  PersonTag24Regular
} from '@fluentui/react-icons';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
      });
    }
  }, [user]);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile(profileForm);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrencyChange = (newCurrency: typeof CURRENCIES[0]) => {
    setCurrency(newCurrency);
    setSuccess('Currency preference updated!');
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>Profile Settings</h1>
          <Text size={400} style={{ color: '#666' }}>
            Manage your account information and preferences
          </Text>
        </div>
        <div className="user-info">
          {user?.role === 'ADMIN' && <Shield24Regular style={{ color: '#d13438', marginRight: '8px' }} />}
          <Text size={300} style={{ color: '#666' }}>
            {user?.role || 'USER'}
          </Text>
        </div>
      </div>

      {error && (
        <MessageBar intent="error" className="message-bar">
          <MessageBarBody>
            <MessageBarTitle>Error</MessageBarTitle>
            {error}
          </MessageBarBody>
        </MessageBar>
      )}
      {success && (
        <MessageBar intent="success" className="message-bar">
          <MessageBarBody>
            <MessageBarTitle>Success</MessageBarTitle>
            {success}
          </MessageBarBody>
        </MessageBar>
      )}

      {/* Profile Summary */}
      <div className="profile-summary">
        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>
          {user?.username && (
            <p className="profile-username">@{user.username}</p>
          )}
          <p className="profile-role">
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <Person24Regular />
          Profile
        </button>
        <button 
          className={`tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <Key24Regular />
          Password
        </button>
        <button 
          className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <Settings24Regular />
          Preferences
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="form-card">
            <div className="form-header">
              <Edit24Regular className="form-icon" />
              <h3>Update Profile</h3>
            </div>
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label><Text weight="semibold">Full Name</Text></label>
                  <Input
                    type="text"
                    value={profileForm.name}
                    onChange={(_, data) => setProfileForm({ ...profileForm, name: data.value })}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label><Text weight="semibold">Email Address</Text></label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={(_, data) => setProfileForm({ ...profileForm, email: data.value })}
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label><Text weight="semibold">Username</Text></label>
                  <Input
                    type="text"
                    value={profileForm.username}
                    onChange={(_, data) => setProfileForm({ ...profileForm, username: data.value })}
                    placeholder="Enter username (optional)"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <Button 
                  type="submit" 
                  appearance="primary"
                  icon={<Save24Regular />}
                  disabled={isLoading}
                  className="action-btn edit-btn"
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="form-card">
            <div className="form-header">
              <Key24Regular className="form-icon" />
              <h3>Change Password</h3>
            </div>
            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label><Text weight="semibold">Current Password</Text></label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(_, data) => setPasswordForm({ ...passwordForm, currentPassword: data.value })}
                    placeholder="Enter your current password"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label><Text weight="semibold">New Password</Text></label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(_, data) => setPasswordForm({ ...passwordForm, newPassword: data.value })}
                    placeholder="Enter your new password"
                    minLength={8}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label><Text weight="semibold">Confirm New Password</Text></label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(_, data) => setPasswordForm({ ...passwordForm, confirmPassword: data.value })}
                    placeholder="Confirm your new password"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <Button 
                  type="submit" 
                  appearance="primary"
                  icon={<Key24Regular />}
                  disabled={isLoading}
                  className="action-btn edit-btn"
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="form-card">
            <div className="form-header">
              <Settings24Regular className="form-icon" />
              <h3>Preferences</h3>
            </div>
            <div className="preference-group">
              <label><Text weight="semibold">Default Currency</Text></label>
              <div className="currency-options">
                {CURRENCIES.map((curr) => (
                  <div
                    key={curr.code}
                    className="currency-option"
                    data-appearance={curr.code === currency.code ? "primary" : "secondary"}
                    onClick={() => handleCurrencyChange(curr)}
                  >
                    <span className="currency-symbol">{curr.symbol}</span>
                    <span className="currency-code">{curr.code}</span>
                    <span className="currency-name">{curr.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;


