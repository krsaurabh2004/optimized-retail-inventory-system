const Product = require('../models/Product');
const Sale = require('../models/Sale');

// @desc    Get filtered report statistics
// @route   GET /api/reports
// @access  Private
const getReportData = async (req, res, next) => {
  try {
    const { range } = req.query; // 'today', '7days', '30days' (default '30days')
    const timeframe = range || '30days';

    const products = await Product.find();
    const totalProducts = products.length;
    const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= p.minimumStock).length;
    const outOfStockCount = products.filter((p) => p.quantity === 0).length;

    // Category distribution chart
    const categoryMap = {};
    products.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, totalProducts: 0, totalQuantity: 0, totalValue: 0 };
      }
      categoryMap[cat].totalProducts += 1;
      categoryMap[cat].totalQuantity += p.quantity;
      categoryMap[cat].totalValue += p.quantity * p.price;
    });

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    let daysCount = 30;
    if (timeframe === 'today') {
      daysCount = 1;
    } else if (timeframe === '7days') {
      daysCount = 7;
      startDate.setDate(startDate.getDate() - 6);
    } else {
      daysCount = 30;
      startDate.setDate(startDate.getDate() - 29);
    }

    const sales = await Sale.find({ createdAt: { $gte: startDate } }).populate('product');

    const totalSalesCount = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalUnitsSold = sales.reduce((sum, s) => sum + s.quantity, 0);

    // Build timeline chart data based on range
    const dailySalesMap = {};

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailySalesMap[dateStr] = { date: label, rawDate: dateStr, revenue: 0, salesCount: 0, units: 0 };
    }

    sales.forEach((s) => {
      const dateStr = new Date(s.createdAt).toISOString().split('T')[0];
      if (dailySalesMap[dateStr]) {
        dailySalesMap[dateStr].revenue += s.totalAmount;
        dailySalesMap[dateStr].salesCount += 1;
        dailySalesMap[dateStr].units += s.quantity;
      }
    });

    const dailySalesChart = Object.values(dailySalesMap).map((item) => ({
      ...item,
      revenue: Math.round(item.revenue * 100) / 100
    }));

    res.json({
      timeframe,
      metrics: {
        totalProducts,
        totalSalesCount,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalUnitsSold,
        lowStockCount,
        outOfStockCount
      },
      charts: {
        dailySales: dailySalesChart,
        categoryInventory: Object.values(categoryMap)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportData
};
