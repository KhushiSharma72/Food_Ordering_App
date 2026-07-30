/**
 * script.js
 * ---------
 * Client-side JavaScript handling UI rendering, dynamic filtering,
 * shopping cart state management (using localStorage), checkout form handling,
 * and fetch() communications with the Express backend API.
 */

// --------------------------------------------------------------------------
// 1. Global State Variables
// --------------------------------------------------------------------------
let allFoodItems = []; // Holds all menu items fetched from GET /api/food
let currentCategory = 'All'; // Currently selected category filter
let cartState = JSON.parse(localStorage.getItem('biteDashCart')) || []; // Cart array [{foodId, name, price, image, quantity}]

// Base API URL (Relative URL works automatically when served by Express)
// Use localhost when the page is opened directly from the file system.
const API_BASE_URL = location.protocol === 'file:' ? 'http://localhost:5000' : '';
const CURRENCY_SYMBOL = '$';

function formatCurrency(amount) {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
}

// Initialize page functionality when DOM content has loaded
document.addEventListener('DOMContentLoaded', () => {
  // If we are on the customer menu page (index.html), load food items
  if (document.getElementById('menu-grid')) {
    fetchFoodMenu();
    updateCartUI();
  }
});

// --------------------------------------------------------------------------
// 2. Fetch & Render Menu Items (GET /api/food)
// --------------------------------------------------------------------------
/**
 * Fetches food menu items from the backend API using fetch()
 */
async function fetchFoodMenu() {
  const statusContainer = document.getElementById('status-message');
  const menuGrid = document.getElementById('menu-grid');

  try {
    statusContainer.innerHTML = '<p class="status-message">⏳ Loading delicious menu...</p>';

    // Send HTTP GET request to backend endpoint
    const response = await fetch(`${API_BASE_URL}/api/food`);

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    // Parse JSON response body
    allFoodItems = await response.json();
    statusContainer.innerHTML = ''; // Clear loading message

    if (allFoodItems.length === 0) {
      statusContainer.innerHTML = '<p class="status-message">No menu items found.</p>';
      return;
    }

    // Render food menu grid
    renderMenu(allFoodItems);

  } catch (error) {
    console.error('Error fetching food menu:', error);
    statusContainer.innerHTML = `
      <div class="status-message" style="color: #ff4757;">
        <p>⚠️ Unable to load menu items from backend server.</p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem; color: #64748b;">
          Please ensure backend is running with <code>npm start</code> or <code>node server.js</code>.
        </p>
      </div>
    `;
  }
}

/**
 * Renders an array of food item objects into HTML menu cards
 * @param {Array} items - List of food items to render
 */
function renderMenu(items) {
  const menuGrid = document.getElementById('menu-grid');
  menuGrid.innerHTML = '';

  if (items.length === 0) {
    menuGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b;">No food items match your filter.</p>';
    return;
  }

  items.forEach(food => {
    // Create card element
    const card = document.createElement('div');
    card.className = 'food-card';

    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${food.image}" alt="${food.name}" class="food-img" loading="lazy" onError="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'">
        <span class="category-tag">${food.category}</span>
      </div>
      <div class="card-body">
        <h3 class="food-title">${food.name}</h3>
        <div class="food-price">${formatCurrency(food.price)}</div>
        <button class="add-to-cart-btn" onclick="addToCart('${food._id}')">
          <span>➕ Add to Cart</span>
        </button>
      </div>
    `;

    menuGrid.appendChild(card);
  });
}

// --------------------------------------------------------------------------
// 3. Category & Search Filtering
// --------------------------------------------------------------------------
/**
 * Filter menu by category tab
 * @param {string} category - Category name (e.g. "Pizza", "Burgers")
 */
function filterCategory(category) {
  currentCategory = category;

  // Update active tab button style
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    if (tab.getAttribute('data-category') === category) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  filterMenu();
}

/**
 * Filter menu by search input and category selection
 */
function filterMenu() {
  const searchInput = document.getElementById('search-input');
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filtered = allFoodItems.filter(item => {
    const matchesCategory = (currentCategory === 'All' || item.category === currentCategory);
    const matchesSearch = item.name.toLowerCase().includes(searchTerm) || item.category.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  renderMenu(filtered);
}

// --------------------------------------------------------------------------
// 4. Cart State & LocalStorage Management
// --------------------------------------------------------------------------
/**
 * Save current cart state array to browser localStorage
 */
function saveCartToLocalStorage() {
  localStorage.setItem('biteDashCart', JSON.stringify(cartState));
}

/**
 * Adds a food item to cart or increments its quantity if already present
 * @param {string} foodId - Mongoose _id of the food item
 */
function addToCart(foodId) {
  const item = allFoodItems.find(f => f._id === foodId);
  if (!item) return;

  // Check if item is already in cart
  const existingCartIndex = cartState.findIndex(c => c.foodId === foodId);

  if (existingCartIndex > -1) {
    cartState[existingCartIndex].quantity += 1;
  } else {
    cartState.push({
      foodId: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
  }

  saveCartToLocalStorage();
  updateCartUI();
  showToast(`Added "${item.name}" to cart!`, 'success');
}

/**
 * Change quantity of an item in cart (+1 or -1)
 * @param {string} foodId - ID of food item
 * @param {number} change - Amount to change (+1 or -1)
 */
function updateQuantity(foodId, change) {
  const index = cartState.findIndex(c => c.foodId === foodId);
  if (index === -1) return;

  cartState[index].quantity += change;

  // If quantity drops to 0 or below, remove item from cart
  if (cartState[index].quantity <= 0) {
    cartState.splice(index, 1);
  }

  saveCartToLocalStorage();
  updateCartUI();
}

/**
 * Remove an item from the cart
 * @param {string} foodId - ID of food item
 */
function removeFromCart(foodId) {
  cartState = cartState.filter(c => c.foodId !== foodId);
  saveCartToLocalStorage();
  updateCartUI();
  showToast('Item removed from cart', 'error');
}

/**
 * Re-renders Cart Drawer UI, badge count, subtotal, and total amount
 */
function updateCartUI() {
  const cartCountElem = document.getElementById('cart-count');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const subtotalElem = document.getElementById('cart-subtotal');
  const totalElem = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  // Total quantity count across all cart items
  const totalCount = cartState.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountElem) cartCountElem.innerText = totalCount;

  // Total amount calculation
  const subtotal = cartState.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (subtotalElem) subtotalElem.innerText = formatCurrency(subtotal);
  if (totalElem) totalElem.innerText = formatCurrency(subtotal);

  // Enable/disable Checkout button
  if (checkoutBtn) {
    checkoutBtn.disabled = cartState.length === 0;
  }

  // Render cart item rows inside cart drawer
  if (cartItemsContainer) {
    if (cartState.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <p>Your cart is empty.</p>
          <small>Add some items from the menu to start!</small>
        </div>
      `;
      return;
    }

    cartItemsContainer.innerHTML = '';
    cartState.forEach(item => {
      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item';
      itemRow.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${formatCurrency(item.price)}</div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQuantity('${item.foodId}', -1)">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity('${item.foodId}', 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart('${item.foodId}')" title="Remove item">&times;</button>
      `;
      cartItemsContainer.appendChild(itemRow);
    });
  }
}

/**
 * Toggle cart drawer open/close
 * @param {boolean} isOpen 
 */
function toggleCart(isOpen) {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (!drawer || !overlay) return;

  if (isOpen) {
    drawer.classList.add('active');
    overlay.classList.add('active');
  } else {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
  }
}

// --------------------------------------------------------------------------
// 5. Checkout & Order Placement (POST /api/orders)
// --------------------------------------------------------------------------
/**
 * Opens Checkout Form Modal
 */
function openCheckoutModal() {
  if (cartState.length === 0) return;

  toggleCart(false); // Close cart drawer
  const modal = document.getElementById('checkout-modal');
  const modalItemsList = document.getElementById('modal-items-list');
  const modalCount = document.getElementById('modal-item-count');
  const modalTotal = document.getElementById('modal-total-price');

  // Populate order summary inside modal
  const totalCount = cartState.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartState.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  modalCount.innerText = totalCount;
  modalTotal.innerText = formatCurrency(totalAmount);

  modalItemsList.innerHTML = cartState.map(i => `
    <div class="modal-item-row">
      <span>${i.quantity}x ${i.name}</span>
      <span>${formatCurrency(i.price * i.quantity)}</span>
    </div>
  `).join('');

  modal.classList.add('active');
}

/**
 * Closes Checkout Form Modal
 */
function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('active');
}

/**
 * Handles Form submission for placing a new order
 * @param {Event} event 
 */
async function handlePlaceOrder(event) {
  event.preventDefault();

  const nameInput = document.getElementById('customerName').value.trim();
  const phoneInput = document.getElementById('phone').value.trim();
  const addressInput = document.getElementById('address').value.trim();
  const submitBtn = document.getElementById('submit-order-btn');

  if (!nameInput || !phoneInput || !addressInput) {
    showToast('Please fill out all required fields', 'error');
    return;
  }

  const totalAmount = cartState.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Construct payload body
  const orderPayload = {
    customerName: nameInput,
    phone: phoneInput,
    address: addressInput,
    items: cartState.map(item => ({
      foodId: item.foodId,
      name: item.name,
      price: Number(item.price.toFixed(2)),
      quantity: item.quantity
    })),
    totalAmount: Number(totalAmount.toFixed(2))
  };

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Submitting Order...';

    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to place order');
    }

    // Success! Clear cart state
    cartState = [];
    saveCartToLocalStorage();
    updateCartUI();

    // Reset checkout form
    document.getElementById('checkout-form').reset();
    closeCheckoutModal();

    // Show success modal with order reference
    const successModal = document.getElementById('success-modal');
    const orderIdElem = document.getElementById('success-order-id');
    if (orderIdElem) orderIdElem.innerText = `#${result.order._id.substring(result.order._id.length - 6)}`;
    if (successModal) successModal.classList.add('active');
  } catch (error) {
    console.error('Error placing order:', error);
    showToast(`Error: ${error.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Confirm & Place Order';
  }
}

function closeSuccessModal() {
  const successModal = document.getElementById('success-modal');
  if (successModal) successModal.classList.remove('active');
}

// --------------------------------------------------------------------------
// 6. Admin Orders Page Logic (GET /api/orders & PATCH /api/orders/:id/status)
// --------------------------------------------------------------------------
let adminOrdersCache = [];

/**
 * Fetch all customer orders from backend (Admin Page)
 */
async function fetchAdminOrders() {
  const statusElem = document.getElementById('admin-status-message');
  const container = document.getElementById('orders-list-container');
  if (!container) return; // Not on admin page

  try {
    statusElem.innerHTML = '<p class="status-message">⏳ Fetching customer orders...</p>';

    const response = await fetch(`${API_BASE_URL}/api/orders`);
    if (!response.ok) throw new Error('Failed to load orders');

    adminOrdersCache = await response.json();
    statusElem.innerHTML = '';

    updateAdminMetrics(adminOrdersCache);
    filterAdminOrders();

  } catch (error) {
    console.error('Error fetching admin orders:', error);
    statusElem.innerHTML = `
      <div class="status-message" style="color: #ff4757;">
        <p>⚠️ Failed to connect to server. Unable to load orders.</p>
      </div>
    `;
  }
}

/**
 * Update top metric cards (Total Orders, Revenue, Pending, Completed)
 * @param {Array} orders 
 */
function updateAdminMetrics(orders) {
  const totalCountElem = document.getElementById('metric-total-orders');
  const totalRevElem = document.getElementById('metric-total-revenue');
  const pendingElem = document.getElementById('metric-pending-orders');
  const completedElem = document.getElementById('metric-completed-orders');

  if (!totalCountElem) return;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  totalCountElem.innerText = orders.length;
  totalRevElem.innerText = formatCurrency(totalRevenue);
  pendingElem.innerText = pendingCount;
  completedElem.innerText = completedCount;
}

/**
 * Filter orders by status dropdown & search text
 */
function filterAdminOrders() {
  const filterSelect = document.getElementById('status-filter');
  const searchInput = document.getElementById('admin-search-input');

  const selectedStatus = filterSelect ? filterSelect.value : 'all';
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filtered = adminOrdersCache.filter(order => {
    const matchesStatus = (selectedStatus === 'all' || order.status === selectedStatus);
    const matchesSearch = (
      order.customerName.toLowerCase().includes(searchTerm) ||
      order.phone.includes(searchTerm) ||
      (order._id && order._id.includes(searchTerm))
    );
    return matchesStatus && matchesSearch;
  });

  renderAdminOrdersList(filtered);
}

/**
 * Renders array of order cards into admin view
 * @param {Array} orders 
 */
function renderAdminOrdersList(orders) {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  container.innerHTML = '';

  if (orders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: #fff; border-radius: 12px; color: #64748b;">
        <p style="font-size: 1.2rem;">No orders found matching criteria.</p>
      </div>
    `;
    return;
  }

  orders.forEach(order => {
    const formattedDate = new Date(order.createdAt).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const card = document.createElement('div');
    card.className = 'order-card';

    // Status CSS Class mapping
    let statusClass = 'status-pending';
    if (order.status === 'preparing') statusClass = 'status-preparing';
    if (order.status === 'out for delivery') statusClass = 'status-delivery';
    if (order.status === 'completed') statusClass = 'status-completed';
    if (order.status === 'cancelled') statusClass = 'status-cancelled';

    card.innerHTML = `
      <div class="order-card-header">
        <div class="order-id-info">
          <h3>Order #${order._id.substring(order._id.length - 6).toUpperCase()}</h3>
          <span class="order-time">🕒 ${formattedDate}</span>
        </div>
        <span class="status-badge ${statusClass}">${order.status}</span>
      </div>

      <div class="order-card-body">
        <div class="customer-details">
          <h4>Customer Info</h4>
          <p><strong>👤 Name:</strong> ${order.customerName}</p>
          <p><strong>📞 Phone:</strong> ${order.phone}</p>
          <p><strong>📍 Address:</strong> ${order.address}</p>
        </div>

        <div class="order-items-list">
          <h4>Items Ordered (${order.items ? order.items.length : 0})</h4>
          ${(order.items || []).map(item => `
            <div class="order-item-bullet">
              • <strong>${item.quantity}x</strong> ${item.name} (${formatCurrency(item.price)} each)
            </div>
          `).join('')}
        </div>

        <div class="order-price-action">
          <div class="order-total-amount">${formatCurrency(order.totalAmount ? order.totalAmount : 0)}</div>
          
          <select class="status-select" onchange="updateOrderStatus('${order._id}', this.value)">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
            <option value="out for delivery" ${order.status === 'out for delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Updates order status on server via PATCH /api/orders/:id/status
 * @param {string} orderId 
 * @param {string} newStatus 
 */
async function updateOrderStatus(orderId, newStatus) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) throw new Error('Failed to update status');

    showToast(`Order status updated to "${newStatus}"`, 'success');
    fetchAdminOrders(); // Refresh list & metrics

  } catch (error) {
    console.error('Error updating order status:', error);
    showToast('Failed to update status', 'error');
  }
}

// --------------------------------------------------------------------------
// 7. Notification Toast Helper
// --------------------------------------------------------------------------
/**
 * Show temporary toast notification on screen
 * @param {string} message 
 * @param {string} type - 'success' or 'error'
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '⚠️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove toast after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
