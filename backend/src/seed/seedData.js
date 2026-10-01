const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const InventoryTransaction = require('../models/InventoryTransaction');
const PurchaseRecommendation = require('../models/PurchaseRecommendation');

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany();
    await Supplier.deleteMany();
    await Product.deleteMany();
    await Sale.deleteMany();
    await InventoryTransaction.deleteMany();
    await PurchaseRecommendation.deleteMany();

    console.log('Seeding Users...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@retail.com',
      password: 'admin123',
      role: 'Admin'
    });

    const employeeUser = await User.create({
      name: 'John Staff',
      email: 'employee@retail.com',
      password: 'employee123',
      role: 'Employee'
    });

    console.log('Seeding Suppliers...');
    const suppliers = await Supplier.insertMany([
      {
        name: 'Rajesh Kumar',
        companyName: 'Fresh Grains Co.',
        phone: '+91 98765 43210',
        email: 'supply@freshgrains.com',
        address: '102 Grain Market, Wholesale Enclave'
      },
      {
        name: 'Anita Sharma',
        companyName: 'Daily Dairy Supplies',
        phone: '+91 98123 45678',
        email: 'orders@dailydairy.com',
        address: '45 Dairy Farm Road, Sector 4'
      },
      {
        name: 'Vikram Mehta',
        companyName: 'Beverage World Distributors',
        phone: '+91 99000 11223',
        email: 'sales@beverageworld.com',
        address: '78 Industrial Area Phase 2'
      },
      {
        name: 'Sunil Verma',
        companyName: 'Quality Agro & Spices',
        phone: '+91 97777 88899',
        email: 'info@qualityagro.com',
        address: '12 Spice Bazaar, Central Hub'
      },
      {
        name: 'Priya Nair',
        companyName: 'Apex FMCG Traders',
        phone: '+91 96666 55544',
        email: 'contact@apexfmcg.com',
        address: '505 Logistics Park, Highway Junction'
      }
    ]);

    console.log('Seeding Products...');
    const productsData = [
      {
        name: 'Basmati Rice 5kg',
        SKU: 'RICE-BAS-001',
        category: 'Grains & Pulses',
        brand: 'India Gate',
        description: 'Premium long-grain aged Basmati rice',
        price: 450,
        costPrice: 380,
        quantity: 45,
        minimumStock: 15,
        maximumStock: 100,
        supplier: suppliers[0]._id
      },
      {
        name: 'Whole Wheat Atta 10kg',
        SKU: 'WHT-ATTA-002',
        category: 'Grains & Pulses',
        brand: 'Aashirvaad',
        description: '100% pure whole wheat flour',
        price: 390,
        costPrice: 320,
        quantity: 30,
        minimumStock: 10,
        maximumStock: 80,
        supplier: suppliers[0]._id
      },
      {
        name: 'Fresh Toned Milk 1L',
        SKU: 'MILK-TND-003',
        category: 'Dairy & Bakery',
        brand: 'Amul',
        description: 'Fresh pasteurized toned milk pouch',
        price: 66,
        costPrice: 54,
        quantity: 8, // LOW STOCK (min=20)
        minimumStock: 20,
        maximumStock: 60,
        supplier: suppliers[1]._id
      },
      {
        name: 'Whole Wheat Sandwich Bread',
        SKU: 'BRD-WHT-004',
        category: 'Dairy & Bakery',
        brand: 'Britannia',
        description: 'Soft slice whole wheat bread loaf 400g',
        price: 45,
        costPrice: 35,
        quantity: 5, // LOW STOCK (min=15)
        minimumStock: 15,
        maximumStock: 50,
        supplier: suppliers[1]._id
      },
      {
        name: 'Coca Cola 750ml',
        SKU: 'BEV-COKE-005',
        category: 'Beverages',
        brand: 'Coca Cola',
        description: 'Refreshing carbonated soft drink bottle',
        price: 40,
        costPrice: 30,
        quantity: 10, // LOW STOCK (min=20)
        minimumStock: 20,
        maximumStock: 80,
        supplier: suppliers[2]._id
      },
      {
        name: 'Pepsi Can 330ml',
        SKU: 'BEV-PEPSI-006',
        category: 'Beverages',
        brand: 'PepsiCo',
        description: 'Chilled cola beverage can',
        price: 35,
        costPrice: 25,
        quantity: 0, // OUT OF STOCK (min=15)
        minimumStock: 15,
        maximumStock: 60,
        supplier: suppliers[2]._id
      },
      {
        name: 'Marie Gold Biscuits 250g',
        SKU: 'BIS-MARIE-007',
        category: 'Snacks & Biscuits',
        brand: 'Britannia',
        description: 'Crispy tea time biscuit pack',
        price: 30,
        costPrice: 22,
        quantity: 60,
        minimumStock: 20,
        maximumStock: 120,
        supplier: suppliers[4]._id
      },
      {
        name: 'Refined Sunflower Oil 1L',
        SKU: 'OIL-SUN-008',
        category: 'Oil & Spices',
        brand: 'Fortune',
        description: 'Healthy refined sunflower cooking oil pouch',
        price: 165,
        costPrice: 140,
        quantity: 25,
        minimumStock: 12,
        maximumStock: 75,
        supplier: suppliers[3]._id
      },
      {
        name: 'Refined White Sugar 1kg',
        SKU: 'SGR-WHT-009',
        category: 'Groceries & Essentials',
        brand: 'Madhur',
        description: 'Pure sulphurless refined crystal sugar',
        price: 48,
        costPrice: 38,
        quantity: 40,
        minimumStock: 15,
        maximumStock: 100,
        supplier: suppliers[3]._id
      },
      {
        name: 'Premium CTC Assam Tea 500g',
        SKU: 'TEA-ASM-010',
        category: 'Groceries & Essentials',
        brand: 'Red Label',
        description: 'Strong aroma black CTC tea leaf pack',
        price: 280,
        costPrice: 220,
        quantity: 18,
        minimumStock: 10,
        maximumStock: 50,
        supplier: suppliers[3]._id
      },
      {
        name: 'Dark Fantasy Choco Fills 150g',
        SKU: 'BIS-DARK-011',
        category: 'Snacks & Biscuits',
        brand: 'Sunfeast',
        description: 'Rich molten chocolate filled cookies',
        price: 85,
        costPrice: 65,
        quantity: 4, // LOW STOCK (min=15)
        minimumStock: 15,
        maximumStock: 50,
        supplier: suppliers[4]._id
      },
      {
        name: 'Paneer Fresh 200g',
        SKU: 'DAIRY-PNR-012',
        category: 'Dairy & Bakery',
        brand: 'Mother Dairy',
        description: 'Soft & fresh cottage cheese block',
        price: 90,
        costPrice: 72,
        quantity: 0, // OUT OF STOCK (min=10)
        minimumStock: 10,
        maximumStock: 40,
        supplier: suppliers[1]._id
      }
    ];

    const products = await Product.insertMany(productsData);

    console.log('Seeding Historical Sales and Inventory Transactions...');
    const salesRecords = [];
    const transactionRecords = [];

    // Create realistic sales over the last 7 days
    const now = new Date();

    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      
      // 3 to 4 sales per day
      const dailySalesCount = 3 + Math.floor(Math.random() * 2);

      for (let s = 0; s < dailySalesCount; s++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 4) + 1;
        const total = prod.price * qty;

        const saleTime = new Date(date);
        saleTime.setHours(9 + s * 3, Math.floor(Math.random() * 59));

        salesRecords.push({
          product: prod._id,
          quantity: qty,
          unitPrice: prod.price,
          totalAmount: total,
          soldBy: s % 2 === 0 ? adminUser._id : employeeUser._id,
          createdAt: saleTime,
          updatedAt: saleTime
        });

        transactionRecords.push({
          product: prod._id,
          type: 'SALE',
          quantity: qty,
          previousStock: prod.quantity + qty,
          newStock: prod.quantity,
          createdBy: s % 2 === 0 ? adminUser._id : employeeUser._id,
          note: `Seeded POS Sale of ${qty} units`,
          createdAt: saleTime,
          updatedAt: saleTime
        });
      }
    }

    await Sale.insertMany(salesRecords);

    // Initial purchase transactions for all products
    for (const prod of products) {
      transactionRecords.push({
        product: prod._id,
        type: 'PURCHASE',
        quantity: prod.quantity + 20,
        previousStock: 0,
        newStock: prod.quantity + 20,
        createdBy: adminUser._id,
        note: 'Stock Inward Purchase Order',
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
      });
    }

    await InventoryTransaction.insertMany(transactionRecords);

    console.log('Seeding Purchase Recommendations for Low & Out-of-Stock Products...');
    const lowStockProducts = products.filter((p) => p.quantity <= p.minimumStock);
    const recommendationRecords = lowStockProducts.map((p, idx) => {
      const recQty = Math.max(0, p.maximumStock - p.quantity);
      return {
        product: p._id,
        supplier: p.supplier,
        currentStock: p.quantity,
        recommendedQuantity: recQty,
        status: idx === 0 ? 'Ordered' : 'Pending',
        notes: `Rule-based reorder recommendation: Recommended ${recQty} units (Max ${p.maximumStock} - Current ${p.quantity})`,
        createdAt: new Date(now.getTime() - idx * 3600 * 1000)
      };
    });

    await PurchaseRecommendation.insertMany(recommendationRecords);

    console.log('\n=============================================');
    console.log('DATABASE SEEDED SUCCESSFULLY!');
    console.log('=============================================');
    console.log(`Created ${products.length} Products`);
    console.log(`Created ${suppliers.length} Suppliers`);
    console.log(`Created ${salesRecords.length} Sales Records`);
    console.log(`Created ${transactionRecords.length} Inventory Transactions`);
    console.log(`Created ${recommendationRecords.length} Purchase Recommendations`);
    console.log('\nDemo User Accounts:');
    console.log('Admin:    admin@retail.com / admin123');
    console.log('Employee: employee@retail.com / employee123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
