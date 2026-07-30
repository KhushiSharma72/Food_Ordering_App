/**
 * routes/food.js
 * --------------
 * Express router handling API requests related to food menu items.
 * Endpoints:
 *   - GET /api/food  : Retrieve all available food items from the database
 *   - POST /api/food : Add a new food item to the menu
 */

const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');

/**
 * @route   GET /api/food
 * @desc    Get list of all food menu items
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Fetch all food items from the MongoDB collection
    const foodItems = await FoodItem.find({});
    res.status(200).json(foodItems);
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({ error: 'Failed to fetch food items from server' });
  }
});

/**
 * @route   POST /api/food
 * @desc    Add a new food item to the menu
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { name, price, category, image, available } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    // Create a new FoodItem document
    const newFood = new FoodItem({
      name,
      price: Number(price),
      category,
      image: image || undefined,
      available: available !== undefined ? available : true
    });

    // Save to database
    const savedFood = await newFood.save();
    res.status(201).json(savedFood);
  } catch (error) {
    console.error('Error creating food item:', error);
    res.status(500).json({ error: 'Failed to create new food item' });
  }
});

module.exports = router;
