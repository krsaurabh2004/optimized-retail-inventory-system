const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    SKU: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    brand: {
      type: String,
      default: 'Generic',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: 0
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 0,
      min: 0
    },
    minimumStock: {
      type: Number,
      required: [true, 'Minimum stock threshold is required'],
      default: 10,
      min: 0
    },
    maximumStock: {
      type: Number,
      required: [true, 'Maximum stock target is required'],
      default: 100,
      min: 0
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier reference is required']
    },
    image: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Stock Status Virtual Property
productSchema.virtual('status').get(function () {
  if (this.quantity === 0) return 'Out of Stock';
  if (this.quantity <= this.minimumStock) return 'Low Stock';
  return 'In Stock';
});

// Reorder Required Virtual Property
productSchema.virtual('reorderRequired').get(function () {
  return this.quantity <= this.minimumStock;
});

// Recommended Order Quantity Virtual Property
productSchema.virtual('recommendedOrderQuantity').get(function () {
  if (this.quantity <= this.minimumStock) {
    return Math.max(0, this.maximumStock - this.quantity);
  }
  return 0;
});

module.exports = mongoose.model('Product', productSchema);
