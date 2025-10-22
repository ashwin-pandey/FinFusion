import React from 'react';
import { useAuth } from '../hooks/useAuth';
import './Profile.css';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <div className="profile-card">
        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
        </div>
      </div>
      <p className="note">Profile management features coming soon!</p>
    </div>
  );
};

export default Profile;

