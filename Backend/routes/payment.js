const express = require('express');
const { protect } = require('../middleware/auth');
const { createRazorpayOrder } = require('../controllers/payment');

const router = express.Router();

router.route('/create-order')
  .post(protect, createRazorpayOrder);

module.exports = router;