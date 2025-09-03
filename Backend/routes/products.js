const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getSearchSuggestions,
  getSearchResults,
  getAllProducts
} = require('../controllers/products');
const { protect, authorize } = require('../middleware/auth');
const Product = require('../models/Product');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router();

router
  .route('/')
  .get(advancedResults(Product, 'reviews'), getProducts)
  .post(protect, authorize('admin'), createProduct);

router
  .route('/admin')
  .get(protect, authorize('admin'), getAllProducts);

  router
  .route('/search')
  .get(getSearchResults);

router
  .route('/search/suggestions')
  .get(getSearchSuggestions);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router
  .route('/:id/image')
  .put(protect, authorize('admin'), uploadProductImage);

module.exports = router;