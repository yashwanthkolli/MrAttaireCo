const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/admin');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);

module.exports = router;