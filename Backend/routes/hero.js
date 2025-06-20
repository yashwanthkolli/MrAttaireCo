const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getHero,
  updateHero,
  uploadHeroImage
} = require('../controllers/hero');

const router = express.Router();

router.route('/')
  .get(getHero)
  .put(protect, authorize('admin'), updateHero);

router.route('/image')
  .put(protect, authorize('admin'), uploadHeroImage);

module.exports = router;