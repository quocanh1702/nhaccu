/* ===== DLQ Music Store - Storage Management ===== */

const Storage = {
  // Cart
  getCart() {
    return JSON.parse(localStorage.getItem('dlq_cart') || '[]');
  },
  setCart(cart) {
    localStorage.setItem('dlq_cart', JSON.stringify(cart));
    this.updateCartBadge();
  },
  addToCart(product, qty = 1) {
    const cart = this.getCart();
    const idx = cart.findIndex(i => i.id === product.id);
    if (idx > -1) {
      cart[idx].qty += qty;
    } else {
      cart.push({ ...product, qty });
    }
    this.setCart(cart);
    return cart;
  },
  removeFromCart(productId) {
    const cart = this.getCart().filter(i => i.id !== productId);
    this.setCart(cart);
    return cart;
  },
  updateCartQty(productId, qty) {
    const cart = this.getCart();
    const idx = cart.findIndex(i => i.id === productId);
    if (idx > -1) {
      if (qty <= 0) return this.removeFromCart(productId);
      cart[idx].qty = qty;
    }
    this.setCart(cart);
    return cart;
  },
  clearCart() {
    localStorage.removeItem('dlq_cart');
    this.updateCartBadge();
  },
  getCartTotal() {
    return this.getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
  },
  getCartCount() {
    return this.getCart().reduce((sum, i) => sum + i.qty, 0);
  },
  updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    const count = this.getCartCount();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  // Wishlist
  getWishlist() {
    return JSON.parse(localStorage.getItem('dlq_wishlist') || '[]');
  },
  addToWishlist(product) {
    const wishlist = this.getWishlist();
    if (!wishlist.find(i => i.id === product.id)) {
      wishlist.push(product);
      localStorage.setItem('dlq_wishlist', JSON.stringify(wishlist));
    }
    return wishlist;
  },
  removeFromWishlist(productId) {
    const wishlist = this.getWishlist().filter(i => i.id !== productId);
    localStorage.setItem('dlq_wishlist', JSON.stringify(wishlist));
    return wishlist;
  },
  isInWishlist(productId) {
    return this.getWishlist().some(i => i.id === productId);
  },
  toggleWishlist(product) {
    if (this.isInWishlist(product.id)) {
      this.removeFromWishlist(product.id);
      return false;
    } else {
      this.addToWishlist(product);
      return true;
    }
  },

  // User Profile
  getUser() {
    return JSON.parse(localStorage.getItem('dlq_user') || 'null');
  },
  setUser(user) {
    localStorage.setItem('dlq_user', JSON.stringify(user));
  },
  isLoggedIn() {
    return !!this.getUser();
  },

  // Recently Viewed (for AI recommendations)
  getRecentlyViewed() {
    return JSON.parse(localStorage.getItem('dlq_recent') || '[]');
  },
  addRecentlyViewed(product) {
    let recent = this.getRecentlyViewed();
    recent = recent.filter(i => i.id !== product.id);
    recent.unshift(product);
    if (recent.length > 20) recent = recent.slice(0, 20);
    localStorage.setItem('dlq_recent', JSON.stringify(recent));
  },

  // Mood
  getMood() {
    return localStorage.getItem('dlq_mood') || null;
  },
  setMood(mood) {
    localStorage.setItem('dlq_mood', mood);
  },

  // Orders
  getOrders() {
    return JSON.parse(localStorage.getItem('dlq_orders') || '[]');
  },
  addOrder(order) {
    const orders = this.getOrders();
    order.id = Date.now();
    order.date = new Date().toISOString();
    orders.unshift(order);
    localStorage.setItem('dlq_orders', JSON.stringify(orders));
    return order;
  },

  // Learning Progress
  getLearningProgress() {
    return JSON.parse(localStorage.getItem('dlq_progress') || '{}');
  },
  setLessonComplete(lessonId) {
    const progress = this.getLearningProgress();
    progress[lessonId] = { completed: true, date: new Date().toISOString() };
    localStorage.setItem('dlq_progress', JSON.stringify(progress));
  },
  isLessonComplete(lessonId) {
    return !!this.getLearningProgress()[lessonId];
  },

  // Repair requests
  getRepairRequests() {
    return JSON.parse(localStorage.getItem('dlq_repairs') || '[]');
  },
  addRepairRequest(req) {
    const requests = this.getRepairRequests();
    req.id = 'RPR' + Date.now();
    req.date = new Date().toISOString();
    req.status = 'pending';
    requests.unshift(req);
    localStorage.setItem('dlq_repairs', JSON.stringify(requests));
    return req;
  },

  // Settings
  getSetting(key, def = null) {
    const settings = JSON.parse(localStorage.getItem('dlq_settings') || '{}');
    return settings[key] !== undefined ? settings[key] : def;
  },
  setSetting(key, val) {
    const settings = JSON.parse(localStorage.getItem('dlq_settings') || '{}');
    settings[key] = val;
    localStorage.setItem('dlq_settings', JSON.stringify(settings));
  }
};

window.Storage = Storage;
