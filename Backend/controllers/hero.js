const Hero = require('../models/Hero');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/async');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get hero content
// @route   GET /api/v1/hero
// @access  Public
exports.getHero = asyncHandler(async (req, res, next) => {
  const hero = await Hero.findOne({ isActive: true });
  res.status(200).json({
    success: true,
    data: hero || {}
  });
});

// @desc    Update hero content
// @route   PUT /api/v1/hero
// @access  Private/Admin
exports.updateHero = asyncHandler(async (req, res, next) => {
  let hero = await Hero.findOne({ isActive: true });

  if (!hero) {
    hero = await Hero.create(req.body);
  } else {
    hero = await Hero.findOneAndUpdate({ isActive: true }, req.body, {
      new: true,
      runValidators: true
    });
  }

  res.status(200).json({
    success: true,
    data: hero
  });
});

// @desc    Upload hero background image
// @route   PUT /api/v1/hero/image
// @access  Private/Admin
exports.uploadHeroImage = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.image;
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Delete old image if exists
  const hero = await Hero.findOne({ isActive: true });
  if (hero && hero.backgroundImage.public_id) {
    await cloudinary.uploader.destroy(hero.backgroundImage.public_id);
  }

  try {
    // Upload new image
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'mr_attire/hero',
      width: 1920,
      height: 1080,
      crop: 'fill',
      quality: 'auto', 
      fetch_format: 'auto'
    });

    const backgroundImage = {
      url: result.secure_url,
      public_id: result.public_id
    };

    await Hero.findOneAndUpdate(
      { isActive: true },
      { backgroundImage },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: backgroundImage
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