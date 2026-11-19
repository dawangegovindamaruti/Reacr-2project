import express from 'express';
import {
  getDeliveryOptions,
  getDeliveryOptionById,
  createDeliveryOption,
  updateDeliveryOption,
  deleteDeliveryOption
} from '../controllers/deliveryController.js';

const router = express.Router();

// Delivery option routes
router.get('/', getDeliveryOptions);
router.post('/', createDeliveryOption);
router.get('/:optionId', getDeliveryOptionById);
router.put('/:optionId', updateDeliveryOption);
router.delete('/:optionId', deleteDeliveryOption);

export default router;
