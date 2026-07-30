/**
 * routes/orders.js
 * ----------------
 * Express router handling API requests related to customer orders.
 * Endpoints:
 *   - GET /api/orders              : Retrieve all placed orders for Admin page
 *   - POST /api/orders             : Submit a new customer order
 *   - PATCH /api/orders/:id/status : Update the order status (e.g., pending -> completed)
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

/**
 * @route   GET /api/orders
 * @desc    Get all orders sorted by newest first (for Admin Dashboard)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Retrieve orders sorted by createdAt descending (-1)
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders from server' });
  }
});

/**
 * @route   POST /api/orders
 * @desc    Create a new customer order
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { customerName, address, phone, items, totalAmount } = req.body;

    // Basic server-side validation
    if (!customerName || !address || !phone) {
      return res.status(400).json({ error: 'Please provide customer name, address, and phone number' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one food item' });
    }

    // Calculate or verify total amount
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalTotal = totalAmount || calculatedTotal;

    // Instantiate new order
    const newOrder = new Order({
      customerName,
      address,
      phone,
      items,
      totalAmount: Number(finalTotal.toFixed(2)),
      status: 'pending'
    });

    // Save to database
    const savedOrder = await newOrder.save();
    console.log(`[Order Placed] Order ID: ${savedOrder._id} for ${customerName}`);

    res.status(201).json({
      message: 'Order placed successfully!',
      order: savedOrder
    });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: 'Failed to process and place order' });
  }
});

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status (e.g., pending -> completed)
 * @access  Public
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'out for delivery', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // return updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
