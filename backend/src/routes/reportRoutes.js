const express = require('express');
const router = express.Router();
const { getReportData } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getReportData);

module.exports = router;
