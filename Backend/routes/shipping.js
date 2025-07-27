const express = require('express');
const { protect } = require('../middleware/auth');
const { getShippingOptions } = require('../controllers/shipping');

const router = express.Router();

router
  .route('/')
  .get(getShippingOptions);

module.exports = router;