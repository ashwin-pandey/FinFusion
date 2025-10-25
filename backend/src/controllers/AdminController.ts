import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { logger } from '../utils/logger';

export class AdminController {
  // Get all users (admin only)
  static async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await UserModel.findAll();
      
      res.json({
        success: true,
        data: users.map(user => ({
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        }))
      });
    } catch (error: any) {
      logger.error('Get all users error', error, { adminId: req.user?.id });
      res.status(500).json({
        success: false,
        error: 'Failed to get users'
      });
    }
  }

  // Update user role (admin only)
  static async updateUserRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!['ADMIN', 'MANAGER', 'USER'].includes(role)) {
        res.status(400).json({
          success: false,
          error: 'Invalid role'
        });
        return;
      }

      const user = await UserModel.update(userId, { role });
      
      logger.auth('User role updated', req.user!.id, { targetUserId: userId, newRole: role });
      logger.info('Admin updated user role', { adminId: req.user!.id, userId, role });

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (error: any) {
      logger.error('Update user role error', error, { adminId: req.user?.id });
      res.status(500).json({
        success: false,
        error: 'Failed to update user role'
      });
    }
  }

  // Deactivate/Activate user (admin only)
  static async toggleUserStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      const user = await UserModel.update(userId, { isActive });
      
      logger.auth('User status toggled', req.user!.id, { targetUserId: userId, isActive });
      logger.info('Admin toggled user status', { adminId: req.user!.id, userId, isActive });

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (error: any) {
      logger.error('Toggle user status error', error, { adminId: req.user?.id });
      res.status(500).json({
        success: false,
        error: 'Failed to toggle user status'
      });
    }
  }

  // Delete user (admin only)
  static async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Prevent admin from deleting themselves
      if (userId === req.user!.id) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete your own account'
        });
        return;
      }

      await UserModel.delete(userId);
      
      logger.auth('User deleted', req.user!.id, { targetUserId: userId });
      logger.info('Admin deleted user', { adminId: req.user!.id, userId });

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error: any) {
      logger.error('Delete user error', error, { adminId: req.user?.id });
      res.status(500).json({
        success: false,
        error: 'Failed to delete user'
      });
    }
  }
}