const Product = require('../models/Product');
const PurchaseRecommendation = require('../models/PurchaseRecommendation');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc    Get inventory optimization analysis for all products
// @route   GET /api/optimization
// @access  Private
const getOptimization = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('supplier', 'name companyName email phone')
      .sort({ name: 1 });

    const optimizationData = products.map((product) => {
      const currentStock = product.quantity;
      const minimumStock = product.minimumStock;
      const maximumStock = product.maximumStock;

      const isReorderRequired = currentStock <= minimumStock;
      const status = isReorderRequired ? 'REORDER REQUIRED' : 'STOCK SUFFICIENT';
      const recommendedOrder = isReorderRequired ? Math.max(0, maximumStock - currentStock) : 0;

      return {
        _id: product._id,
        productName: product.name,
        SKU: product.SKU,
        category: product.category,
        brand: product.brand,
        currentStock,
        minimumStock,
        maximumStock,
        status,
        isReorderRequired,
        recommendedOrder,
        supplier: product.supplier
      };
    });

    res.json(optimizationData);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate purchase recommendations for all low-stock items
// @route   POST /api/optimization/generate-recommendations
// @access  Private/Admin
const generateRecommendations = async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$minimumStock'] }
    }).populate('supplier');

    let createdCount = 0;
    let updatedCount = 0;

    for (const product of products) {
      const recommendedQty = Math.max(0, product.maximumStock - product.quantity);
      if (recommendedQty <= 0) continue;

      const existingRec = await PurchaseRecommendation.findOne({
        product: product._id,
        status: { $in: ['Pending', 'Ordered'] }
      });

      if (existingRec) {
        existingRec.currentStock = product.quantity;
        existingRec.recommendedQuantity = recommendedQty;
        await existingRec.save();
        updatedCount++;
      } else {
        await PurchaseRecommendation.create({
          product: product._id,
          supplier: product.supplier ? product.supplier._id : null,
          currentStock: product.quantity,
          recommendedQuantity: recommendedQty,
          status: 'Pending',
          notes: `Rule-based recommendation generated on ${new Date().toLocaleDateString()}`
        });
        createdCount++;
      }
    }

    res.json({
      message: `Purchase recommendations synced successfully. Created: ${createdCount}, Updated: ${updatedCount}`,
      createdCount,
      updatedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all purchase recommendations
// @route   GET /api/optimization/recommendations
// @access  Private
const getRecommendations = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    const recommendations = await PurchaseRecommendation.find(query)
      .populate('product', 'name SKU category quantity minimumStock maximumStock price image')
      .populate('supplier', 'name companyName phone email')
      .sort({ createdAt: -1 });

    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};

// @desc    Update purchase recommendation status (Pending -> Ordered -> Completed)
// @route   PUT /api/optimization/recommendations/:id
// @access  Private/Admin
const updateRecommendationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Ordered', 'Completed'];

    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const recommendation = await PurchaseRecommendation.findById(req.params.id)
      .populate('product')
      .populate('supplier');

    if (!recommendation) {
      res.status(404);
      throw new Error('Purchase recommendation not found');
    }

    const prevStatus = recommendation.status;
    recommendation.status = status;
    await recommendation.save();

    // If status is changed to Completed, automatically restock the product inventory!
    if (status === 'Completed' && prevStatus !== 'Completed' && recommendation.product) {
      const product = await Product.findById(recommendation.product._id);
      if (product) {
        const previousStock = product.quantity;
        const restockQty = recommendation.recommendedQuantity;
        const newStock = previousStock + restockQty;

        product.quantity = newStock;
        await product.save();

        await InventoryTransaction.create({
          product: product._id,
          type: 'PURCHASE',
          quantity: restockQty,
          previousStock,
          newStock,
          createdBy: req.user._id,
          note: `Restocked via Purchase Recommendation completion (#${recommendation._id})`
        });
      }
    }

    res.json(recommendation);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOptimization,
  generateRecommendations,
  getRecommendations,
  updateRecommendationStatus
};
