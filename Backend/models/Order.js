const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    variant: {
      color: String,
      size: String
    },
    quantity: { 
      type: Number, 
      required: true 
    },
    priceAtAddition: {  // Snapshot of price when ordered
      type: Number, 
      required: true 
    }
  }],
  shippingAddress: {
    recipientName: String,
    phoneNumber: String,
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  couponUsed: {
    code: String,
    discountValue: Number  // Fixed amount or percentage saved
  },
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'INR'},
  paymentMethod: { 
    type: String
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },
  razorpayOrderId: String,  // Razorpay's order ID
  razorpayPaymentId: String, // Razorpay's payment ID (if successful)
  status: { 
    type: String, 
    enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'], 
    default: 'processing' 
  },
  shiprocketOrderId: String,
  estimatedDelivery: Date,  // From Shiprocket API
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);