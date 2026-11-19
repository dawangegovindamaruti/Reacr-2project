import mongoose from 'mongoose';

const deliveryOptionSchema = new mongoose.Schema({
  _id: {
    type: String,
    alias: 'id'
  },
  deliveryDays: {
    type: Number,
    required: true
  },
  priceCents: {
    type: Number,
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
  collection: 'deliveryOptions'
});

// Sort by createdAt ascending by default
deliveryOptionSchema.query.byDefault = function() {
  return this.sort({ createdAt: 1 });
};

export const DeliveryOption = mongoose.model('DeliveryOption', deliveryOptionSchema);
