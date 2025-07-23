const express = require('express');
const { addAddress, deleteAddress, setDefaultAddress, updateAddress } = require('../controllers/user');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/address')
  .post(protect, addAddress);

router.route('/address/:addressId')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.route('/address/:addressId/default')
  .put(protect, setDefaultAddress);

module.exports = router;