const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

// @desc    Get all suppliers (with optional search)
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await Supplier.find(query).sort({ createdAt: -1 });

    // Attach count of associated products for each supplier
    const suppliersWithCount = await Promise.all(
      suppliers.map(async (sup) => {
        const productCount = await Product.countDocuments({ supplier: sup._id });
        return {
          ...sup.toObject(),
          productCount
        };
      })
    );

    res.json(suppliersWithCount);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      res.status(404);
      throw new Error('Supplier not found');
    }
    const productCount = await Product.countDocuments({ supplier: supplier._id });
    res.json({ ...supplier.toObject(), productCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private/Admin
const createSupplier = async (req, res, next) => {
  try {
    const { name, companyName, phone, email, address } = req.body;

    if (!name || !companyName || !phone || !email) {
      res.status(400);
      throw new Error('Please provide name, company name, phone, and email');
    }

    const supplier = await Supplier.create({
      name,
      companyName,
      phone,
      email: email.toLowerCase(),
      address: address || ''
    });

    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      res.status(404);
      throw new Error('Supplier not found');
    }

    supplier.name = req.body.name || supplier.name;
    supplier.companyName = req.body.companyName || supplier.companyName;
    supplier.phone = req.body.phone || supplier.phone;
    supplier.email = req.body.email ? req.body.email.toLowerCase() : supplier.email;
    supplier.address = req.body.address !== undefined ? req.body.address : supplier.address;

    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      res.status(404);
      throw new Error('Supplier not found');
    }

    // Check if supplier has associated products
    const productCount = await Product.countDocuments({ supplier: supplier._id });
    if (productCount > 0) {
      res.status(400);
      throw new Error(`Cannot delete supplier. ${productCount} products are associated with this supplier.`);
    }

    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
