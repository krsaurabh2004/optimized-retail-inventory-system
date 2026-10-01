const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc    Get all products (with search, category filter, status filter, sorting)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const { search, category, status, sortBy } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { SKU: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    let products = await Product.find(query).populate('supplier', 'name companyName email phone');

    // Filter by stock status if provided
    if (status && status !== 'All') {
      products = products.filter((p) => p.status === status);
    }

    // Sort products
    if (sortBy === 'name_asc') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name_desc') {
      products.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'price_low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'quantity_low') {
      products.sort((a, b) => a.quantity - b.quantity);
    } else if (sortBy === 'quantity_high') {
      products.sort((a, b) => b.quantity - a.quantity);
    } else {
      // Default: newest first
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplier');
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      SKU,
      category,
      brand,
      description,
      price,
      costPrice,
      quantity,
      minimumStock,
      maximumStock,
      supplier,
      image
    } = req.body;

    const skuExists = await Product.findOne({ SKU: SKU.toUpperCase() });
    if (skuExists) {
      res.status(400);
      throw new Error(`Product with SKU ${SKU} already exists`);
    }

    const initialQty = Number(quantity) || 0;

    const product = await Product.create({
      name,
      SKU: SKU.toUpperCase(),
      category,
      brand: brand || 'Generic',
      description: description || '',
      price: Number(price),
      costPrice: Number(costPrice),
      quantity: initialQty,
      minimumStock: Number(minimumStock) || 10,
      maximumStock: Number(maximumStock) || 100,
      supplier,
      image: image || ''
    });

    // Record initial inventory transaction if quantity > 0
    if (initialQty > 0) {
      await InventoryTransaction.create({
        product: product._id,
        type: 'PURCHASE',
        quantity: initialQty,
        previousStock: 0,
        newStock: initialQty,
        createdBy: req.user._id,
        note: 'Initial Stock Creation'
      });
    }

    const populatedProduct = await Product.findById(product._id).populate('supplier');
    res.status(201).json(populatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const previousQty = product.quantity;
    const newQty = req.body.quantity !== undefined ? Number(req.body.quantity) : previousQty;

    // Check SKU conflict if modified
    if (req.body.SKU && req.body.SKU.toUpperCase() !== product.SKU) {
      const skuExists = await Product.findOne({ SKU: req.body.SKU.toUpperCase() });
      if (skuExists) {
        res.status(400);
        throw new Error(`Product with SKU ${req.body.SKU} already exists`);
      }
    }

    product.name = req.body.name || product.name;
    product.SKU = req.body.SKU ? req.body.SKU.toUpperCase() : product.SKU;
    product.category = req.body.category || product.category;
    product.brand = req.body.brand || product.brand;
    product.description = req.body.description !== undefined ? req.body.description : product.description;
    product.price = req.body.price !== undefined ? Number(req.body.price) : product.price;
    product.costPrice = req.body.costPrice !== undefined ? Number(req.body.costPrice) : product.costPrice;
    product.quantity = newQty;
    product.minimumStock = req.body.minimumStock !== undefined ? Number(req.body.minimumStock) : product.minimumStock;
    product.maximumStock = req.body.maximumStock !== undefined ? Number(req.body.maximumStock) : product.maximumStock;
    product.supplier = req.body.supplier || product.supplier;
    if (req.body.image !== undefined) product.image = req.body.image;

    const updatedProduct = await product.save();

    // If stock changed, record an InventoryTransaction
    if (previousQty !== newQty) {
      const diff = newQty - previousQty;
      await InventoryTransaction.create({
        product: updatedProduct._id,
        type: diff > 0 ? 'PURCHASE' : 'ADJUSTMENT',
        quantity: Math.abs(diff),
        previousStock: previousQty,
        newStock: newQty,
        createdBy: req.user._id,
        note: req.body.adjustmentNote || 'Stock updated by Admin'
      });
    }

    const populated = await Product.findById(updatedProduct._id).populate('supplier');
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
