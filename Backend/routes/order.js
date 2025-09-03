const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getMyOrders, getOrderById, updateOrderStatus, getAllOrders, getRecentOrders } = require('../controllers/order');

const router = express.Router();

router.route('/my-orders')
  .get(protect, getMyOrders);

router.route('/')
  .get(protect, authorize('admin'), getAllOrders);

router.route('/recent')
  .get(protect, authorize('admin'), getRecentOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(protect, authorize('admin'), updateOrderStatus);

module.exports = router;