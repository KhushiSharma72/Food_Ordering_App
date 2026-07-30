/**
 * server.js
 * ---------
 * Main entry point for the Food Ordering Application backend.
 * Sets up Express server, connects to MongoDB via Mongoose, auto-seeds sample food items,
 * serves static frontend files from 'public/', and exposes API endpoints.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import Mongoose Models & Routes
const FoodItem = require('./models/FoodItem');
const foodRoutes = require('./routes/food');
const orderRoutes = require('./routes/orders');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food-ordering-db';

// -------------------------------------------------------------
// Middlewares
// -------------------------------------------------------------
app.use(cors()); // Allow cross-origin requests (for dev flexibility)
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static frontend files (index.html, orders.html, style.css, script.js)
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------
// Sample Data for Automatic Database Seeding
// -------------------------------------------------------------
const sampleFoodItems = [
  {
    name: "Classic Cheeseburger",
    price: 9.99,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    available: true
  },
  {
    name: "Double Bacon Smash Burger",
    price: 13.49,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
    available: true
  },
  {
    name: "Margherita Supreme Pizza",
    price: 14.99,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
    available: true
  },
  {
    name: "Pepperoni Passion Pizza",
    price: 16.99,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
    available: true
  },
  {
    name: "Crispy Veggie Garden Pizza",
    price: 13.99,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
    available: true
  },
  {
    name: "Iced Caramel Macchiato",
    price: 4.99,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
    available: true
  },
  {
    name: "Fresh Lemon Mint Soda",
    price: 3.99,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    available: true
  },
  {
    name: "Fudge Chocolate Brownie",
    price: 6.49,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    available: true
  },
  {
    name: "Strawberry Cream Cheesecake",
    price: 7.29,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80",
    available: true
  }
];

/**
 * Seed the database if no food items exist yet.
 */
async function seedDatabaseIfEmpty() {
  try {
    const count = await FoodItem.countDocuments();
    if (count === 0) {
      console.log('🌱 Database menu is empty. Seeding sample food items...');
      await FoodItem.insertMany(sampleFoodItems);
      console.log(`✅ Successfully seeded ${sampleFoodItems.length} food items into database!`);
    } else {
      console.log(`ℹ️ Database already contains ${count} food items.`);
    }
  } catch (err) {
    console.error('❌ Database seeding error:', err.message);
  }
}

// -------------------------------------------------------------
// Database Connection & Server Startup
// -------------------------------------------------------------
console.log('🔄 Connecting to MongoDB database...');
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log(`✅ Connected to MongoDB successfully at: ${MONGO_URI}`);
    // Auto-seed sample food items on startup
    await seedDatabaseIfEmpty();

    // Register API Endpoints
    app.use('/api/food', foodRoutes);
    app.use('/api/orders', orderRoutes);

    // Default route serving customer home page
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Food Ordering App is running live on http://localhost:${PORT}`);
      console.log(`🍔 Customer Menu: http://localhost:${PORT}`);
      console.log(`📋 Admin Orders: http://localhost:${PORT}/orders.html`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('💡 Tip: Make sure MongoDB service is running locally, or update MONGO_URI in .env');
    
    // Register API routes even if DB fails initially so app doesn't crash completely
    app.use('/api/food', foodRoutes);
    app.use('/api/orders', orderRoutes);

    app.listen(PORT, () => {
      console.log(`⚠️ Server running on http://localhost:${PORT} (Database pending connection)`);
    });
  });
