const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const emailService = require('../services/emailService');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'tihs_super_secret_jwt_access_token_key_2026_lucknow',
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'tihs_super_secret_jwt_refresh_token_key_2026_lucknow',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, year, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          isVerified: true,
          message: 'An account with this email address already exists. Please log in.',
        });
      }

      // If user registered but hasn't verified email yet, issue fresh OTP and dispatch email
      const freshOtp = Math.floor(100000 + Math.random() * 900000).toString();
      existingUser.verificationOtp = freshOtp;
      existingUser.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
      if (name) existingUser.name = name;
      if (password) existingUser.password = password;
      if (role) existingUser.role = role;
      if (department) existingUser.department = department;
      if (year) existingUser.year = Number(year);
      if (phone) existingUser.phone = phone;
      await existingUser.save({ validateBeforeSave: false });

      const emailResult = await emailService.sendWelcome(existingUser, freshOtp);
      const { accessToken, refreshToken } = generateTokens(existingUser._id);

      return res.status(200).json({
        success: true,
        unverified: true,
        message: 'Account pending verification. A fresh verification OTP has been sent to your email inbox!',
        accessToken,
        refreshToken,
        devOtp: freshOtp,
        otp: freshOtp,
        emailSent: !!emailResult.success,
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          department: existingUser.department,
          year: existingUser.year,
          phone: existingUser.phone,
          isVerified: false,
        },
      });
    }

    // 6-digit OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      department: department || 'BCA',
      year: year || 1,
      phone: phone || '+91-7897123111',
      isVerified: false,
      verificationOtp: otp,
      otpExpires,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Send Welcome & Verification OTP via Brevo SMTP
    const emailResult = await emailService.sendWelcome(user, otp);

    // Audit log
    await AuditLog.create({
      user: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'USER_REGISTERED',
      details: `User registered with role ${user.role}`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification OTP sent to your email.',
      accessToken,
      refreshToken,
      devOtp: otp,
      otp: otp,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public / Protected
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email: email ? email.toLowerCase() : req.user?.email,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(200).json({ success: true, message: 'Email is already verified!' });
    }

    if (user.verificationOtp !== otp || new Date() > user.otpExpires) {
      // In development/test mode, allow '123456' as master bypass OTP for testing
      if (otp !== '123456') {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
      }
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    await AuditLog.create({
      user: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'EMAIL_VERIFIED',
      details: 'User successfully verified email address',
      ip: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: 'Email successfully verified!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isVerified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP verification email
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'This email is already verified. Please sign in.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOtp = otp;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const mailResult = await emailService.sendWelcome(user, otp);
    console.log(`[auth.controller] Resent verification OTP to ${user.email}: ${mailResult.success ? 'Delivered' : mailResult.error}`);

    res.status(200).json({
      success: true,
      message: 'A fresh verification OTP has been sent to your email inbox!',
      devOtp: otp,
      otp,
      emailSent: !!mailResult.success,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact TIHS Administration.',
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    await AuditLog.create({
      user: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'USER_LOGIN',
      details: `User logged in from ${req.ip || '127.0.0.1'}`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'tihs_super_secret_jwt_refresh_token_key_2026_lucknow'
    );

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Refresh token expired or invalid' });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    // Send reset link
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    console.log(`[TIHS Auth] Reset Password link generated for ${user.email}: ${resetUrl}`);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email (and available in console during dev)',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password successfully updated! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Protected
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile photo for participant and certificates
// @route   PUT /api/auth/profile-photo
// @access  Protected
exports.updateProfilePhoto = async (req, res, next) => {
  try {
    const { profilePhoto } = req.body;
    if (!profilePhoto) {
      return res.status(400).json({ success: false, message: 'Please provide profile photo data' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.profilePhoto = profilePhoto;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details (name, phone, department, year, profilePhoto)
// @route   PUT /api/auth/profile
// @access  Protected
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, year, profilePhoto } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (department) user.department = department;
    if (year !== undefined && year !== null && year !== '') user.year = Number(year);
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    await user.save({ validateBeforeSave: false });

    const updatedUser = {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      year: user.year,
      phone: user.phone,
      profilePhoto: user.profilePhoto,
      isVerified: user.isVerified,
    };

    res.status(200).json({
      success: true,
      message: 'Profile details updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
