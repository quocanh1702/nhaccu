/* ===== DLQ Music Store - Shopping Cart ===== */

const Cart = {
  init() {
    this.renderCartPage();
    this.bindCartEvents();
    Storage.updateCartBadge();
  },

  renderCartPage() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    const cartItems = Storage.getCart();
    if (!cartItems.length) {
      container.innerHTML = `
        <div class="empty-cart">
          <div class="empty-icon">🛒</div>
          <h3>Giỏ hàng trống</h3>
          <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <a href="../index.html" class="btn btn-primary">Tiếp tục mua sắm</a>
        </div>`;
      this.updateSummary(0, 0);
      return;
    }

    container.innerHTML = cartItems.map(item => this.renderCartItem(item)).join('');
    this.updateSummary();
  },

  renderCartItem(item) {
    return `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img">
          <img src="../${item.image || 'assets/images/products/placeholder.jpg'}"
            alt="${item.name}" onerror="this.src='../assets/images/products/placeholder.jpg'">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-category">${getCategoryLabel ? getCategoryLabel(item.category) : item.category}</div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="Cart.updateQty(${item.id}, ${item.qty - 1})">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="Cart.updateQty(${item.id}, ${item.qty + 1})">+</button>
        </div>
        <div class="cart-item-total">${formatPrice(item.price * item.qty)}</div>
        <button class="cart-item-remove" onclick="Cart.removeItem(${item.id})">✕</button>
      </div>
    `;
  },

  updateQty(productId, newQty) {
    if (newQty <= 0) {
      this.removeItem(productId);
      return;
    }
    Storage.updateCartQty(productId, newQty);
    this.renderCartPage();
  },

  removeItem(productId) {
    Storage.removeFromCart(productId);
    const itemEl = document.querySelector(`.cart-item[data-id="${productId}"]`);
    if (itemEl) {
      itemEl.style.animation = 'slideInRight 0.3s reverse';
      setTimeout(() => this.renderCartPage(), 300);
    }
    if (window.showToast) showToast('🗑️ Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  },

  updateSummary() {
    const cart = Storage.getCart();
    const subtotal = Storage.getCartTotal();
    const shipping = subtotal >= 1000000 ? 0 : 50000;
    const discount = this.getDiscount(subtotal);
    const total = subtotal + shipping - discount;

    const el = id => document.getElementById(id);
    if (el('cart-subtotal')) el('cart-subtotal').textContent = formatPrice(subtotal);
    if (el('cart-shipping')) el('cart-shipping').textContent = shipping === 0 ? 'Miễn phí' : formatPrice(shipping);
    if (el('cart-discount')) el('cart-discount').textContent = discount > 0 ? `-${formatPrice(discount)}` : '0đ';
    if (el('cart-total')) el('cart-total').textContent = formatPrice(total);
    if (el('cart-count')) el('cart-count').textContent = `${cart.length} sản phẩm`;

    // Enable checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
  },

  getDiscount(subtotal) {
    const coupon = document.getElementById('coupon-input')?.value?.toUpperCase();
    if (coupon === 'DLQ10') return Math.floor(subtotal * 0.1);
    if (coupon === 'NEWUSER') return 50000;
    if (subtotal >= 10000000) return Math.floor(subtotal * 0.05);
    return 0;
  },

  applyCoupon() {
    const coupon = document.getElementById('coupon-input')?.value?.toUpperCase();
    const validCoupons = { 'DLQ10': 'Giảm 10%', 'NEWUSER': 'Giảm 50,000đ' };
    if (validCoupons[coupon]) {
      showToast(`✅ Mã "${coupon}" đã được áp dụng! ${validCoupons[coupon]}`);
    } else {
      showToast('❌ Mã giảm giá không hợp lệ hoặc đã hết hạn', 'error');
    }
    this.updateSummary();
  },

  bindCartEvents() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        window.location.href = 'checkout.html';
      });
    }

    const couponBtn = document.getElementById('apply-coupon');
    if (couponBtn) {
      couponBtn.addEventListener('click', () => this.applyCoupon());
    }

    const clearBtn = document.getElementById('clear-cart');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Xóa tất cả sản phẩm trong giỏ hàng?')) {
          Storage.clearCart();
          this.renderCartPage();
          showToast('🗑️ Đã xóa tất cả sản phẩm', 'info');
        }
      });
    }
  },

  // ===== Checkout =====
  initCheckout() {
    const cart = Storage.getCart();
    if (!cart.length) {
      window.location.href = 'cart.html';
      return;
    }
    this.renderCheckoutSummary();
    this.bindCheckoutForm();
  },

  renderCheckoutSummary() {
    const container = document.getElementById('checkout-summary');
    if (!container) return;

    const cart = Storage.getCart();
    const subtotal = Storage.getCartTotal();

    container.innerHTML = `
      <h3>Đơn hàng của bạn</h3>
      ${cart.map(item => `
        <div style="display:flex;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06)">
          <span>${item.name} × ${item.qty}</span>
          <span>${formatPrice(item.price * item.qty)}</span>
        </div>`).join('')}
      <div style="display:flex;justify-content:space-between;padding:1rem 0;font-size:1.1rem;font-weight:700;color:var(--accent)">
        <span>Tổng cộng:</span>
        <span>${formatPrice(subtotal)}</span>
      </div>
    `;
  },

  bindCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.validateCheckoutForm(form)) return;

      const orderData = {
        items: Storage.getCart(),
        total: Storage.getCartTotal(),
        customer: {
          name: form.querySelector('[name="fullname"]')?.value,
          phone: form.querySelector('[name="phone"]')?.value,
          address: form.querySelector('[name="address"]')?.value,
          city: form.querySelector('[name="city"]')?.value
        },
        payment: form.querySelector('[name="payment"]:checked')?.value || 'cod',
        status: 'pending'
      };

      const order = Storage.addOrder(orderData);
      Storage.clearCart();

      const successSection = document.getElementById('checkout-success');
      const formSection = document.getElementById('checkout-form-section');
      if (successSection) successSection.style.display = 'block';
      if (formSection) formSection.style.display = 'none';

      const orderIdEl = document.getElementById('order-id');
      if (orderIdEl) orderIdEl.textContent = '#DLQ' + order.id;
    });
  },

  validateCheckoutForm(form) {
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('error');
        field.style.borderColor = 'var(--danger)';
        valid = false;
      } else {
        field.classList.remove('error');
        field.style.borderColor = '';
      }
    });
    if (!valid) showToast('⚠️ Vui lòng điền đầy đủ thông tin!', 'warning');
    return valid;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cart-items')) {
    Cart.init();
  }
  if (document.getElementById('checkout-form')) {
    Cart.initCheckout();
  }
});

window.Cart = Cart;
