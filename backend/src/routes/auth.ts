import express from 'express';
import passport from 'passport';
import { AuthService } from '../services/AuthService';
import { AuthController } from '../controllers/AuthController';

const router = express.Router();

// Google OAuth strategy setup
passport.use(new (require('passport-google-oauth20').Strategy)({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    const { user, isNewUser } = await AuthService.findOrCreateUser(profile);
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await AuthService.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  AuthController.googleCallback
);

// Get current user
router.get('/me', AuthController.getCurrentUser);

// Refresh token
router.post('/refresh', AuthController.refreshToken);

// Logout
router.post('/logout', AuthController.logout);

export default router;
