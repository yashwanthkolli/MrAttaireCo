const Coupon = require("../models/Coupon");

exports.validateCoupon = async (couponCode, userId, cartItems) => {
  const coupon = await Coupon.findOne({ code: couponCode });
  
  if (!coupon || !coupon.isActive) {
    throw new Error('Invalid coupon');
  }

  // Check date validity
  if (coupon.endDate && new Date() > coupon.endDate) {
    throw new Error('Coupon expired');
  }

  // Check usage limits
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error('Coupon usage limit reached');
  }

  // Check user-specific
  if (coupon.userSpecific && !coupon.userSpecific.equals(userId)) {
    throw new Error('Coupon not valid for this user');
  }

  // Check product-specific
  if (coupon.productSpecific && coupon.productSpecific.length > 0) {
    const validProducts = cartItems.some(item => 
      coupon.productSpecific.includes(item.product._id)
    );
    if (!validProducts) throw new Error('Coupon not valid for cart items');
  }

  // Check category-specific
  if (coupon.categorySpecific && coupon.categorySpecific.length > 0) {
    const validCategories = cartItems.some(item => 
      coupon.categorySpecific.includes(item.product.category)
    );
    if (!validCategories) throw new Error('Coupon not valid for these categories');
  }

  return coupon;
};

exports.calculateDiscount = (coupon, cartSubtotal, applicableItems = null) => {
  let discount = 0;
  const items = applicableItems || cartSubtotal;

  switch (coupon.discountType) {
    case 'percentage':
      discount = items * (coupon.value / 100);
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
      break;

    case 'fixed':
      discount = Math.min(coupon.value, items);
      break;

    case 'free_shipping':
      discount = 'FREE_SHIPPING';
      break;

    default:
      discount = 0;
  }

  return discount;
};

exports.validateCouponInput = (data) => {
  const {
    code,
    discountType,
    value,
    isAffiliateLink,
    affiliateUser
  } = data;

  // Required fields check
  if (!code || !discountType) {
    return { isValid: false, error: 'Coupon code and discount type are required' };
  }

  // Value validation
  if (discountType !== 'free_shipping' && (isNaN(value) || value <= 0)) {
    return { isValid: false, error: 'Valid discount value is required' };
  }

  // Affiliate link validation
  if (isAffiliateLink && !affiliateUser) {
    return { isValid: false, error: 'Affiliate user is required for affiliate links' };
  }

  // Date validation
  if (data.endDate && new Date(data.endDate) < new Date()) {
    return { isValid: false, error: 'End date must be in the future' };
  }

  return { isValid: true };
};