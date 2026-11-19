import { Order } from '../models/Order.js';
import { CartItem } from '../models/CartItem.js';
import { Product } from '../models/Product.js';
import { DeliveryOption } from '../models/DeliveryOption.js';

// GET all orders with optional product expansion
export const getAllOrders = async (req, res) => {
  try {
    const expand = req.query.expand;
    let orders = await Order.find({}).sort({ orderTimeMs: -1 });

    if (expand === 'products') {
      orders = await Promise.all(orders.map(async (order) => {
        const products = await Promise.all(order.products.map(async (product) => {
          const productDetails = await Product.findById(product.productId);
          return {
            ...product,
            product: productDetails
          };
        }));
        return {
          ...order.toObject(),
          products
        };
      }));
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// GET single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const expand = req.query.expand;

    let order = await Order.findOne({ _id: orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (expand === 'products') {
      const products = await Promise.all(order.products.map(async (product) => {
        const productDetails = await Product.findById(product.productId);
        return {
          ...product,
          product: productDetails
        };
      }));
      order = {
        ...order.toObject(),
        products
      };
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// CREATE new order from cart
export const createOrder = async (req, res) => {
  try {
    // Get all cart items
    const cartItems = await CartItem.find({});

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let totalCostCents = 0;
    const products = await Promise.all(cartItems.map(async (item) => {
      // Validate product exists
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // Validate delivery option exists
      const deliveryOption = await DeliveryOption.findById(item.deliveryOptionId);
      if (!deliveryOption) {
        throw new Error(`Invalid delivery option: ${item.deliveryOptionId}`);
      }

      // Calculate costs
      const productCost = product.priceCents * item.quantity;
      const shippingCost = deliveryOption.priceCents;
      totalCostCents += productCost + shippingCost;

      // Calculate estimated delivery date
      const estimatedDeliveryTimeMs = Date.now() + deliveryOption.deliveryDays * 24 * 60 * 60 * 1000;

      return {
        productId: item.productId,
        quantity: item.quantity,
        estimatedDeliveryTimeMs
      };
    }));

    // Apply 10% tax
    totalCostCents = Math.round(totalCostCents * 1.1);

    // Create order
    const order = await Order.create({
      orderTimeMs: Date.now(),
      totalCostCents,
      products
    });

    // Clear cart after order creation
    await CartItem.deleteMany({});

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'Failed to create order',
      details: error.message
    });
  }
};

// CANCEL order (soft delete - mark as cancelled)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if order exists and status is active
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' });
    }

    // Update order status to cancelled
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      { status: 'cancelled', updatedAt: new Date() },
      { new: true }
    );

    res.json({ 
      message: 'Order cancelled successfully', 
      order: updatedOrder 
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

// DELETE order
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOneAndDelete({ _id: orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

// DELETE one product line from an order
export const deleteOrderProduct = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const productIndex = order.products.findIndex(product => product.productId === productId);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found in order' });
    }

    order.products.splice(productIndex, 1);

    if (order.products.length === 0) {
      await order.deleteOne();
      return res.json({
        message: 'Product and empty order removed successfully',
        orderDeleted: true
      });
    }

    order.totalCostCents = 0;

    for (const orderProduct of order.products) {
      const product = await Product.findById(orderProduct.productId);
      if (product) {
        order.totalCostCents += product.priceCents * orderProduct.quantity;
      }
    }

    order.totalCostCents = Math.round(order.totalCostCents * 1.1);
    order.updatedAt = new Date();
    await order.save();

    res.json({
      message: 'Product removed from order successfully',
      order
    });
  } catch (error) {
    console.error('Error deleting product from order:', error);
    res.status(500).json({ error: 'Failed to delete product from order' });
  }
};
