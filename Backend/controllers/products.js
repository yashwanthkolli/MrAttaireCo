const Product = require('../models/Product');
const Cart = require('../models/Cart');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/async');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get all products (Admin) - includes active + inactive
// @route   GET /api/v1/products/admin
// @access  Private/Admin
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    return next(new ErrorResponse('Failed to fetch image', 500));
  }
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

  // Remove this product from all carts
  try {
    await Cart.updateMany(
      { "items.product": product._id },
      { $pull: { items: { product: product._id } } }
    );
  } catch (err) {
    console.log(err);
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

// @desc    Get search suggestions
// @route   GET /api/v1/search/suggestions
// @access  Public
exports.getSearchSuggestions = asyncHandler(async (req, res, next) => {
  const query = req.query.q || '';
  
  const products = await Product.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } }
    ]
  })
  .limit(5)
  .select('name price images');

  res.status(200).json({
    success: true,
    data: products
  });
});

// @desc    Get full search results
// @route   GET /api/v1/search
// @access  Public
exports.getSearchResults = asyncHandler(async (req, res, next) => {
  const query = req.query.q || '';
  
  // Advanced search with pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    })
    .skip(skip)
    .limit(limit),
    
    Product.countDocuments({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pages: Math.ceil(total / limit),
    data: products
  });
});

