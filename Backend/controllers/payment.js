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
    const { couponCode, shippingAddress } = req.body;
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

    let shippingCost = 100;

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
      couponUsed: {code: couponCode ? couponCode : "", discountValue: discount}
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

    // Update Order in Database
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId },
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

    // Create ShipRocket shipment


    // Clear user's cart
    await Cart.deleteOne({ user: userId });

    res.json({ success: true, order });
  } catch (error) {
    console.error('Verification error:', error);
    return next(new ErrorResponse('Payment verification failed', 500));
  }
});

// @desc    Create CoD Order
// @route   POST /api/v1/payments/cod
// @access  Private
exports.createCODOrder = asyncHandler (async (req, res) => {
  try {
    const { shippingAddress, couponCode } = req.body;

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

    let shippingCost = 100;

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
      couponUsed: {code: couponCode ? couponCode : "", discountValue: discount}
    });

    // Reduce stock for each ordered item
    await reduceStock(order.items);

    // Create ShipRocket shipment
    

    // Send Confirmation Email
    order.user.email = user.email;
    await sendOrderConfirmationEmail(order);

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


const createShiprocketOrder = async (order) => {
  const token = await getShiprocketToken();
  
  const response = await axios.post(
    'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
    {
      order_id: order._id.toString(),
      order_date: new Date().toISOString(),
      pickup_location: 'Primary', // Your warehouse name in ShipRocket
      channel_id: '', // Leave empty for direct orders
      billing_customer_name: order.user.name,
      billing_last_name: '',
      billing_address: order.shippingAddress.street,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: 'India',
      billing_email: order.user.email,
      billing_phone: order.user.phone,
      shipping_is_billing: true,
      order_items: order.items.map(item => ({
        name: item.product.name,
        sku: item.product.sku || `variant_${item.variant.color}_${item.variant.size}`,
        units: item.quantity,
        selling_price: item.priceAtPurchase,
      })),
      payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      total_discount: order.discount,
      shipping_charges: order.shippingCost,
      giftwrap_charges: 0,
      transaction_charges: 0,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
};

const sendOrderConfirmationEmail = async (order) => {
  const emailOptions = {
    email: order.user.email, 
    subject: `Your Mr. Attire Order #${order._id.toString().slice(-8).toUpperCase()} is Confirmed!`,
    message: `
      Hi ${order.user.name || 'Customer'},

      Thank you for shopping with Mr. Attire! Your order is confirmed.

      📦 **Order Summary**
      Order ID: ${order._id}
      Date: ${new Date(order.createdAt).toLocaleDateString()}
      Total: ₹${order.total.toFixed(2)}

      🚚 **Shipping Info**
      Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.pincode}

      🛍️ **Items Ordered**
      ${order.items.map(item => `
        - ${item.product.name} (${item.variant.color}, ${item.variant.size}) × ${item.quantity}: ₹${item.priceAtAddition.toFixed(2)}
      `).join('')}

      Need help? Reply to this email or contact support@mrattireco.com.

      Happy styling!
      Team Mr. Attire
    `.replace(/^\s+/gm, '') // Remove indentation whitespace
  };

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