# 🍔 BiteDash - Full-Stack Food Ordering Web App

A beginner-friendly full-stack Food Ordering Application built with **HTML5, CSS3, Vanilla JavaScript**, **Node.js + Express**, and **MongoDB (via Mongoose)**.

This project is structured specifically to help developers learn how frontend interfaces interact with backend REST APIs and MongoDB databases.

---

## 🌟 Key Features

1. **Food Menu Browsing (`index.html`)**:
   - Dynamic food item rendering fetched from MongoDB (`GET /api/food`).
   - Category filtering (All, Burgers, Pizza, Drinks, Desserts).
   - Real-time search bar filtering.
2. **Interactive Shopping Cart**:
   - Add/remove items and increase/decrease quantities.
   - Real-time price calculation (subtotal & total).
   - LocalStorage persistence (cart stays intact across page reloads).
3. **Checkout & Order Placement**:
   - Customer form (Name, Phone number, Delivery address).
   - Validates input and submits order via `POST /api/orders`.
   - Clears cart state upon successful order placement and displays reference ID.
4. **Admin Dashboard (`orders.html`)**:
   - View all placed orders with customer details, item breakdown, and timestamps.
   - Summary statistics cards (Total Orders, Total Revenue, Pending Orders, Completed Orders).
   - Status update control (`pending`, `preparing`, `out for delivery`, `completed`, `cancelled`).
5. **Automatic Database Seeding**:
   - On server launch, if the food collection is empty, 9 sample food items across 4 categories are automatically inserted so the app is ready to use immediately!

---

## 📁 Project Directory Structure

```text
food-ordering-app/
├── public/                # Frontend static assets served by Express
│   ├── index.html         # Customer menu & shopping cart page
│   ├── orders.html        # Admin order management dashboard
│   ├── style.css          # Modern CSS layout, animations & styles
│   └── script.js          # Client-side JavaScript (fetch requests, DOM, state)
├── models/                # Mongoose database models
│   ├── FoodItem.js        # Schema for menu food items
│   └── Order.js           # Schema for customer orders
├── routes/                # Express API endpoint routes
│   ├── food.js            # GET /api/food, POST /api/food
│   └── orders.js          # GET /api/orders, POST /api/orders, PATCH /api/orders/:id/status
├── .env                   # Environment variables (PORT, MONGO_URI)
├── package.json           # Dependencies and scripts
├── server.js              # Express server setup, MongoDB connection & auto-seeding
└── README.md              # Documentation guide
```

---

## 🚀 How to Install and Run Locally

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally OR a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud database account.

---

### Step 1: Install Dependencies
Open your terminal inside the `food-ordering-app` directory and run:

```bash
npm install
```

This installs:
- `express`: Web server framework
- `mongoose`: MongoDB ODM driver
- `dotenv`: Loads `.env` environment variables
- `cors`: Handles cross-origin requests

---

### Step 2: Configure Environment Variables (`.env`)
Open or edit `.env` in the root folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/food-ordering-db
```

- **Local MongoDB**: Use `mongodb://127.0.0.1:27017/food-ordering-db`
- **MongoDB Atlas (Cloud)**: Replace `MONGO_URI` with your connection string:
  `mongodb+srv://<username>:<password>@cluster.mongodb.net/food-ordering-db`

---

### Step 3: Start the Application Server
Run the start command in your terminal:

```bash
npm start
```
*Or during development:*
```bash
npm run dev
```

You should see logs indicating:
```text
✅ Connected to MongoDB successfully at: mongodb://127.0.0.1:27017/food-ordering-db
🌱 Database menu is empty. Seeding sample food items...
✅ Successfully seeded 9 food items into database!
🚀 Food Ordering App is running live on http://localhost:5000
🍔 Customer Menu: http://localhost:5000
📋 Admin Orders: http://localhost:5000/orders.html
```

---

### Step 4: Open in Your Browser
- **Customer Menu Page**: Open [http://localhost:5000](http://localhost:5000)
- **Admin Orders Dashboard**: Open [http://localhost:5000/orders.html](http://localhost:5000/orders.html)

---

## �️ Screenshots

Below are the main app views shown in this project:

![Customer Menu](screenshots/customer-menu.png)

![Admin Dashboard](screenshots/admin-dashboard.png)

![Cart View](screenshots/cart-view.png)

> Add the matching image files to the `screenshots/` folder before publishing on GitHub.

## �📡 REST API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/food` | Retrieve all available food menu items |
| `POST` | `/api/food` | Add a new food item to the menu |
| `GET` | `/api/orders` | Retrieve all customer orders (sorted newest first) |
| `POST` | `/api/orders` | Submit a new customer order |
| `PATCH` | `/api/orders/:id/status` | Update the status of an order (`pending`, `completed`, etc.) |

---

## 💡 How Code Communication Works (For Beginners)

1. **Frontend (`script.js`)** uses the native browser `fetch()` function to send asynchronous HTTP requests to the backend server (e.g. `fetch('/api/food')`).
2. **Backend (`server.js` & `routes/`)** receives the HTTP request via Express endpoints and delegates queries to Mongoose models.
3. **Database (`models/`)** communicates with MongoDB to query or create document records.
4. **Data Return**: The server sends a JSON response back to `script.js`, which dynamically updates the DOM HTML using methods like `document.getElementById` and `appendChild`.

---

## 📄 License
ISC License - Feel free to use and modify this code for your own learning projects!
