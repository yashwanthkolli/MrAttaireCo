const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get total orders count
    const totalOrders = await Order.countDocuments();
    
    // Get total products count
    const totalProducts = await Product.countDocuments();
    
    // Get total users count (excluding admins)
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    
    // Calculate total revenue from completed orders
    // const revenueResult = await Order.aggregate([
    //   { $match: { status: 'delivered' } },
    //   { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    // ]);
    
    // const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalUsers
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};