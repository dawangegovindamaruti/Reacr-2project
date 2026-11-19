import { Product } from '../models/Product.js';
import { DeliveryOption } from '../models/DeliveryOption.js';
import { CartItem } from '../models/CartItem.js';
import { Order } from '../models/Order.js';
import { defaultProducts } from '../defaultData/defaultProducts.js';
import { defaultDeliveryOptions } from '../defaultData/defaultDeliveryOptions.js';
import { defaultCart } from '../defaultData/defaultCart.js';
import { defaultOrders } from '../defaultData/defaultOrders.js';

// RESET database to default data
export const resetDatabase = async (req, res) => {
  try {
    // Delete all existing data
    await Product.deleteMany({});
    await DeliveryOption.deleteMany({});
    await CartItem.deleteMany({});
    await Order.deleteMany({});

    // Create timestamps for consistent ordering
    const timestamp = Date.now();

    // Transform default data with timestamps
    const productsWithTimestamps = defaultProducts.map((product, index) => ({
      _id: product.id,
      ...product,
      createdAt: new Date(timestamp + index),
      updatedAt: new Date(timestamp + index)
    }));

    const deliveryOptionsWithTimestamps = defaultDeliveryOptions.map((option, index) => ({
      _id: option.id,
      ...option,
      createdAt: new Date(timestamp + index),
      updatedAt: new Date(timestamp + index)
    }));

    const cartItemsWithTimestamps = defaultCart.map((item, index) => ({
      ...item,
      createdAt: new Date(timestamp + index),
      updatedAt: new Date(timestamp + index)
    }));

    const ordersWithTimestamps = defaultOrders.map((order, index) => ({
      _id: order.id,
      ...order,
      createdAt: new Date(timestamp + index),
      updatedAt: new Date(timestamp + index)
    }));

    // Insert default data
    await Product.insertMany(productsWithTimestamps);
    await DeliveryOption.insertMany(deliveryOptionsWithTimestamps);
    await CartItem.insertMany(cartItemsWithTimestamps);
    await Order.insertMany(ordersWithTimestamps);

    res.json({
      message: 'Database reset successfully with default data',
      summary: {
        products: productsWithTimestamps.length,
        deliveryOptions: deliveryOptionsWithTimestamps.length,
        cartItems: cartItemsWithTimestamps.length,
        orders: ordersWithTimestamps.length
      }
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({
      error: 'Failed to reset database',
      details: error.message
    });
  }
};

// CLEAR all data (without loading defaults)
export const clearAllData = async (req, res) => {
  try {
    await Product.deleteMany({});
    await DeliveryOption.deleteMany({});
    await CartItem.deleteMany({});
    await Order.deleteMany({});

    res.json({
      message: 'All data cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({
      error: 'Failed to clear data',
      details: error.message
    });
  }
};
