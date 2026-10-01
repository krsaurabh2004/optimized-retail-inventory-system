const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    type: {
      type: String,
      enum: ['PURCHASE', 'SALE', 'ADJUSTMENT', 'DAMAGED'],
      required: [true, 'Transaction type is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Transaction quantity is required']
    },
    previousStock: {
      type: Number,
      required: [true, 'Previous stock is required']
    },
    newStock: {
      type: Number,
      required: [true, 'New stock is required']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
