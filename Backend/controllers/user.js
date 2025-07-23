const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/async');

// @desc    Add new address
// @route   POST /api/v1/addresses
// @access  Private
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // If no default exists or this is the first address, set as default
  const hasExistingDefault = user.addresses.some(addr => addr.isDefault);

  const newAddress = {
    recipientName: req.body.recipientName || `${user.firstName} ${user.lastName}`,
    phoneNumber: req.body.phone || user.phone,
    street: req.body.street,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    zipCode: req.body.zipCode,
    isDefault: req.body.isDefault || user.addresses.length === 0 || !hasExistingDefault // Set as default if first address
  };

  // If setting as default, update all other addresses
  if (newAddress.isDefault) {
    await User.updateMany(
      { _id: req.user.id, 'addresses.isDefault': true },
      { $set: { 'addresses.$[].isDefault': false } }
    );
  }

  user.addresses.push(newAddress);
  await user.save();

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update address
// @route   PUT /api/v1/addresses/:addressId
// @access  Private
exports.updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  // Handle default address change
  if (req.body.isDefault && !address.isDefault) {
    await User.updateMany(
      { _id: req.user.id, 'addresses.isDefault': true },
      { $set: { 'addresses.$[].isDefault': false } }
    );
  }

  Object.assign(address, req.body);
  await user.save();

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete address
// @route   DELETE /api/v1/addresses/:addressId
// @access  Private
exports.deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  // Prevent deletion of last address
  // if (user.addresses.length <= 1) {
  //   return next(new ErrorResponse('Cannot delete last address', 400));
  // }

  address.deleteOne();
  await user.save();

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Set default address
// @route   PUT /api/v1/addresses/:addressId/default
// @access  Private
exports.setDefaultAddress = asyncHandler(async (req, res, next) => {
  await User.updateMany(
    { _id: req.user.id },
    { 
      $set: { 
        'addresses.$[].isDefault': false 
      } 
    }
  );

  const user = await User.findOneAndUpdate(
    { 
      _id: req.user.id,
      'addresses._id': req.params.addressId 
    },
    { 
      $set: { 
        'addresses.$.isDefault': true 
      } 
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: user
  });
});