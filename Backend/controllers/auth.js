const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const passport = require('passport');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone
  });

  // Generate verification token
  const verificationToken = user.getVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${process.env.EMAIL_VERIFICATION_URL}/${verificationToken}`;

  const message = `Welcome to Mr. Attire & Co.! \n\nThank you for registering with us. To complete your registration and verify your email address, please click on the following link: \n\n ${verificationUrl} \n\nThis link will expire in 24 hours. If you didn't request this registration, please ignore this email. \n\nBest regards, \nThe Mr. Attire & Co. Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification Token',
      message
    });

    res.status(200).json({
      success: true,
      data: 'Email verification token sent to email'
    });
  } catch (err) {
    console.error(err);
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new ErrorResponse('Email could not be sent', 500);
  }
});

// @desc    Verify email
// @route   GET /api/v1/auth/verifyemail/:verificationToken
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.verificationToken)
    .digest('hex');

  const user = await User.findOne({
    verificationToken,
    verificationTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ErrorResponse('Invalid or expired token', 400);
  }

  // Mark user as verified
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    data: 'Email verified successfully'
  });
});

// @desc    Resend verification email
// @route   POST /api/v1/auth/resendverification
// @access  Public
exports.resendVerification = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorResponse('No user found with this email', 404);
  }

  if (user.isVerified) {
    throw new ErrorResponse('Email is already verified', 400);
  }

  // Generate new verification token
  const verificationToken = user.getVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${process.env.EMAIL_VERIFICATION_URL}/${verificationToken}`;

  const message = `You are receiving this email because you requested a new verification email from Mr. Attire & Co. Please verify your email by clicking on the following link: \n\n ${verificationUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'New Email Verification Token',
      message
    });

    res.status(200).json({
      success: true,
      message: 'New verification email sent'
    });
  } catch (err) {
    console.error(err);
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    throw new ErrorResponse('Please provide an email and password', 400);
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  // Check if email is verified
  if (!user.isVerified) {
    throw new ErrorResponse('Please verify your email first', 401);
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new ErrorResponse('There is no user with that email', 404);
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${process.env.RESET_PASSWORD_URL}/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password for your Mr. Attire & Co. account. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new ErrorResponse('Email could not be sent', 500);
  }
});

// @desc    Check reset token validity
// @route   GET /api/v1/auth/checkresettoken/:resettoken
// @access  Public
exports.checkResetToken = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ErrorResponse('Invalid or expired token', 400);
  }

  res.status(200).json({
    success: true,
    message: 'Token is valid'
  });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ErrorResponse('Invalid token', 400);
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Google OAuth login
// @route   GET /api/v1/auth/google
// @access  Public
exports.googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// @desc    Google OAuth callback
// @route   GET /api/v1/auth/google/callback
// @access  Public
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/auth/login?error=google_auth_failed');
    }

    // Generate token and redirect
    const token = user.getSignedJwtToken();
    res.redirect(`${process.env.CLIENT_URL}/auth/google/callback?token=${token}`);
  })(req, res, next);
};

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  
  // Check current password
  const isMatch = await user.matchPassword(req.body.currentPassword);
  
  if (!isMatch) {
    throw new ErrorResponse('Password is incorrect', 401);
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};