const User = require('../models/User');
const OTP = require('../models/OTP');
const generateTokens = require('../utils/generateToken');
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to normalize phone number string
const normalizePhone = (phone, countryCode = '+91') => {
  if (!phone) return '';
  const clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('+')) return clean;
  return `${countryCode}${clean}`;
};

// @desc    Register a new user (Direct registration - NO OTP required)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, phone, countryCode = '+91', password } = req.body;

  try {
    const formattedEmail = email ? email.toLowerCase().trim() : undefined;
    const formattedPhone = phone ? normalizePhone(phone, countryCode) : undefined;

    // Check duplicate email if provided
    if (formattedEmail) {
      const emailExists = await User.findOne({ email: formattedEmail });
      if (emailExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
    }

    // Check duplicate phone if provided
    if (formattedPhone) {
      const phoneExists = await User.findOne({ phone: formattedPhone });
      if (phoneExists) {
        return res.status(400).json({ message: 'User with this phone number already exists' });
      }
    }

    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'admin' : 'customer';

    const user = await User.create({
      name,
      email: formattedEmail,
      phone: formattedPhone,
      countryCode,
      phoneVerified: true,
      password,
      role,
      loginMethod: formattedPhone ? 'phone' : 'email',
      isVerified: true,
      lastLogin: new Date(),
    });

    if (user) {
      generateTokens(res, user._id);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        countryCode: user.countryCode,
        role: user.role,
        isVerified: user.isVerified,
        loginMethod: user.loginMethod,
        wishlist: user.wishlist,
      });
    } else {
      res.status(400).json({ message: 'Invalid user registration data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user via Unified Identifier (Email OR Phone Number) + Password
// @route   POST /api/auth/login / /api/auth/login-email / /api/auth/login-phone
// @access  Public
const loginUser = async (req, res) => {
  const { identifier, email, phone, countryCode = '+91', password } = req.body;
  const rawId = (identifier || email || phone || '').trim();

  if (!rawId || !password) {
    return res.status(400).json({ message: 'Please enter email/phone and password' });
  }

  try {
    const isEmailFormat = rawId.includes('@');
    const formattedEmail = rawId.toLowerCase();
    const formattedPhone = normalizePhone(rawId, countryCode);

    // Search user by email or phone
    const user = await User.findOne({
      $or: [
        { email: formattedEmail },
        { phone: formattedPhone },
        { phone: rawId },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email/phone or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'User account is blocked. Please contact support.' });
    }

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      user.lastLogin = new Date();
      await user.save();

      generateTokens(res, user._id);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        countryCode: user.countryCode,
        phoneVerified: user.phoneVerified,
        role: user.role,
        loginMethod: isEmailFormat ? 'email' : 'phone',
        isVerified: user.isVerified,
        wishlist: user.wishlist,
      });
    } else {
      res.status(401).json({ message: 'Invalid email/phone or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Phone Login alias
const loginPhone = loginUser;

// @desc    Send 6-Digit Registration OTP (Optional flow)
const sendRegistrationOTP = async (req, res) => {
  const { phone, countryCode = '+91' } = req.body;
  try {
    const formattedPhone = normalizePhone(phone, countryCode);
    const rawOTP = otpService.generate6DigitOTP();
    const hashedOTP = await bcrypt.hash(rawOTP, 10);

    await OTP.deleteMany({ phone: formattedPhone, purpose: 'registration' });
    await OTP.create({
      phone: formattedPhone,
      otp: hashedOTP,
      purpose: 'registration',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await otpService.sendSMS(formattedPhone, `Verification OTP: ${rawOTP}`);
    res.status(200).json({
      success: true,
      message: `OTP sent to ${formattedPhone}`,
      ...(!process.env.TWILIO_ACCOUNT_SID && { debugOTP: rawOTP }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and Register
const verifyRegistrationOTPAndRegister = async (req, res) => {
  return registerUser(req, res);
};

// @desc    Send Forgot Password OTP to Phone
const forgotPasswordPhone = async (req, res) => {
  const { phone, countryCode = '+91' } = req.body;
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }
  try {
    const rawId = phone.trim();
    const formattedPhone = normalizePhone(rawId, countryCode);
    const cleanDigits = rawId.replace(/[^0-9]/g, '');

    const user = await User.findOne({
      $or: [
        { phone: formattedPhone },
        { phone: rawId },
        { phone: cleanDigits },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'No account registered with this phone number.' });
    }

    const rawOTP = otpService.generate6DigitOTP();
    const hashedOTP = await bcrypt.hash(rawOTP, 10);

    await OTP.deleteMany({
      $or: [
        { phone: formattedPhone },
        { phone: rawId },
        { phone: cleanDigits },
      ],
      purpose: 'forgot_password',
    });

    await OTP.create({
      phone: formattedPhone,
      otp: hashedOTP,
      purpose: 'forgot_password',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const smsResult = await otpService.sendSMS(formattedPhone, `Password Reset OTP: ${rawOTP}`);
    const showDebug = !process.env.TWILIO_ACCOUNT_SID || !smsResult?.success;

    res.status(200).json({
      success: true,
      message: `Reset OTP generated for ${formattedPhone}`,
      ...(showDebug && { debugOTP: rawOTP }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password via Phone OTP
const resetPasswordPhone = async (req, res) => {
  const { phone, countryCode = '+91', otp, password } = req.body;
  if (!phone || !otp || !password) {
    return res.status(400).json({ message: 'Phone number, OTP, and new password are required.' });
  }
  try {
    const rawId = phone.trim();
    const formattedPhone = normalizePhone(rawId, countryCode);
    const cleanDigits = rawId.replace(/[^0-9]/g, '');

    const otpRecord = await OTP.findOne({
      $or: [
        { phone: formattedPhone },
        { phone: rawId },
        { phone: cleanDigits },
      ],
      purpose: 'forgot_password',
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found.' });
    }

    const isMatch = await otpRecord.matchOTP(otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    const user = await User.findOne({
      $or: [
        { phone: formattedPhone },
        { phone: rawId },
        { phone: cleanDigits },
      ],
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.password = password;
    await user.save();
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'Password reset successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send 6-Digit OTP to Email Address
const sendEmailOTP = async (req, res) => {
  const { email, purpose = 'Verification' } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }
  try {
    const formattedEmail = email.toLowerCase().trim();
    const rawOTP = otpService.generate6DigitOTP();
    const hashedOTP = await bcrypt.hash(rawOTP, 10);

    await OTP.deleteMany({ phone: formattedEmail, purpose: 'email_verification' });
    await OTP.create({
      phone: formattedEmail,
      otp: hashedOTP,
      purpose: 'email_verification',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const emailResult = await emailService.sendEmailOTP(formattedEmail, rawOTP, purpose);
    const showDebug = !process.env.EMAIL_USER || !emailResult?.success;

    res.status(200).json({
      success: true,
      message: `OTP generated for email: ${formattedEmail}`,
      email: formattedEmail,
      ...(showDebug && { debugOTP: rawOTP }),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send Email OTP: ' + error.message });
  }
};

// @desc    Forgot Password Email OTP
const forgotPasswordEmailOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }
  try {
    const formattedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: formattedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const rawOTP = otpService.generate6DigitOTP();
    const hashedOTP = await bcrypt.hash(rawOTP, 10);

    await OTP.deleteMany({ phone: formattedEmail, purpose: 'forgot_password_email' });
    await OTP.create({
      phone: formattedEmail,
      otp: hashedOTP,
      purpose: 'forgot_password_email',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const emailResult = await emailService.sendEmailOTP(formattedEmail, rawOTP, 'Password Reset');
    const showDebug = !process.env.EMAIL_USER || !emailResult?.success;

    res.status(200).json({
      success: true,
      message: emailResult?.success
        ? `Password reset OTP sent to email: ${formattedEmail}`
        : `Reset OTP generated for ${formattedEmail}`,
      ...(showDebug && { debugOTP: rawOTP }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password via Email OTP
const resetPasswordEmailOTP = async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
  }
  try {
    const formattedEmail = email.toLowerCase().trim();
    const otpRecord = await OTP.findOne({ phone: formattedEmail, purpose: 'forgot_password_email' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found.' });
    }

    const isMatch = await otpRecord.matchOTP(otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    const user = await User.findOne({ email: formattedEmail });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.password = password;
    await user.save();
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'Password reset successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Aliases for compatibility
const forgotPassword = forgotPasswordEmailOTP;
const resetPassword = resetPasswordEmailOTP;
const resendOTP = sendRegistrationOTP;

const logoutUser = async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: new Date(0),
  };
  res.cookie('accessToken', '', cookieOptions);
  res.cookie('refreshToken', '', cookieOptions);
  res.status(200).json({ message: 'Logged out successfully' });
};

const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) res.json(user);
  else res.status(404).json({ message: 'User not found' });
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      if (req.body.password) user.password = req.body.password;

      const updatedUser = await user.save();
      generateTokens(res, updatedUser._id);
      res.json(updatedUser);
    } else res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_123');
    const user = await User.findById(decoded.userId);
    if (!user || user.isBlocked) return res.status(401).json({ message: 'Not authorized' });

    generateTokens(res, user._id);
    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.isVerified = true;
      await user.save();
      res.json({ message: 'Email verified successfully!', isVerified: true });
    } else res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  sendRegistrationOTP,
  verifyRegistrationOTPAndRegister,
  sendEmailOTP,
  forgotPasswordEmailOTP,
  resetPasswordEmailOTP,
  loginUser,
  loginPhone,
  forgotPasswordPhone,
  resetPasswordPhone,
  resendOTP,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
