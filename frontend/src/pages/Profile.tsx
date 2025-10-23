import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../contexts/CurrencyContext';
import { CURRENCIES } from '../contexts/CurrencyContext';
import { Button, Input, Select, Option, Text } from '@fluentui/react-components';
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
  });

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
        <h1>Profile Settings</h1>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Password
          </button>
          <button 
            className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Profile Summary */}
      <div className="profile-summary">
        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>
          <p className="profile-role">
            User • Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <h3>Update Profile</h3>
              <div className="form-group">
                <label htmlFor="name"><Text weight="semibold">Full Name</Text></label>
                <Input
                  type="text"
                  id="name"
                  value={profileForm.name}
                  onChange={(_, data) => setProfileForm({ ...profileForm, name: data.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email"><Text weight="semibold">Email</Text></label>
                <Input
                  type="email"
                  id="email"
                  value={profileForm.email}
                  onChange={(_, data) => setProfileForm({ ...profileForm, email: data.value })}
                  required
                />
              </div>
              <Button 
                type="submit" 
                appearance="primary" 
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="form-card">
            <form onSubmit={handlePasswordChange}>
              <h3>Change Password</h3>
              <div className="form-group">
                <label htmlFor="currentPassword"><Text weight="semibold">Current Password</Text></label>
                <Input
                  type="password"
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(_, data) => setPasswordForm({ ...passwordForm, currentPassword: data.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword"><Text weight="semibold">New Password</Text></label>
                <Input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(_, data) => setPasswordForm({ ...passwordForm, newPassword: data.value })}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword"><Text weight="semibold">Confirm New Password</Text></label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(_, data) => setPasswordForm({ ...passwordForm, confirmPassword: data.value })}
                  required
                />
              </div>
              <Button 
                type="submit" 
                appearance="primary" 
                disabled={isLoading}
              >
                {isLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="form-card">
            <h3>Preferences</h3>
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


