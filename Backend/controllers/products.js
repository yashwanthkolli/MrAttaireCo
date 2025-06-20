const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/async');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'name');

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is product owner or admin
  if (req.user.role !== 'admin') {
    throw new ErrorResponse(`User ${req.user.id} is not authorized to update this product`, 401);
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is product owner or admin
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to delete this product`, 401)
    );
  }

  // Delete images from cloudinary first
  for (const image of product.images) {
    await cloudinary.uploader.destroy(image.public_id);
  }

  await product.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload image for product
// @route   PUT /api/v1/products/:id/image
// @access  Private/Admin
exports.uploadProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }
  
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.image;

  // Check file type
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  try{
    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'mr_attire/products',
      width: 1000,
      height: 1400,
      crop: 'fill'
    });

    // Add to product images
    product.images.push({
      url: result.secure_url,
      public_id: result.public_id,
      isPrimary: product.images.length === 0
    });

    await product.save();

    res.status(200).json({
      success: true,
      data: product.images
    });
  } catch (err) {
    return next(new ErrorResponse('Image upload failed', 500));
  } finally {
    // Clean up temp file
    if (req.files?.image?.tempFilePath) {
      const fs = require('fs');
      fs.unlink(req.files.image.tempFilePath, () => {});
    }
  }
});