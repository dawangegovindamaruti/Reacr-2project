import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const productSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  image: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  priceCents: {
    type: Number,
    required: true
  },
  keywords: {
    type: [String],
    required: true
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
  collection: 'products'
});

// Sort by createdAt ascending by default
productSchema.query.byDefault = function() {
  return this.sort({ createdAt: 1 });
};

export const Product = mongoose.model('Product', productSchema);
