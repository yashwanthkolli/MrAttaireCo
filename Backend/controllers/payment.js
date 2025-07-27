const Order = require('../models/Order');
const razorpay = require('../config/razorpay');
const asyncHandler = require('../utils/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create Razorpay Order
// @route   POST /api/v1/payment
// @access  Private
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    // Validate amount (convert rupees to paise)
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    const amountInPaise = Math.round(amount * 100); // Razorpay uses paise

    // Create Razorpay order
    const options = {
      amount: amountInPaise,
      currency,
      receipt: `order_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save to your database (optional but recommended)
    // const order = await Order.create({
    //   user: req.user._id, // From auth middleware
    //   total: amount,
    //   razorpayOrderId: razorpayOrder.id,
    //   paymentStatus: 'pending',
    // });

    res.status(201).json({
      success: true,
      order: razorpayOrder,
      // dbOrderId: order._id, // Your internal order ID
    });
  } catch (error) {
    console.error('Razorpay error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
};