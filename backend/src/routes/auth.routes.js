const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  resendOtp,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfilePhoto,
  updateProfile,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile-photo', protect, updateProfilePhoto);
router.put('/profile', protect, updateProfile);

module.exports = router;
