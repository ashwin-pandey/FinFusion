import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel, CreateUserData } from '../models/User';

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
}
