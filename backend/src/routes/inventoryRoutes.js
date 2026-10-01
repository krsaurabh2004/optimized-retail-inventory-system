const express = require('express');
const router = express.Router();
const {
  getInventory,
  getLowStock,
  getOutOfStock,
  getTransactions,
  adjustStock
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getInventory);
router.get('/low-stock', getLowStock);
router.get('/out-of-stock', getOutOfStock);
router.get('/transactions', getTransactions);
router.post('/adjust', authorize('Admin'), adjustStock);

module.exports = router;
