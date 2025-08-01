const Order = require('../models/Order');
const Product = require('../models/Product');
const getShiprocketToken = require('../utils/getShipRocketToken');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../utils/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get All Orders of User
// @route   GET /api/v1/orders/my-orders
// @access  Private
exports.getMyOrders = asyncHandler (async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort('-createdAt');

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return next(new ErrorResponse('Failed to fetch orders', 500))
  }
});

// @desc    Get Order by Id
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrderById = asyncHandler (async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('items.product', 'name images price variants');

    if (!order) {
      return next(new ErrorResponse('Order not found', 404))
    }

    // Fetch tracking details if available
    // let tracking = null;
    // if (order.trackingId) {
    //   const token = await getAuthToken();
    //   const response = await axios.get(
    //     `https://apiv2.shiprocket.in/v1/external/courier/track?awb=${order.awbNumber}`,
    //     { headers: { Authorization: `Bearer ${token}` } }
    //   );
    //   tracking = response.data.tracking_data;
    // }

    res.json({ success: true, order });
  } catch (error) {
    return next(new ErrorResponse('Failed to fetch order details', 500))
  }
});

// @desc    Update Order Status
// @route   PUT /api/v1/orders/:id/status
// @access  Admin
exports.updateOrderStatus = asyncHandler (async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return next(new ErrorResponse('Invalid status', 400))
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id },
      { status },
      { new: true }
    );

    if (!order) {
      return next(new ErrorResponse('Order not found', 404))
    }

    // Trigger actions based on status
    if (status === 'cancelled') {
      // Restore stock
      for (const item of order.items) {
        await Product.updateOne(
          {
            _id: item.product,
            'variants.color': item.variant.color,
          },
          {
            $inc: {
              'variants.$[outer].sizes.$[inner].stock': item.quantity,
            },
          },
          {
            arrayFilters: [
              { 'outer.color': item.variant.color },
              { 'inner.size': item.variant.size },
            ],
          }
        );
      }

      // Refund logic for prepaid orders
      // if (order.paymentMethod !== 'cod' && order.paymentStatus === 'paid') {
      //   await initiateRefund(order);
      // }
    }

    // Send status update email
    await sendEmail({
      email: order.user.email,
      subject: `Order #${order._id} status updated`,
      message: `Your order status is now: ${status}`,
    });

    res.json({ success: true, order });
  } catch (error) {
    return next(new ErrorResponse('Failed to update order', 500))
  }
});

// @desc    Get All Orders
// @route   PUT /api/v1/orders
// @access  Admin
exports.getAllOrders = asyncHandler (async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort('-createdAt');

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});