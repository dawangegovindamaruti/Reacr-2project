import { CartItem } from '../models/CartItem.js';
import { Product } from '../models/Product.js';
import { DeliveryOption } from '../models/DeliveryOption.js';

// GET all cart items with optional product expansion
export const getCartItems = async (req, res) => {
  try {
    const expand = req.query.expand;
    let cartItems = await CartItem.find({}).sort({ createdAt: 1 });

    if (expand === 'product') {
      cartItems = await Promise.all(cartItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          ...item.toObject(),
          product
        };
      }));
    }

    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
};

// ADD item to cart (or increment quantity if exists)
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    // Validate quantity
    if (typeof quantity !== 'number' || quantity < 1 || quantity > 10) {
      return res.status(400).json({ 
        error: 'Quantity must be a number between 1 and 10' 
      });
    }

    // Check if item already in cart
    let cartItem = await CartItem.findOne({ productId });
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Create new cart item with default delivery option
      cartItem = await CartItem.create({ 
        productId, 
        quantity, 
        deliveryOptionId: "1" 
      });
    }

    res.status(201).json(cartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

// UPDATE cart item (quantity or delivery option)
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, deliveryOptionId } = req.body;

    const cartItem = await CartItem.findOne({ productId });
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Update quantity if provided
    if (quantity !== undefined) {
      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ 
          error: 'Quantity must be a number greater than 0' 
        });
      }
      cartItem.quantity = quantity;
    }

    // Update delivery option if provided
    if (deliveryOptionId !== undefined) {
      const deliveryOption = await DeliveryOption.findById(deliveryOptionId);
      if (!deliveryOption) {
        return res.status(400).json({ error: 'Invalid delivery option' });
      }
      cartItem.deliveryOptionId = deliveryOptionId;
    }

    await cartItem.save();
    res.json(cartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

// REMOVE item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cartItem = await CartItem.findOne({ productId });
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await cartItem.deleteOne();
    res.status(204).send();
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

// CLEAR entire cart
export const clearCart = async (req, res) => {
  try {
    await CartItem.deleteMany({});
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};
