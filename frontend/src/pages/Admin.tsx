import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Select, Option, Text, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, Badge } from '@fluentui/react-components';
import { Edit24Regular, Delete24Regular, Person24Regular } from '@fluentui/react-icons';
import './Admin.css';

interface User {
  id: string;
  email: string;
  username?: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  isActive: boolean;
  createdAt: string;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      setSuccess('User role updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      setSuccess(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getRoleBadgeAppearance = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'filled';
      case 'MANAGER': return 'tint';
      case 'USER': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'MANAGER': return 'brand';
      case 'USER': return 'success';
      default: return 'subtle';
    }
  };

  // Check if current user is admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <div className="page-actions">
          <Button
            appearance="primary"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            <Person24Regular /> Refresh Users
          </Button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="admin-content">
        <div className="users-section">
          <h2>User Management</h2>
          
          {isLoading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="users-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Username</TableHeaderCell>
                    <TableHeaderCell>Role</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Created</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.username || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          appearance={getRoleBadgeAppearance(user.role)}
                          color={getRoleColor(user.role)}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          appearance={user.isActive ? 'filled' : 'outline'}
                          color={user.isActive ? 'success' : 'danger'}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="action-buttons">
                          <Button
                            size="small"
                            appearance="outline"
                            onClick={() => {
                              setEditingUser(user);
                              setNewRole(user.role);
                            }}
                          >
                            <Edit24Regular />
                          </Button>
                          <Button
                            size="small"
                            appearance="outline"
                            onClick={() => toggleUserStatus(user.id, !user.isActive)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          {user.id !== user.id && (
                            <Button
                              size="small"
                              appearance="outline"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Delete24Regular />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit User Role</h3>
            <div className="form-group">
              <label>User: {editingUser.name} ({editingUser.email})</label>
              <Select
                value={newRole}
                onChange={(_, data) => setNewRole(data.value || '')}
              >
                <Option value="USER">User</Option>
                <Option value="MANAGER">Manager</Option>
                <Option value="ADMIN">Admin</Option>
              </Select>
            </div>
            <div className="modal-actions">
              <Button
                appearance="secondary"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={() => updateUserRole(editingUser.id, newRole)}
              >
                Update Role
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
