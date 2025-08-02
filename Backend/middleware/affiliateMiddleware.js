const Coupon = require('../models/Coupon');

const trackAffiliate = async (req, res, next) => {
  const { affiliateCode } = req.query;
  
  if (affiliateCode) {
    const coupon = await Coupon.findOne({ 
      code: affiliateCode,
      isAffiliateLink: true
    });
    
    if (coupon) {
      // Store in session or cookie
      req.session.affiliate = {
        couponId: coupon._id,
        affiliateUser: coupon.affiliateUser
      };
      
      // Apply discount automatically if configured
      if (coupon.autoApply) {
        req.session.couponCode = coupon.code;
      }
    }
  }
  
  next();
};

module.exports = trackAffiliate;