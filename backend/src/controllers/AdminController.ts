import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

export class AdminController {
  // Get all users (admin only)
  static async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, role, isActive } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const users = await UserModel.findMany(Number(limit), offset);
      const totalUsers = await UserModel.count();

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalUsers,
            pages: Math.ceil(totalUsers / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  }

  // Get single user
  static async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user'
      });
    }
  }

  // Create new user (admin only)
  static async createUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, name, role = 'USER', isActive = true } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await UserModel.create({
        email,
        password: hashedPassword,
        name,
        role,
        isActive
      });

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create user'
      });
    }
  }

  // Update user
  static async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, role, isActive } = req.body;

      // Check if user exists
      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Update user
      const user = await UserModel.update(id, {
        name,
        email,
        role,
        isActive
      });

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user'
      });
    }
  }

  // Delete user
  static async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if user exists
      const user = await UserModel.findById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Prevent deleting admin users
      if (user.role === 'ADMIN') {
        res.status(400).json({
          success: false,
          error: 'Cannot delete admin users'
        });
        return;
      }

      await UserModel.delete(id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete user'
      });
    }
  }

  // Get system statistics
  static async getSystemStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      // This would typically include more complex queries
      // For now, we'll return basic stats
      const totalUsers = await UserModel.count();
      
      res.json({
        success: true,
        data: {
          totalUsers,
          // Add more stats as needed
        }
      });
    } catch (error) {
      console.error('Get system stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch system statistics'
      });
    }
  }
}
