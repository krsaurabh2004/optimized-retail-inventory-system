const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getProducts)
  .post(authorize('Admin'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(authorize('Admin'), updateProduct)
  .delete(authorize('Admin'), deleteProduct);

module.exports = router;
