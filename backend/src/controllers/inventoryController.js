const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc    Get complete inventory list with stock status & supplier info
// @route   GET /api/inventory
// @access  Private
const getInventory = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { SKU: { $regex: search, $options: 'i' } }
      ];
    }

    let products = await Product.find(query)
      .populate('supplier', 'name companyName email phone')
      .sort({ name: 1 });

    if (status && status !== 'All') {
      products = products.filter((p) => p.status === status);
    }

    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock products
// @route   GET /api/inventory/low-stock
// @access  Private
const getLowStock = async (req, res, next) => {
  try {
    const products = await Product.find().populate('supplier', 'name companyName');
    const lowStockProducts = products.filter(
      (p) => p.quantity > 0 && p.quantity <= p.minimumStock
    );
    res.json(lowStockProducts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get out of stock products
// @route   GET /api/inventory/out-of-stock
// @access  Private
const getOutOfStock = async (req, res, next) => {
  try {
    const products = await Product.find({ quantity: 0 }).populate('supplier', 'name companyName');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory transaction history
// @route   GET /api/inventory/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { type, search } = req.query;
    let query = {};

    if (type && type !== 'All') {
      query.type = type;
    }

    let transactions = await InventoryTransaction.find(query)
      .populate('product', 'name SKU category brand price image')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      transactions = transactions.filter(
        (t) =>
          t.product?.name.toLowerCase().includes(s) ||
          t.product?.SKU.toLowerCase().includes(s) ||
          t.createdBy?.name.toLowerCase().includes(s)
      );
    }

    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// @desc    Manual inventory adjustment (PURCHASE, ADJUSTMENT, DAMAGED)
// @route   POST /api/inventory/adjust
// @access  Private/Admin
const adjustStock = async (req, res, next) => {
  try {
    const { productId, type, quantity, note } = req.body;

    if (!productId || !type || quantity === undefined) {
      res.status(400);
      throw new Error('Please provide product ID, adjustment type, and quantity');
    }

    const validTypes = ['PURCHASE', 'ADJUSTMENT', 'DAMAGED'];
    if (!validTypes.includes(type)) {
      res.status(400);
      throw new Error(`Invalid transaction type. Must be one of: ${validTypes.join(', ')}`);
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const qtyNum = Number(quantity);
    const previousStock = product.quantity;
    let newStock = previousStock;

    if (type === 'PURCHASE') {
      newStock = previousStock + Math.abs(qtyNum);
    } else if (type === 'DAMAGED') {
      newStock = Math.max(0, previousStock - Math.abs(qtyNum));
    } else if (type === 'ADJUSTMENT') {
      // Direct override or relative adjustment based on sign
      newStock = Math.max(0, qtyNum);
    }

    product.quantity = newStock;
    await product.save();

    const transaction = await InventoryTransaction.create({
      product: product._id,
      type,
      quantity: Math.abs(newStock - previousStock),
      previousStock,
      newStock,
      createdBy: req.user._id,
      note: note || `Manual ${type} adjustment`
    });

    const populated = await InventoryTransaction.findById(transaction._id)
      .populate('product')
      .populate('createdBy', 'name email role');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  getLowStock,
  getOutOfStock,
  getTransactions,
  adjustStock
};
