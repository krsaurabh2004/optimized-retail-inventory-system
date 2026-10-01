const mongoose = require('mongoose');

const purchaseRecommendationSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier reference is required']
    },
    currentStock: {
      type: Number,
      required: true
    },
    recommendedQuantity: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Ordered', 'Completed'],
      default: 'Pending'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PurchaseRecommendation', purchaseRecommendationSchema);
