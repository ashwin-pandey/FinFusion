import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel, CreateUserData } from '../models/User';
import { AccountModel } from '../models/Account';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleProfile {
  id: string;
  emails: Array<{ value: string }>;
  displayName: string;
  photos?: Array<{ value: string }>;
}

export class AuthService {
  static async createUser(email: string, password: string, name: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userData: CreateUserData = {
      email,
      password: hashedPassword,
      name
    };

    return await UserModel.create(userData);
  }

  static async getUserByEmail(email: string) {
    return await UserModel.findByEmail(email);
  }

  static async verifyPassword(email: string, password: string) {
    const user = await UserModel.findByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
  static generateTokens(userId: string): AuthTokens {
    const jwtSecret = process.env.JWT_SECRET!;
    
    const accessToken = jwt.sign(
      { userId },
      jwtSecret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      jwtSecret,
      { expiresIn: '30d' as any }
    );

    return { accessToken, refreshToken };
  }

  static verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }

  static async findOrCreateUser(profile: GoogleProfile): Promise<{ user: any; isNewUser: boolean }> {
    // Check if user exists
    let user = await UserModel.findByGoogleId(profile.id);

    if (user) {
      return { user, isNewUser: false };
    }

    // Create new user
    const userData: CreateUserData = {
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      profilePicture: profile.photos?.[0]?.value
    };

    user = await UserModel.create(userData);
    
    // Create default Cash account for new Google user
    try {
      await AccountModel.create({
        userId: user.id,
        name: 'Cash',
        type: 'CASH',
        balance: 0,
        currency: 'USD',
        isActive: true
      });
    } catch (accountError) {
      console.error('Failed to create default Cash account for Google user:', accountError);
      // Don't fail user creation if account creation fails
    }
    
    return { user, isNewUser: true };
  }

  static async getUserById(userId: string) {
    return await UserModel.findById(userId);
  }

  static async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
      
      if (decoded.type !== 'refresh') {
        return null;
      }

      // Verify user still exists
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return null;
      }

      // Generate new access token
      return jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
      );
    } catch (error) {
      return null;
    }
  }

  static async updateProfile(userId: string, data: { name: string; email: string }) {
    return await UserModel.update(userId, data);
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await UserModel.findById(userId);
    if (!user || !user.password) {
      throw new Error('User not found or no password set');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await UserModel.update(userId, { password: hashedPassword });
  }
}
