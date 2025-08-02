const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getMyOrders, getOrderById, updateOrderStatus, getAllOrders } = require('../controllers/order');

const router = express.Router();

router.route('/my-orders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(protect, authorize('admin'), updateOrderStatus);

router.route('/')
  .get(protect, authorize('admin'), getAllOrders);

module.exports = router;