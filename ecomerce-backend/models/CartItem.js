import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    ref: 'Product' 
  },
  quantity: {
    type: Number,
    required: true
  },
  deliveryOptionId: {
    type: String,
    required: true,
    ref: 'DeliveryOption'
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
  collection: 'cartItems'
});

// Sort by createdAt ascending by default
cartItemSchema.query.byDefault = function() {
  return this.sort({ createdAt: 1 });
};

export const CartItem = mongoose.model('CartItem', cartItemSchema);
