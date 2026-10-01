const Product = require('../models/Product');
const Sale = require('../models/Sale');

// @desc    Get complete real-time dashboard analytics
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const products = await Product.find().populate('supplier', 'name companyName');

    const totalProducts = products.length;
    let totalInventoryQuantity = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const lowStockList = [];

    products.forEach((p) => {
      totalInventoryQuantity += p.quantity;
      if (p.quantity === 0) {
        outOfStockCount++;
        lowStockList.push({
          _id: p._id,
          name: p.name,
          SKU: p.SKU,
          category: p.category,
          quantity: p.quantity,
          minimumStock: p.minimumStock,
          maximumStock: p.maximumStock,
          status: 'Out of Stock'
        });
      } else if (p.quantity <= p.minimumStock) {
        lowStockCount++;
        lowStockList.push({
          _id: p._id,
          name: p.name,
          SKU: p.SKU,
          category: p.category,
          quantity: p.quantity,
          minimumStock: p.minimumStock,
          maximumStock: p.maximumStock,
          status: 'Low Stock'
        });
      }
    });

    // Sales metrics
    const allSales = await Sale.find().populate('product', 'name SKU category').sort({ createdAt: -1 });

    const totalRevenue = allSales.reduce((acc, sale) => acc + sale.totalAmount, 0);

    // Today's sales
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaySales = allSales.filter((s) => new Date(s.createdAt) >= startOfToday);
    const todaysSalesCount = todaySales.length;
    const todaysRevenue = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);

    // 1. Sales over the last 7 days chart data
    const last7DaysData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const daySales = allSales.filter((s) => {
        const saleDate = new Date(s.createdAt);
        return saleDate >= d && saleDate <= dayEnd;
      });

      const dayRevenue = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
      const dayUnits = daySales.reduce((sum, s) => sum + s.quantity, 0);

      last7DaysData.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: d.toISOString().split('T')[0],
        salesCount: daySales.length,
        unitsSold: dayUnits,
        revenue: Math.round(dayRevenue * 100) / 100
      });
    }

    // 2. Inventory by category chart data
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
    const inventoryByCategory = Object.values(categoryMap);

    // Recent Sales table (last 5 sales)
    const recentSales = allSales.slice(0, 5).map((s) => ({
      _id: s._id,
      productName: s.product ? s.product.name : 'Unknown Product',
      quantity: s.quantity,
      unitPrice: s.unitPrice,
      total: s.totalAmount,
      date: s.createdAt
    }));

    res.json({
      metrics: {
        totalProducts,
        totalInventoryQuantity,
        lowStockProducts: lowStockCount,
        outOfStockProducts: outOfStockCount,
        todaysSalesCount,
        todaysRevenue: Math.round(todaysRevenue * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100
      },
      charts: {
        salesLast7Days: last7DaysData,
        inventoryByCategory
      },
      lowStockAlerts: lowStockList,
      recentSales
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
