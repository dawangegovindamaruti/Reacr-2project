import express from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  deleteOrder,
  deleteOrderProduct
} from '../controllers/orderController.js';

const router = express.Router();

// Order routes
router.get('/', getAllOrders);
router.post('/', createOrder);
router.get('/:orderId', getOrderById);
router.put('/:orderId/cancel', cancelOrder);
router.delete('/:orderId', deleteOrder);
router.delete('/:orderId/products/:productId', deleteOrderProduct);

export default router;
