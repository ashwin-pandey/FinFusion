import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
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

      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
    } catch (error) {
      console.error('Google callback error:', error);
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

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Get current user error:', error);
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

      res.json({
        success: true,
        accessToken: newAccessToken
      });
    } catch (error) {
      console.error('Refresh token error:', error);
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
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to logout'
      });
    }
  }
}
