const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  _id: { // Add this field
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId() // Auto-generate
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    color: String,
    size: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  // Store price at time of adding to cart
  priceAtAddition: {
    type: Number,
    required: true
  },
  // Store discounted price if applicable
  discountedPriceAtAddition: {
    type: Number
  },
  // Timestamp for price validation
  priceUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  couponUsed: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update timestamps
cartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to validate cart items
cartSchema.statics.validateCart = async function(cartId) {
  const cart = await this.findById(cartId).populate({
    path: 'items.product',
    select: 'name price discountedPrice images slug variants'
  });

  if (!cart) return null;

  let needsUpdate = false;
  let total = 0;
  const unavailableItems = [];
  const updatedItems = [];

  // Check each item's current price and stock
  for (const item of cart.items) {
    const currentProduct = item.product;
    const currentPrice = currentProduct.discountedPrice || currentProduct.price;
    const storedPrice = item.discountedPriceAtAddition || item.priceAtAddition;
    
    // Find the variant and size in the product
    const variant = currentProduct.variants.find(
      v => v.color === item.variant.color
    );
    
    const sizeInfo = variant?.sizes.find(
      s => s.size === item.variant.size
    );
    
    // Check stock availability
    if (!variant || !sizeInfo || sizeInfo.stock < item.quantity) {
      unavailableItems.push({
        itemId: item._id,
        product: currentProduct,
        variant: item.variant,
        reason: !variant 
          ? 'Color no longer available' 
          : !sizeInfo 
            ? 'Size no longer available'
            : 'Insufficient stock'
      });
      continue; // Skip adding to updated items
    }
    
    // Check if price has changed since added to cart
    const priceChanged = currentPrice !== storedPrice;
    
    if (priceChanged) {
      needsUpdate = true;
    }
    
    updatedItems.push({
      ...item.toObject(),
      priceAtAddition: currentProduct.price,
      discountedPriceAtAddition: currentProduct.discountedPrice || undefined,
      priceUpdatedAt: priceChanged ? new Date() : item.priceUpdatedAt,
      available: true
    });
    
    // Calculate total for available items
    const price = currentProduct.discountedPrice || currentProduct.price;
    total += price * item.quantity;
  }

  // If there are changes, update the cart
  if (needsUpdate || unavailableItems.length > 0) {
    cart.items = updatedItems;
    await cart.save();
  }

  return {
    cart,
    total,
    pricesUpdated: needsUpdate,
    unavailableItems,
    allItemsAvailable: unavailableItems.length === 0
  };
};

module.exports = mongoose.model('Cart', cartSchema);