const { validateCoupon, calculateDiscount } = require('../utils/couponValidator');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const { validateCouponInput } = require('../utils/couponValidator');
const ErrorResponse = require('../utils/errorResponse');

exports.applyCoupon = async (req, res, next) => {
  try {
    const { couponCode } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    const coupon = await validateCoupon(couponCode, userId, cart.items);

    const { total } = await Cart.validateCart(cart._id);
    
    let applicableAmount = total;

    if (coupon.minCartValue && applicableAmount < coupon.minCartValue) {
      throw new Error(`Minimum cart value of ₹${coupon.minCartValue} required`);
    }

    const discount = calculateDiscount(coupon, applicableAmount);

    if (discount === 'FREE_SHIPPING' || discount > 0) {
      cart.couponUsed = coupon.code
      await cart.save();
    }

    res.json({
      success: true,
      couponValid: discount === 'FREE_SHIPPING' || discount > 0,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
        discountAmount: discount === 'FREE_SHIPPING' ? 0 : discount,
        freeShipping: discount === 'FREE_SHIPPING'
      }
    });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Admin
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      value,
      minCartValue,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      userSpecific,
      productSpecific,
      categorySpecific,
      isAffiliateLink,
      affiliateUser,
      description
    } = req.body;

    // Validate input
    const { isValid, error } = validateCouponInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, error });
    }

    // Create coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      value,
      minCartValue,
      maxDiscountAmount,
      startDate: startDate || Date.now(),
      endDate,
      usageLimit,
      userSpecific,
      productSpecific,
      categorySpecific,
      isAffiliateLink: isAffiliateLink || false,
      affiliateUser: isAffiliateLink ? affiliateUser : null,
      description,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      coupon
    });

  } catch (error) {
    // Handle duplicate coupon code
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Coupon code already exists' 
      });
    }
    console.log(error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create coupon' 
    });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Admin
exports.getCoupons = async (req, res) => {
  try {
    const { type, activeOnly } = req.query;
    let filter = {};

    // Filter by coupon type
    if (type) {
      if (type === 'affiliate') {
        filter.isAffiliateLink = true;
      } else if (['percentage', 'fixed', 'free_shipping'].includes(type)) {
        filter.discountType = type;
      }
    }

    // Filter active coupons only
    if (activeOnly === 'true') {
      filter.isActive = true;
      filter.$or = [
        { endDate: { $exists: false } },
        { endDate: { $gte: new Date() } }
      ];
    }

    const coupons = await Coupon.find(filter)
      .populate('userSpecific', 'name email')
      .populate('productSpecific', 'name')
      .populate('categorySpecific', 'name')
      .populate('affiliateUser', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      count: coupons.length,
      coupons
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch coupons' 
    });
  }
};

exports.removeCoupon = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if(!cart && !cart.couponUsed) {
      return next(new ErrorResponse('Invalid Cart', 400));
    }

    cart.couponUsed = '';
    await cart.save();

    res.json({
      success: true
    });
  } catch (error) {
    return next(new ErrorResponse('Failed to remove coupon', 500));
  }
}