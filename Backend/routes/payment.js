const express = require('express');
const { protect } = require('../middleware/auth');
const { createRazorpayOrder, verifyPayment, createCODOrder, handleRazorpayWebhook } = require('../controllers/payment');

const router = express.Router();

router.route('/create-order')
  .post(protect, createRazorpayOrder);

router.route('/verify')
  .post(protect, verifyPayment);

router.route('/cod')
  .post(protect, createCODOrder);

router.route('/webhook')
  .post(handleRazorpayWebhook);

module.exports = router;