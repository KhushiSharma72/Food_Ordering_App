/**
 * models/FoodItem.js
 * -------------------
 * This file defines the Mongoose schema and model for Food Items in our database.
 * A Schema defines the shape/structure of documents inside a MongoDB collection.
 */

const mongoose = require('mongoose');

// Define the FoodItem Schema
const foodItemSchema = new mongoose.Schema({
  // Name of the food item (e.g. "Margherita Pizza")
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true
  },
  // Price in USD or local currency (e.g. 12.99)
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  // Category (e.g. "Pizza", "Burgers", "Drinks", "Desserts")
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  // URL to an image representing the dish
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  // Availability status (true if available for order, false if out of stock)
  available: {
    type: Boolean,
    default: true
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

// Compile the schema into a Mongoose Model and export it
// 'FoodItem' will correspond to the 'fooditems' collection in MongoDB
module.exports = mongoose.model('FoodItem', foodItemSchema);
