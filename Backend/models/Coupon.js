const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: String,
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: true
  },
  value: {
    type: Number,
    required: function() {
      return this.discountType !== 'free_shipping';
    }
  },
  minCartValue: Number,
  maxDiscountAmount: Number,
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: Number,
  usedCount: {
    type: Number,
    default: 0
  },
  userSpecific: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  productSpecific: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  categorySpecific: [{
    type: String,
    enum: [
      'tshirts',
      'shirts',
      'trackpants',
      'jogger',
      'winterwear',
      'shorts',
      'dresses',
      'jackets',
      'accessories',
      'footwear'
    ]
  }],
  isAffiliateLink: {
    type: Boolean,
    default: false
  },
  affiliateUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);