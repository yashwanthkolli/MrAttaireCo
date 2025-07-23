const express = require('express');
const { protect } = require('../middleware/auth');
const { 
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart
} = require('../controllers/cart');

const router = express.Router();

router.route('/')
  .get(protect, getCart)
  .post(protect, addToCart)
  .delete(protect, clearCart);

router.route('/:itemId')
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart);

router.route('/validate')
  .get(protect, validateCart);

module.exports = router;