import { DeliveryOption } from '../models/DeliveryOption.js';

// GET all delivery options with optional estimated delivery time
export const getDeliveryOptions = async (req, res) => {
  try {
    const expand = req.query.expand;
    const deliveryOptions = await DeliveryOption.find().sort({ createdAt: 1 });
    let response = deliveryOptions;

    // Add estimated delivery time to each option
    if (expand === 'estimatedDeliveryTime') {
      response = deliveryOptions.map(option => {
        const deliveryTimeMs = Date.now() + option.deliveryDays * 24 * 60 * 60 * 1000;
        return {
          ...option.toObject(),
          estimatedDeliveryTimeMs: deliveryTimeMs
        };
      });
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching delivery options:', error);
    res.status(500).json({ error: 'Failed to fetch delivery options' });
  }
};

// GET single delivery option by ID
export const getDeliveryOptionById = async (req, res) => {
  try {
    const { optionId } = req.params;
    const option = await DeliveryOption.findById(optionId);

    if (!option) {
      return res.status(404).json({ error: 'Delivery option not found' });
    }

    res.json(option);
  } catch (error) {
    console.error('Error fetching delivery option:', error);
    res.status(500).json({ error: 'Failed to fetch delivery option' });
  }
};

// CREATE new delivery option
export const createDeliveryOption = async (req, res) => {
  try {
    const { deliveryDays, priceCents } = req.body;

    // Validate required fields
    if (deliveryDays === undefined || priceCents === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: deliveryDays, priceCents'
      });
    }

    // Validate types
    if (typeof deliveryDays !== 'number' || typeof priceCents !== 'number') {
      return res.status(400).json({
        error: 'deliveryDays and priceCents must be numbers'
      });
    }

    const newOption = await DeliveryOption.create({
      deliveryDays,
      priceCents
    });

    res.status(201).json({
      message: 'Delivery option created successfully',
      deliveryOption: newOption
    });
  } catch (error) {
    console.error('Error creating delivery option:', error);
    res.status(500).json({
      error: 'Failed to create delivery option',
      details: error.message
    });
  }
};

// UPDATE delivery option
export const updateDeliveryOption = async (req, res) => {
  try {
    const { optionId } = req.params;
    const { deliveryDays, priceCents } = req.body;

    const updateData = {};
    if (deliveryDays !== undefined) updateData.deliveryDays = deliveryDays;
    if (priceCents !== undefined) updateData.priceCents = priceCents;

    const option = await DeliveryOption.findByIdAndUpdate(
      optionId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!option) {
      return res.status(404).json({ error: 'Delivery option not found' });
    }

    res.json({ message: 'Delivery option updated successfully', deliveryOption: option });
  } catch (error) {
    console.error('Error updating delivery option:', error);
    res.status(500).json({ error: 'Failed to update delivery option' });
  }
};

// DELETE delivery option
export const deleteDeliveryOption = async (req, res) => {
  try {
    const { optionId } = req.params;
    const option = await DeliveryOption.findByIdAndDelete(optionId);

    if (!option) {
      return res.status(404).json({ error: 'Delivery option not found' });
    }

    res.json({ message: 'Delivery option deleted successfully' });
  } catch (error) {
    console.error('Error deleting delivery option:', error);
    res.status(500).json({ error: 'Failed to delete delivery option' });
  }
};
