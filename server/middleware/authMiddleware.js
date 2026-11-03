import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
export const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;
export const ACCESS_TOKEN_EXPIRY = '30d'; // Primary 30-day persistence
export const REFRESH_TOKEN_EXPIRY = '30d'; // Refresh token 30-day expiry

export const getCookieOptions = (maxAge = THIRTY_DAYS_MS) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge,
  path: '/',
});

export const verifyAuth = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'No active session found. Please log in.',
        code: 'NO_TOKEN',
      });
    }

    // Verify token
    try {
      const accessSecret = process.env.JWT_ACCESS_SECRET || 'ashis_kirti_super_secret_access_key_2026_romantic_love_space';
      const decoded = jwt.verify(accessToken, accessSecret);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists.',
          code: 'USER_NOT_FOUND',
        });
      }

      // Calculate days remaining in this 30-day session
      const now = Math.floor(Date.now() / 1000);
      const secondsRemaining = (decoded.exp || now) - now;
      const daysRemaining = Math.max(0, Math.ceil(secondsRemaining / (24 * 3600)));

      req.user = {
        _id: user._id,
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        currentMood: user.currentMood,
        avatar: user.avatar,
        customStatus: user.customStatus,
        sessionExpiresAt: new Date((decoded.exp || now) * 1000),
        sessionDaysRemaining: daysRemaining,
      };

      // Update last active
      User.findByIdAndUpdate(user._id, { lastActive: new Date() }).exec().catch(() => {});

      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Your 30-day session has expired. Please refresh or log in again.',
          code: 'TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid session token.',
        code: 'INVALID_TOKEN',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};
