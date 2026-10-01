const Sale = require('../models/Sale');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const PurchaseRecommendation = require('../models/PurchaseRecommendation');

// @desc    Record a new sale (POS)
// @route   POST /api/sales
// @access  Private (Admin & Employee)
const createSale = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || Number(quantity) <= 0) {
      res.status(400);
      throw new Error('Please select a valid product and enter quantity greater than 0');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const qtySold = Number(quantity);

    // Prevent selling more quantity than available stock
    if (product.quantity < qtySold) {
      res.status(400);
      throw new Error(`Insufficient stock. Available: ${product.quantity}, Requested: ${qtySold}`);
    }

    const previousStock = product.quantity;
    const newStock = previousStock - qtySold;
    const unitPrice = product.price;
    const totalAmount = unitPrice * qtySold;

    // 1. Create Sale record
    const sale = await Sale.create({
      product: product._id,
      quantity: qtySold,
      unitPrice,
      totalAmount,
      soldBy: req.user._id
    });

    // 2. Reduce product stock
    product.quantity = newStock;
    await product.save();

    // 3. Create inventory transaction
    await InventoryTransaction.create({
      product: product._id,
      type: 'SALE',
      quantity: qtySold,
      previousStock,
      newStock,
      createdBy: req.user._id,
      note: `POS Sale - ${qtySold} unit(s)`
    });

    // 4. Auto-check inventory optimization rule: If newStock <= minimumStock, check purchase recommendation
    if (newStock <= product.minimumStock) {
      const recQty = Math.max(0, product.maximumStock - newStock);
      if (recQty > 0) {
        const existingRec = await PurchaseRecommendation.findOne({
          product: product._id,
          status: 'Pending'
        });
        if (existingRec) {
          existingRec.currentStock = newStock;
          existingRec.recommendedQuantity = recQty;
          await existingRec.save();
        } else {
          await PurchaseRecommendation.create({
            product: product._id,
            supplier: product.supplier,
            currentStock: newStock,
            recommendedQuantity: recQty,
            status: 'Pending',
            notes: 'Auto-generated recommendation following POS sale low stock trigger'
          });
        }
      }
    }

    const populatedSale = await Sale.findById(sale._id)
      .populate('product', 'name SKU category price image')
      .populate('soldBy', 'name email role');

    res.status(201).json(populatedSale);
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales history
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res, next) => {
  try {
    const { startDate, endDate, search } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    let sales = await Sale.find(query)
      .populate('product', 'name SKU category brand price image')
      .populate('soldBy', 'name email role')
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      sales = sales.filter(
        (sale) =>
          sale.product?.name.toLowerCase().includes(s) ||
          sale.product?.SKU.toLowerCase().includes(s) ||
          sale.soldBy?.name.toLowerCase().includes(s)
      );
    }

    res.json(sales);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale by ID
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('product')
      .populate('soldBy', 'name email role');

    if (!sale) {
      res.status(404);
      throw new Error('Sale record not found');
    }
    res.json(sale);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById
};
