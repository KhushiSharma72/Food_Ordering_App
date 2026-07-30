/**
 * models/Order.js
 * ---------------
 * This file defines the Mongoose schema and model for customer orders.
 * Each order records customer contact details, the ordered food items,
 * total price, order status, and timestamp.
 */

const mongoose = require('mongoose');

// Schema for individual items within an order
const orderItemSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  }
}, { _id: false });

// Main Order Schema
const orderSchema = new mongoose.Schema({
  // Customer full name
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  // Delivery address
  address: {
    type: String,
    required: [true, 'Delivery address is required'],
    trim: true
  },
  // Contact phone number
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  // Array of food items included in this order
  items: {
    type: [orderItemSchema],
    validate: [array => array.length > 0, 'Order must contain at least one item']
  },
  // Total cost of all items in the order
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  // Order status: "pending", "preparing", "out for delivery", "completed", "cancelled"
  status: {
    type: String,
    enum: ['pending', 'preparing', 'out for delivery', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Timestamp when order was submitted
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compile and export the Order model
module.exports = mongoose.model('Order', orderSchema);
