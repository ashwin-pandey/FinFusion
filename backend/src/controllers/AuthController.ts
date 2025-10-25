import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthService } from '../services/AuthService';
import { AccountModel } from '../models/Account';
import { UserModel } from '../models/User';
import { logger } from '../utils/logger';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password, name } = req.body;

      // Validate input
      if (!email || !username || !password || !name) {
        res.status(400).json({
          success: false,
          error: 'Email, username, password, and name are required'
        });
        return;
      }

      // Check if user already exists by email
      const existingUserByEmail = await AuthService.getUserByEmail(email);
      if (existingUserByEmail) {
        res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
        return;
      }

      // Check if username already exists
      const existingUserByUsername = await UserModel.findByUsername(username);
      if (existingUserByUsername) {
        res.status(400).json({
          success: false,
          error: 'Username is already taken'
        });
        return;
      }

      // Create user
      const user = await AuthService.createUser(email, password, name, username);
      
      // Create default Cash account for the new user
      try {
        await AccountModel.create({
          userId: user.id,
          name: 'Cash',
          type: 'CASH',
          balance: 0,
          currency: 'USD',
          isActive: true
        });
        logger.info('Default Cash account created for new user', { userId: user.id });
      } catch (accountError) {
        logger.error('Failed to create default Cash account', accountError, { userId: user.id });
        // Don't fail registration if account creation fails
      }

      const { accessToken, refreshToken } = AuthService.generateTokens(user.id);

      logger.auth('User registered successfully', user.id, { email, name });
      logger.info('User registration completed', { userId: user.id, email });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            profilePicture: user.profilePicture,
            role: user.role,
            createdAt: user.createdAt
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      logger.error('Registration error', error, { email, name });
      res.status(500).json({
        success: false,
        error: 'Failed to register user'
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email/Username and password are required'
        });
        return;
      }

      // Verify credentials (email can be email or username)
      const user = await AuthService.verifyPassword(email, password);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid email/username or password'
        });
        return;
      }

      // Generate tokens
      const { accessToken, refreshToken } = AuthService.generateTokens(user.id);

      logger.auth('User logged in successfully', user.id, { email });
      logger.info('User login completed', { userId: user.id, email });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            profilePicture: user.profilePicture,
            role: user.role,
            createdAt: user.createdAt
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      logger.error('Login error', error, { email });
      res.status(500).json({
        success: false,
        error: 'Failed to login'
      });
    }
  }

  static async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Authentication failed'
        });
        return;
      }

      const { accessToken, refreshToken } = AuthService.generateTokens(user.id);

      logger.auth('Google OAuth login successful', user.id, { email: user.email });
      logger.info('Google OAuth login completed', { userId: user.id, email: user.email });

      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
    } catch (error) {
      logger.error('Google callback error', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }

  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          error: 'No token provided'
        });
        return;
      }

      const decoded = AuthService.verifyToken(token);
      if (!decoded) {
        res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
        return;
      }

      const user = await AuthService.getUserById(decoded.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      logger.info('User profile retrieved', { userId: user.id, email: user.email });

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      logger.error('Get current user error', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user information'
      });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
        return;
      }

      const newAccessToken = await AuthService.refreshAccessToken(refreshToken);
      
      if (!newAccessToken) {
        res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
        return;
      }

      logger.info('Token refreshed successfully', { refreshToken: refreshToken.substring(0, 10) + '...' });

      res.json({
        success: true,
        accessToken: newAccessToken
      });
    } catch (error) {
      logger.error('Refresh token error', error);
      res.status(500).json({
        success: false,
        error: 'Failed to refresh token'
      });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a real implementation, you might want to blacklist the token
      // For now, we'll just return success
      logger.auth('User logged out successfully');
      logger.info('User logout completed');

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout error', error);
      res.status(500).json({
        success: false,
        error: 'Failed to logout'
      });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, email } = req.body;
      const userId = req.user!.id;

      const user = await AuthService.updateProfile(userId, { name, email });

      logger.auth('User profile updated', userId, { name, email });
      logger.info('Profile update completed', { userId, name, email });

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      logger.error('Update profile error', error, { userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  static async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await AuthService.getCurrentUser(userId);

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          profilePicture: user.profilePicture,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch (error: any) {
      logger.error('Get current user error', error, { userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user'
      });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, email, username } = req.body;
      const userId = req.user!.id;

      const user = await AuthService.updateProfile(userId, { name, email, username });

      logger.auth('User profile updated', userId, { name, email, username });
      logger.info('Profile update completed', { userId });

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          profilePicture: user.profilePicture,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch (error: any) {
      logger.error('Update profile error', error, { userId: req.user?.id });
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update profile'
      });
    }
  }

  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      await AuthService.changePassword(userId, currentPassword, newPassword);

      logger.auth('User password changed', userId);
      logger.security('Password change completed', { userId });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      logger.error('Change password error', error, { userId: req.user?.id });
      logger.security('Password change failed', { userId: req.user?.id, error: error.message });
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to change password'
      });
    }
  }
}
