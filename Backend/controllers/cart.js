const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user's cart with validation
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      select: 'name price discountedPrice images slug variants'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Validate both prices and stock
    const validationResult = await Cart.validateCart(cart._id);
    
    res.status(200).json({
      success: true,
      data: {
        ...validationResult,
        // Add additional cart info if needed
      }
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Add item to cart
// @route   POST /api/v1/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res, next) => {
  try {
    const { productId, color, size, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      throw new ErrorResponse('Product not found', 404);
    }

    // Check if product is active
    if (!product.isActive) {
      throw new ErrorResponse('This product is no longer available', 400);
    }

    // Enhanced stock validation
    const variant = product.variants.find(v => v.color === color);
    if (!variant) {
      throw new ErrorResponse(`Color '${color}' is no longer available`, 400);
    }

    const sizeInfo = variant.sizes.find(s => s.size === size);
    if (!sizeInfo) {
      throw new ErrorResponse(`Size '${size}' is no longer available for this color`, 400);
    }

    if (sizeInfo.stock < quantity) {
      throw new ErrorResponse(
        `Only ${sizeInfo.stock} item(s) available in this size`, 
        400
      );
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && 
        item.variant.color === color && 
        item.variant.size === size
    );

    if (existingItemIndex >= 0) {
      // Check total quantity won't exceed stock
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (sizeInfo.stock < newQuantity) {
        throw new ErrorResponse(
          `Cannot add ${quantity} more. Only ${sizeInfo.stock - cart.items[existingItemIndex].quantity} available`,
          400
        );
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        variant: { color, size },
        quantity,
        priceAtAddition: product.price,
        discountedPriceAtAddition: product.discountedPrice || undefined
      });
    }

    await cart.save();
    const validationResult = await Cart.validateCart(cart._id);

    res.status(200).json({
      success: true,
      data: validationResult
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!quantity || quantity < 1) {
      throw new ErrorResponse('Please provide a valid quantity (minimum 1)', 400);
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      throw new ErrorResponse('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      throw new ErrorResponse('Item not found in cart', 404);
    }

    // Get current product info to validate stock
    const product = await Product.findById(cart.items[itemIndex].product)
      .select('variants');

    const variant = product.variants.find(
      v => v.color === cart.items[itemIndex].variant.color
    );

    const sizeInfo = variant?.sizes.find(
      s => s.size === cart.items[itemIndex].variant.size
    );

    if (!variant || !sizeInfo) {
      throw new ErrorResponse('Product variant no longer available', 400);
    }

    if (sizeInfo.stock < quantity) {
      throw new ErrorResponse(
        `Only ${sizeInfo.stock} item(s) available in this size`, 
        400
      );
    }

    // Update quantity
    const updatedCart = await Cart.findOneAndUpdate(
      {
        _id: cart._id,
        'items._id': itemId
      },
      {
        $set: {
          'items.$.quantity': quantity,
          'items.$.priceUpdatedAt': Date.now()
        }
      },
      { new: true }
    ).populate({
      path: 'items.product',
      select: 'name price discountedPrice images slug variants'
    });

    const validationResult = await Cart.validateCart(updatedCart._id);

    res.status(200).json({
      success: true,
      data: validationResult
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new ErrorResponse('Cart not found', 404));
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item._id.toString() !== itemId
    );

    if (cart.items.length === initialLength) {
      return next(new ErrorResponse('Item not found in cart', 404));
    }

    await cart.save();
    const validationResult = await Cart.validateCart(cart._id);

    res.status(200).json({
      success: true,
      data: validationResult
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new ErrorResponse('Cart not found', 404));
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      data: {
        cart,
        total: 0,
        pricesUpdated: false,
        unavailableItems: [],
        allItemsAvailable: true
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Validate user cart
// @route   GET /api/v1/cart/validate
// @access  Private
exports.validateCart = asyncHandler(async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    // Validate both prices and stock
    const { pricesUpdated, allItemsAvailable, unavailableItems } = await Cart.validateCart(cart._id);
    
    res.status(200).json({
      success: true,
      data: {
        pricesUpdated,
        allItemsAvailable,
        unavailableItems
        // Add additional cart info if needed
      }
    });
  } catch (err) {
    next(err);
  }
});