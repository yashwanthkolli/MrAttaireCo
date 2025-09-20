const Order = require('../models/Order');
const Cart = require('../models/Cart');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const asyncHandler = require('../utils/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');
const getShiprocketToken = require('../utils/getShipRocketToken');
const { validateCoupon, calculateDiscount } = require('../utils/couponValidator');
const countryConfig = require('../config/countryConfig');
const currencyService = require('../utils/currencyService');

// @desc    Create Razorpay Order
// @route   POST /api/v1/payments/create-order
// @access  Private
exports.createRazorpayOrder = asyncHandler (async (req, res, next) => {
  try {
    const { couponCode, shippingAddress, estimatedDelivery } = req.body;
    const userId = req.user._id;

    // Get country details from shipping address
    const country = countryConfig.supportedCountries.find(
      c => c.code === shippingAddress.country
    ) || countryConfig.supportedCountries.find(
      c => c.code === countryConfig.defaultCountry
    );

    if (!country) {
      return next(new ErrorResponse('Invalid shipping country', 400));
    }

    const userCart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!userCart || userCart.items.length === 0) {
      return next(new ErrorResponse('Cart is empty', 400));
    }

    // Save the address
    const user = await User.findById(userId);
    if(user.addresses.length === 0) {
      user.addresses.push({ ...shippingAddress, isDefault: true});
      await user.save();
    }

    const { cart, total, pricesUpdated, allItemsAvailable } = await Cart.validateCart(userCart._id);

    if (pricesUpdated || !allItemsAvailable) {
      return next(new ErrorResponse('Some Items in Cart are missing or prices changed.', 400))
    }

    let discount = 0; 

    let shippingCost = 0;

    if(couponCode) {
      const coupon = await validateCoupon(couponCode, userId, userCart.items);
      const couponDiscount = calculateDiscount(coupon, total);
      if (couponDiscount === "FREE_SHIPPING") {
        shippingCost = 0
      } else if (couponDiscount > 0) {
        discount = couponDiscount
      }
    }

    const { subtotal } = await convertCartTotal(cart, country);

    const convertedDiscount = await convertPrice(discount, country);

    const amount = subtotal - convertedDiscount + shippingCost;

    const amountInSmallestUnit = Math.round(amount.toFixed(2) * 100);

    // Create Razorpay order
    const options = {
      amount: amountInSmallestUnit,
      currency: country.currency,
      receipt: `order_${Date.now()}`,
      notes: {
        webhook_url: 'https://mrattireco.com/backend/api/v1/payments/webhook'
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save to your database (optional but recommended)
    const order = await Order.create({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        variant: item.variant,
        quantity: item.quantity,
        priceAtAddition: item.priceAtAddition,
      })),
      razorpayOrderId: razorpayOrder.id,
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
      shippingAddress,
      couponUsed: couponCode,
      subtotal: total,
      shippingCost,
      total: amount,
      currency: country.currency,
      couponUsed: {code: couponCode ? couponCode : "", discountValue: discount},
      estimatedDelivery
    });

    res.status(201).json({
      success: true,
      order: razorpayOrder,
      dbOrderId: order._id, // Your internal order ID
    });
  } catch (error) {
    console.error('Razorpay error:', error);
    return next(new ErrorResponse('Payment processing failed', 500));
  }
});

// @desc    Buy Now - Razorpay
// @route   POST /api/v1/payments/buy-now/razorpay
// @access  Private
exports.buyNowRazorpayOrder = asyncHandler(async (req, res, next) => {
  try {
    const { productId, variant, quantity = 1, couponCode, shippingAddress, estimatedDelivery } = req.body;
    const userId = req.user._id;

    // Get country details from shipping address
    const country = countryConfig.supportedCountries.find(
      c => c.code === shippingAddress.country
    ) || countryConfig.supportedCountries.find(
      c => c.code === countryConfig.defaultCountry
    );

    if (!country) {
      return next(new ErrorResponse('Invalid shipping country', 400));
    }

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    // Find variant & check stock
    const selectedVariant = product.variants.find(v => v.color === variant.color);
    if (!selectedVariant) return next(new ErrorResponse('Invalid variant color', 400));

    const selectedSize = selectedVariant.sizes.find(s => s.size === variant.size);
    if (!selectedSize || selectedSize.stock < quantity) {
      return next(new ErrorResponse('Requested quantity not available', 400));
    }

    let price = product.price;
    let subtotal = price * quantity;

    // Apply coupon if any
    let discount = 0;
    let shippingCost = 0;
    if (couponCode) {
      const coupon = await validateCoupon(couponCode, userId, [{ product, variant, quantity }]);
      const couponDiscount = calculateDiscount(coupon, subtotal);
      if (couponDiscount === "FREE_SHIPPING") {
        shippingCost = 0;
      } else if (couponDiscount > 0) {
        discount = couponDiscount;
      }
    }

    // Convert to buyer’s currency
    const convertedPrice = await convertPrice(subtotal, country);
    const convertedDiscount = await convertPrice(discount, country);

    const amount = convertedPrice - convertedDiscount + shippingCost;
    const amountInSmallestUnit = Math.round(amount.toFixed(2) * 100);

    // Create Razorpay order
    const options = {
      amount: amountInSmallestUnit,
      currency: country.currency,
      receipt: `buy_now_${Date.now()}`,
      notes: {
        productId,
        webhook_url: 'https://mrattireco.com/backend/api/v1/payments/webhook'
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save order in DB
    const order = await Order.create({
      user: userId,
      items: [{
        product: product._id,
        variant,
        quantity,
        priceAtAddition: price,
      }],
      razorpayOrderId: razorpayOrder.id,
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
      shippingAddress,
      subtotal,
      shippingCost,
      total: amount,
      currency: country.currency,
      couponUsed: { code: couponCode || "", discountValue: discount },
      estimatedDelivery
    });

    res.status(201).json({
      success: true,
      order: razorpayOrder,
      dbOrderId: order._id,
    });
  } catch (error) {
    console.error('Buy Now Razorpay error:', error);
    return next(new ErrorResponse('Payment processing failed', 500));
  }
});

// @desc    Verify Razorpay Payments
// @route   POST /api/v1/payments/verify
// @access  Private
exports.verifyPayment = asyncHandler (async (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const userId = req.user._id;

  try {
    // Generate HMAC-SHA256 signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    // Compare signatures
    const isSignatureValid = generatedSignature === razorpaySignature;
    if (!isSignatureValid) {
      return next(new ErrorResponse('Invalid payment signature', 400));
    }

    // Check if webhook already processed this payment
    const existingOrder = await Order.findOne({ razorpayOrderId });
    if (existingOrder && existingOrder.paymentStatus === 'paid') {
      return res.json({ success: true, order: existingOrder });
    }

    // Update Order in Database
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId, paymentStatus: 'pending' },
      {
        paymentStatus: 'paid',
        razorpayPaymentId,
        status: 'processing', // Ready for shipping
      },
      { new: true }
    ).populate({ path: 'user', select: 'name email'});

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Reduce stock for each ordered item
    await reduceStock(order.items);

    // Send Confirmation Email
    await sendOrderConfirmationEmail(order);
    await sendAcknowledgementEmail();

    // Create ShipRocket shipment


    // Clear user's cart
    await Cart.deleteOne({ user: userId });

    res.json({ success: true, order });
  } catch (error) {
    console.error('Verification error:', error);
    return next(new ErrorResponse('Payment verification failed', 500));
  }
});

// @desc    Handle Razorpay Webhook
// @route   POST /api/v1/payments/webhook
// @access  Public (Razorpay will call this)
exports.handleRazorpayWebhook = asyncHandler(async (req, res) => {
  try {
    // // Verify webhook signature first
    // console.log('Webhook received. Headers:', req.headers);
    // const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    // console.log('Webhook secret exists:', !!webhookSecret);
    // const rawBody = req.rawBody || JSON.stringify(req.body);
    // const crypto = require('crypto');
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    //   .update(rawBody)
    //   .digest('hex');

    // const receivedSignature = req.headers['x-razorpay-signature'];

    // if (expectedSignature !== receivedSignature) {
    //   console.error('Webhook signature verification failed');
    //   console.error('Expected:', expectedSignature);
    //   console.error('Received:', receivedSignature);
    //   return res.status(400).json({ error: 'Invalid signature' });
    // }

    const event = req.body.event;
    const payment = req.body.payload.payment.entity;

    // Handle different event types
    if (event === 'payment.captured') {
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          paymentStatus: 'paid',
          razorpayPaymentId: payment.id,
          status: 'processing',
        },
        { new: true }
      ).populate({ path: 'user', select: 'name email' });

      if (order) {
        await reduceStock(order.items);
        await sendOrderConfirmationEmail(order);
        await sendAcknowledgementEmail();
        await Cart.deleteOne({ user: order.user._id });
      }
    } else if (event === 'payment.failed') {
      await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          paymentStatus: 'failed',
          razorpayPaymentId: payment.id,
          status: 'cancelled',
        }
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @desc    Create CoD Order
// @route   POST /api/v1/payments/cod
// @access  Private
exports.createCODOrder = asyncHandler (async (req, res) => {
  try {
    const { shippingAddress, couponCode, estimatedDelivery } = req.body;

    if (shippingAddress.country !== 'IN') {
      return next(new ErrorResponse('Cod only works in India.', 400));
    }

    const userId = req.user._id;

    const userCart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!userCart || userCart.items.length === 0) {
      return next(new ErrorResponse('Cart is empty', 400));
    }

    // Save the address
    const user = await User.findById(req.user._id);
    if(user.addresses.length === 0) {
      user.addresses.push({ ...shippingAddress, isDefault: true});
      await user.save();
    }

    const { cart, total, pricesUpdated, allItemsAvailable } = await Cart.validateCart(userCart._id);

    if (pricesUpdated || !allItemsAvailable) {
      return next(new ErrorResponse('Some Items in Cart are missing or prices changed.', 400))
    }

    let discount = 0;

    let shippingCost = 0;

    if(couponCode) {
      const coupon = await validateCoupon(couponCode, userId, userCart.items);
      const couponDiscount = calculateDiscount(coupon, total);
      if (couponDiscount === "FREE_SHIPPING") {
        shippingCost = 0
      } else if (couponDiscount > 0) {
        discount = couponDiscount
      }
    }

    const amount = total - discount + shippingCost;

    // Create order in database 
    const order = await Order.create({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        variant: item.variant,
        quantity: item.quantity,
        priceAtAddition: item.priceAtAddition,
      })),
      shippingAddress,
      couponUsed: couponCode,
      paymentMethod: 'cod',
      paymentStatus: 'pending', // COD stays pending until delivered
      subtotal: total,
      shippingCost,
      total: amount,
      couponUsed: {code: couponCode ? couponCode : "", discountValue: discount},
      estimatedDelivery
    });

    // Reduce stock for each ordered item
    await reduceStock(order.items);

    // Create ShipRocket shipment
    

    // Send Confirmation Email
    order.user.email = user.email;
    await sendOrderConfirmationEmail(order);
    await sendAcknowledgementEmail();

    // Clear user's cart
    await Cart.deleteOne({ user: userId });

    res.status(201).json({
      success: true,
      order,
      // trackingUrl: shiprocketResponse.data.tracking_url,
    });

  } catch (error) {
    console.error('COD order error:', error);
    res.status(500).json({ error: 'COD order failed' });
  }
});

// @desc    Buy Now - COD
// @route   POST /api/v1/payments/buy-now/cod
// @access  Private
exports.buyNowCODOrder = asyncHandler(async (req, res, next) => {
  try {
    const { productId, variant, quantity = 1, couponCode, shippingAddress, estimatedDelivery } = req.body;

    if (shippingAddress.country !== 'IN') {
      return next(new ErrorResponse('COD only works in India.', 400));
    }

    const userId = req.user._id;

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    // Validate variant & stock
    const selectedVariant = product.variants.find(v => v.color === variant.color);
    if (!selectedVariant) return next(new ErrorResponse('Invalid variant color', 400));

    const selectedSize = selectedVariant.sizes.find(s => s.size === variant.size);
    if (!selectedSize || selectedSize.stock < quantity) {
      return next(new ErrorResponse('Requested quantity not available', 400));
    }

    let price = product.price;
    
    let subtotal = price * quantity;

    // Apply coupon
    let discount = 0;
    let shippingCost = 0;
    if (couponCode) {
      const coupon = await validateCoupon(couponCode, userId, [{ product, variant, quantity }]);
      const couponDiscount = calculateDiscount(coupon, subtotal);
      if (couponDiscount === "FREE_SHIPPING") {
        shippingCost = 0;
      } else if (couponDiscount > 0) {
        discount = couponDiscount;
      }
    }

    const total = subtotal - discount + shippingCost;

    // Create DB order
    const order = await Order.create({
      user: userId,
      items: [{
        product: product._id,
        variant,
        quantity,
        priceAtAddition: price,
      }],
      shippingAddress,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      subtotal,
      shippingCost,
      total,
      couponUsed: { code: couponCode || "", discountValue: discount },
      estimatedDelivery
    });

    // Reduce stock
    await reduceStock(order.items);

    // Send confirmation mail
    order.user = await User.findById(userId).select('name email');
    await sendOrderConfirmationEmail(order);
    await sendAcknowledgementEmail();

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Buy Now COD error:', error);
    return next(new ErrorResponse('COD order failed', 500));
  }
});

const sendOrderConfirmationEmail = async (order) => {
  const emailOptions = {
    email: order.user.email, 
    subject: `Your Mr. Attire Order #${order._id.toString().slice(-8).toUpperCase()} is Confirmed!`,
    message: `
      Hi ${order.user.name || 'Customer'},

      Thank you for shopping with Mr. Attire! Your order is confirmed.

      📦 Order Summary
      Order ID: ${order._id}
      Date: ${new Date(order.createdAt).toLocaleDateString()}
      Total: ₹${order.total.toFixed(2)}

      🚚 Shipping Info
      Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.zipCode}

      Need help? Reply to this email or contact support@mrattireco.com.

      Happy styling!
      Team Mr. Attire
    `.replace(/^\s+/gm, '') // Remove indentation whitespace
  };

  await sendEmail(emailOptions);
}

const sendAcknowledgementEmail = async () => {
  const emailOptions = {
    email: 'mrattireco@gmail.com',
    subject: 'New Order Recieved',
    message: 'New order has been placed. Please check the admin portal.'
  }

  await sendEmail(emailOptions);
}

const reduceStock = async (items) => {
  for (const item of items) {
    await Product.updateOne(
      {
        _id: item.product._id,
        'variants.color': item.variant.color, 
      },
      {
        $inc: {
          'variants.$[outer].sizes.$[inner].stock': -item.quantity // Target nested size
        }
      },
      {
        arrayFilters: [
          { 'outer.color': item.variant.color }, 
          { 'inner.size': item.variant.size }    
        ]
      }
    );
  }
}

const convertCartTotal = async (cart, country) => {
  const convertedItems = await Promise.all(
    cart.items.map(async item => {
      // Apply country multiplier first
      let price = item.priceAtAddition;
      
      // Convert currency if needed (with psychological pricing)
      if (country.currency !== 'INR') {
        let converted = await currencyService.getLocalizedPrice({basePrice: price}, country.code);
        price = converted.value;
      }

      return {
        ...item.toObject(),
        convertedPrice: price,
        itemTotal: price * item.quantity,
        currency: country.currency
      };
    })
  );

  // Calculate subtotal from converted items
  const subtotal = convertedItems.reduce((sum, item) => sum + item.itemTotal, 0);

  return {subtotal}
}

const convertPrice = async (price, country) => {
  let amt = price;

  if (country.currency !== 'INR') {
    let converted = await currencyService.getLocalizedPrice({basePrice: price}, country.code, { applyPsychologicalPricing: false });
    amt = converted.value;
  }

  return amt.toFixed(2);
} 