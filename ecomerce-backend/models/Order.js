import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const orderSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  orderTimeMs: {
    type: Number,
    required: true
  },
  totalCostCents: {
    type: Number,
    required: true
  },
  products: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed', 'refunded'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'orders'
});

// Sort by createdAt ascending by default
orderSchema.query.byDefault = function() {
  return this.sort({ createdAt: 1 });
};

export const Order = mongoose.model('Order', orderSchema);
