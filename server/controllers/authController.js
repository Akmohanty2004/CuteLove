import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getCookieOptions, THIRTY_DAYS_MS, THIRTY_DAYS_SECONDS } from '../middleware/authMiddleware.js';

// Helper to issue tokens
const generateTokens = (user, rememberMe = true) => {
  // If rememberMe is checked (default), issue 30-day tokens.
  const expiry = rememberMe ? '30d' : '1d';
  const cookieMaxAge = rememberMe ? THIRTY_DAYS_MS : 24 * 60 * 60 * 1000;

  const accessSecret = process.env.JWT_ACCESS_SECRET || 'ashis_kirti_super_secret_access_key_2026_romantic_love_space';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'ashis_kirti_super_secret_refresh_key_2026_forever_session';

  const accessToken = jwt.sign(
    {
      id: user._id,
      username: user.username,
      displayName: user.displayName,
    },
    accessSecret,
    { expiresIn: expiry }
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    refreshSecret,
    { expiresIn: expiry }
  );

  return { accessToken, refreshToken, cookieMaxAge };
};

// @desc    Log in Ashis or Kirti (supports single password-only input or username + password)
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { username, password, rememberMe = true } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your secret password.',
      });
    }

    let user = null;

    if (username) {
      const cleanUsername = username.toLowerCase().trim();
      if (cleanUsername !== 'ashis' && cleanUsername !== 'kirti') {
        return res.status(403).json({
          success: false,
          message: 'This private space is exclusively for Ashis and Kirti.',
        });
      }
      const candidate = await User.findOne({ username: cleanUsername });
      if (candidate && (await bcrypt.compare(password, candidate.password))) {
        user = candidate;
      }
    } else {
      // Single login section: automatically identifies Ashis or Kirti by password!
      const ashis = await User.findOne({ username: 'ashis' });
      const kirti = await User.findOne({ username: 'kirti' });

      if (ashis && (await bcrypt.compare(password, ashis.password))) {
        user = ashis;
      } else if (kirti && (await bcrypt.compare(password, kirti.password))) {
        user = kirti;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect secret password. Please enter the password for Ashis or Kirti.',
      });
    }

    const cleanUsername = user.username;

    // Generate tokens with 30-day lifetime
    const { accessToken, refreshToken, cookieMaxAge } = generateTokens(user, rememberMe);

    // Hash refresh token for server-side revocation validation
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.refreshTokenHash = refreshTokenHash;
    user.lastActive = new Date();
    await user.save();

    // Set HTTP-Only 30-day cookies
    res.cookie('accessToken', accessToken, getCookieOptions(cookieMaxAge));
    res.cookie('refreshToken', refreshToken, getCookieOptions(cookieMaxAge));

    // Get partner info
    const partnerUsername = cleanUsername === 'ashis' ? 'kirti' : 'ashis';
    const partner = await User.findOne({ username: partnerUsername }).select('-password -refreshTokenHash');

    return res.status(200).json({
      success: true,
      message: `Welcome back to our world, ${user.displayName}!`,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        currentMood: user.currentMood,
        avatar: user.avatar,
        customStatus: user.customStatus,
        sessionDaysRemaining: rememberMe ? 30 : 1,
      },
      partner: partner
        ? {
            id: partner._id,
            username: partner.username,
            displayName: partner.displayName,
            currentMood: partner.currentMood,
            avatar: partner.avatar,
            customStatus: partner.customStatus,
            lastActive: partner.lastActive,
          }
        : null,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Verify 30-day session validity on app load
// @route   GET /api/auth/verify
export const verifySession = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user.id).select('-password -refreshTokenHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const partnerUsername = user.username === 'ashis' ? 'kirti' : 'ashis';
    const partner = await User.findOne({ username: partnerUsername }).select('-password -refreshTokenHash');

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        currentMood: user.currentMood,
        avatar: user.avatar,
        customStatus: user.customStatus,
        sessionDaysRemaining: req.user.sessionDaysRemaining,
        sessionExpiresAt: req.user.sessionExpiresAt,
      },
      partner: partner
        ? {
            id: partner._id,
            username: partner.username,
            displayName: partner.displayName,
            currentMood: partner.currentMood,
            avatar: partner.avatar,
            customStatus: partner.customStatus,
            lastActive: partner.lastActive,
          }
        : null,
    });
  } catch (error) {
    console.error('Verify session error:', error);
    return res.status(500).json({ success: false, message: 'Session verification failed' });
  }
};

// @desc    Silent token refresh using 30-day refresh cookie
// @route   POST /api/auth/refresh
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token available. 30-day cycle expired.',
        code: 'NO_REFRESH_TOKEN',
      });
    }

    let decoded;
    try {
      const refreshSecret = process.env.JWT_REFRESH_SECRET || 'ashis_kirti_super_secret_refresh_key_2026_forever_session';
      decoded = jwt.verify(token, refreshSecret);
    } catch (err) {
      res.clearCookie('accessToken', getCookieOptions());
      res.clearCookie('refreshToken', getCookieOptions());
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired or invalid.',
        code: 'REFRESH_EXPIRED',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokenHash) {
      res.clearCookie('accessToken', getCookieOptions());
      res.clearCookie('refreshToken', getCookieOptions());
      return res.status(401).json({
        success: false,
        message: 'Session revoked.',
        code: 'SESSION_REVOKED',
      });
    }

    const isMatch = await bcrypt.compare(token, user.refreshTokenHash);
    if (!isMatch) {
      res.clearCookie('accessToken', getCookieOptions());
      res.clearCookie('refreshToken', getCookieOptions());
      return res.status(401).json({
        success: false,
        message: 'Refresh token hash mismatch.',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    // Issue refreshed tokens
    const { accessToken, refreshToken: newRefreshToken, cookieMaxAge } = generateTokens(user, true);
    const newHash = await bcrypt.hash(newRefreshToken, 10);
    user.refreshTokenHash = newHash;
    user.lastActive = new Date();
    await user.save();

    res.cookie('accessToken', accessToken, getCookieOptions(cookieMaxAge));
    res.cookie('refreshToken', newRefreshToken, getCookieOptions(cookieMaxAge));

    return res.status(200).json({
      success: true,
      message: '30-day session seamlessly renewed',
      sessionDaysRemaining: 30,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ success: false, message: 'Could not refresh session' });
  }
};

// @desc    Log out and revoke 30-day session
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { refreshTokenHash: null });
    }
    res.clearCookie('accessToken', getCookieOptions());
    res.clearCookie('refreshToken', getCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully. See you soon!',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

// @desc    Update profile status or avatar
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { customStatus, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (customStatus !== undefined) user.customStatus = customStatus;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        currentMood: user.currentMood,
        avatar: user.avatar,
        customStatus: user.customStatus,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Could not update profile' });
  }
};
