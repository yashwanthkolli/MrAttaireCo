const express = require('express');
const router = express.Router();
const {
  applyCoupon,
  createCoupon,
  getCoupons,
  removeCoupon
} = require('../controllers/coupon');
const { protect, authorize } = require('../middleware/auth');
const trackAffiliate = require('../middleware/affiliateMiddleware');

// Public
router.get('/track', trackAffiliate); // ?affiliateCode=XYZ

// User routes
router.post('/apply', protect, applyCoupon);
router.get('/remove', protect, removeCoupon);

// Admin routes
router.post('/', protect, authorize('admin'), createCoupon);
router.get('/', protect, authorize('admin'), getCoupons);

module.exports = router;