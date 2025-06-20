const express = require('express');
const {
  register,
  verifyEmail,
  resendVerification,
  login,
  logout,
  getMe,
  forgotPassword,
  checkResetToken,
  resetPassword,
  googleLogin,
  googleCallback,
  updateDetails,
  updatePassword
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.get('/verifyemail/:verificationToken', verifyEmail);
router.post('/resendverification', resendVerification);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.get('/checkresettoken/:resettoken', checkResetToken);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

module.exports = router;