/* ===== DLQ Music Store - Main Application Logic ===== */

// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  initNavbar();
  initMobileMenu();
  initLoadingScreen();
  initCountdown();
  initToastSystem();
  Storage.updateCartBadge();
  initMoodFromStorage();
  initNewsletterForm();
  initQuickCartButtons();
}

// ===== Loading Screen =====
function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  window.addEventListener('load', () => {
    setTimeout(() => {
      screen.classList.add('hidden');
      setTimeout(() => screen.remove(), 500);
    }, 1200);
  });
}

// ===== Navbar =====
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Highlight active nav link
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === current || href.endsWith(current))) {
      link.classList.add('active');
    }
  });
}

// ===== Mobile Menu =====
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  mobileMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ===== Toast System =====
let toastContainer;

function initToastSystem() {
  toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

function showToast(message, type = 'success', duration = 3000) {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.success}</span>
    <span class="toast-text">${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

window.showToast = showToast;

// ===== Countdown Timer =====
function initCountdown() {
  const countdowns = document.querySelectorAll('[data-countdown]');
  countdowns.forEach(el => {
    const target = new Date(el.dataset.countdown || Date.now() + 86400000 * 3);
    updateCountdown(el, target);
    setInterval(() => updateCountdown(el, target), 1000);
  });
}

function updateCountdown(el, target) {
  const diff = target - Date.now();
  if (diff <= 0) { el.innerHTML = '<span>Đã kết thúc</span>'; return; }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  el.innerHTML = `
    <div class="countdown-item"><span class="countdown-num">${String(d).padStart(2,'0')}</span><span class="countdown-label">Ngày</span></div>
    <div class="countdown-item"><span class="countdown-num">${String(h).padStart(2,'0')}</span><span class="countdown-label">Giờ</span></div>
    <div class="countdown-item"><span class="countdown-num">${String(m).padStart(2,'0')}</span><span class="countdown-label">Phút</span></div>
    <div class="countdown-item"><span class="countdown-num">${String(s).padStart(2,'0')}</span><span class="countdown-label">Giây</span></div>
  `;
}

// ===== Mood System Persistence =====
function initMoodFromStorage() {
  const mood = Storage.getMood();
  if (mood && window.MoodSystem) {
    window.MoodSystem.apply(mood, false);
  }
}

// ===== Newsletter Form =====
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input || !input.value) return;
    showToast('Cảm ơn bạn đã đăng ký! 🎵 Ưu đãi sẽ được gửi tới email của bạn.', 'success');
    input.value = '';
  });
}

// ===== Quick Cart Buttons (global on any page) =====
function initQuickCartButtons() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-add-cart]');
    if (!btn) return;
    const productId = parseInt(btn.dataset.addCart);
    try {
      const data = await DLQData.getProductById(productId);
      if (data) {
        Storage.addToCart(data);
        showToast(`🛒 "${data.name}" đã được thêm vào giỏ hàng!`);
        btn.classList.add('added');
        setTimeout(() => btn.classList.remove('added'), 1000);
      }
    } catch(err) {
      showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
    }
  });

  // Wishlist buttons
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-wishlist]');
    if (!btn) return;
    const productId = parseInt(btn.dataset.wishlist);
    try {
      const data = await DLQData.getProductById(productId);
      if (data) {
        const added = Storage.toggleWishlist(data);
        btn.classList.toggle('active', added);
        showToast(added ? '❤️ Đã thêm vào yêu thích!' : '💔 Đã xóa khỏi yêu thích!', added ? 'success' : 'info');
      }
    } catch(err) {}
  });
}

// ===== Data Layer =====
const DLQData = {
  _cache: null,

  async load() {
    if (this._cache) return this._cache;
    try {
      const base = window.location.pathname.includes('/pages/') ? '../' : '';
      const res = await fetch(base + 'assets/data.json');
      this._cache = await res.json();
      return this._cache;
    } catch (e) {
      console.warn('Could not load data.json, using fallback');
      return this.getFallback();
    }
  },

  async getProducts(filters = {}) {
    const data = await this.load();
    let products = [...data.products];
    if (filters.category) products = products.filter(p => p.category === filters.category);
    if (filters.mood) products = products.filter(p => p.mood?.includes(filters.mood));
    if (filters.level) products = products.filter(p => p.specs?.suited_for?.includes(filters.level));
    if (filters.maxPrice) products = products.filter(p => p.price <= filters.maxPrice);
    if (filters.minPrice) products = products.filter(p => p.price >= filters.minPrice);
    if (filters.featured) products = products.filter(p => p.featured);
    return products;
  },

  async getProductById(id) {
    const data = await this.load();
    return data.products.find(p => p.id === parseInt(id));
  },

  async getLessons(level = null) {
    const data = await this.load();
    if (level) return data.lessons.filter(l => l.level === level);
    return data.lessons;
  },

  async getBlogPosts(limit = null) {
    const data = await this.load();
    const posts = data.blog_posts || [];
    return limit ? posts.slice(0, limit) : posts;
  },

  getFallback() {
    return {
      products: [
        { id:1, name:'Guitar Acoustic Yamaha F310', category:'guitar', price:2500000, oldPrice:2900000, image:'assets/images/products/guitar-yamaha-f310.jpg', rating:4.8, reviews:128, badge:'hot', mood:['chill','sad'], specs:{ material:'Gỗ hồng đào', origin:'Indonesia', keys:null, suited_for:['Beginner','Intermediate'] }, featured:true, inStock:true },
        { id:2, name:'Piano Điện Yamaha P-125', category:'piano', price:15000000, oldPrice:17500000, image:'assets/images/products/piano-yamaha-p125.jpg', rating:4.9, reviews:243, badge:'best', mood:['chill','sad','energetic'], specs:{ material:'Nhựa cao cấp', origin:'Japan', keys:88, suited_for:['Beginner','Intermediate','Advanced'] }, featured:true, inStock:true },
        { id:3, name:'Trống điện Roland TD-1K', category:'drum', price:12000000, oldPrice:14000000, image:'assets/images/products/drum-roland-td1k.jpg', rating:4.7, reviews:89, badge:'new', mood:['energetic'], specs:{ material:'Cao su tổng hợp', origin:'Japan', suited_for:['Beginner','Intermediate'] }, featured:true, inStock:true },
        { id:4, name:'Ukulele Soprano Kala KA-15S', category:'ukulele', price:950000, oldPrice:1200000, image:'assets/images/products/ukulele-kala.jpg', rating:4.6, reviews:67, badge:'sale', mood:['chill'], specs:{ material:'Gỗ mahogany', origin:'USA/Vietnam', suited_for:['Beginner'] }, featured:true, inStock:true },
        { id:5, name:'Violin 4/4 Suzuki', category:'violin', price:3500000, image:'assets/images/products/violin-suzuki.jpg', rating:4.5, reviews:45, mood:['chill','sad'], specs:{ material:'Gỗ vân sam', origin:'Japan', suited_for:['Beginner','Intermediate'] }, featured:false, inStock:true },
        { id:6, name:'Guitar Điện Fender Stratocaster', category:'guitar', price:18000000, image:'assets/images/products/guitar-fender.jpg', rating:4.9, reviews:312, badge:'best', mood:['energetic'], specs:{ material:'Gỗ alder', origin:'USA', suited_for:['Intermediate','Advanced'] }, featured:true, inStock:true }
      ],
      lessons: [
        { id:1, level:'Beginner', title:'Cách cầm đàn guitar đúng cách', duration:'15 phút', desc:'Học cách cầm đàn guitar đúng tư thế, tránh chấn thương.', icon:'🎸', completed:false },
        { id:2, level:'Beginner', title:'Đọc nốt nhạc cơ bản', duration:'20 phút', desc:'Hiểu 7 nốt nhạc cơ bản và cách đọc khuông nhạc.', icon:'🎼', completed:false },
        { id:3, level:'Beginner', title:'Hợp âm guitar cơ bản', duration:'25 phút', desc:'Học 4 hợp âm cơ bản: C, G, Am, F.', icon:'🎵', completed:false },
        { id:4, level:'Intermediate', title:'Kỹ thuật ngón tay nâng cao', duration:'30 phút', desc:'Fingerpicking và kỹ thuật chạy ngón nhanh.', icon:'🤞', completed:false },
        { id:5, level:'Intermediate', title:'Scales & Chords nâng cao', duration:'35 phút', desc:'Major/minor scales và chord progressions phổ biến.', icon:'🎹', completed:false },
        { id:6, level:'Advanced', title:'Improvisation - Tứ tấu tự do', duration:'45 phút', desc:'Nghệ thuật ứng tấu và biểu diễn sáng tạo.', icon:'🎤', completed:false }
      ],
      blog_posts: [
        { id:1, title:'Top 10 Guitar Acoustic Cho Người Mới Bắt Đầu', category:'guitar', date:'2025-01-15', image:'assets/images/backgrounds/blog-guitar.jpg', excerpt:'Chọn guitar đầu tiên rất quan trọng. Chúng tôi đã test 20+ mẫu để tìm ra top 10 tốt nhất...', readTime:'8 phút' },
        { id:2, title:'Cách Chọn Piano Điện Phù Hợp Với Nhu Cầu', category:'piano', date:'2025-01-20', image:'assets/images/backgrounds/blog-piano.jpg', excerpt:'Piano điện ngày càng phổ biến. Bài viết này giúp bạn chọn đúng model theo ngân sách...', readTime:'10 phút' },
        { id:3, title:'So Sánh Acoustic vs Electric Guitar', category:'guitar', date:'2025-02-01', image:'assets/images/backgrounds/blog-compare.jpg', excerpt:'Acoustic hay Electric - câu hỏi mà mọi guitarist đều phải trả lời khi mới bắt đầu...', readTime:'7 phút' },
        { id:4, title:'Hướng Dẫn Bảo Dưỡng Nhạc Cụ Đúng Cách', category:'tips', date:'2025-02-10', image:'assets/images/backgrounds/blog-care.jpg', excerpt:'Nhạc cụ của bạn sẽ bền lâu hơn nếu được chăm sóc đúng cách. Đây là hướng dẫn đầy đủ...', readTime:'6 phút' }
      ]
    };
  }
};

window.DLQData = DLQData;

// ===== Utility Functions =====
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function renderStars(rating, max = 5) {
  let stars = '';
  for (let i = 1; i <= max; i++) {
    if (rating >= i) stars += '⭐';
    else if (rating >= i - 0.5) stars += '✨';
    else stars += '☆';
  }
  return stars;
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

function throttle(fn, limit = 100) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= limit) { last = now; fn(...args); }
  };
}

window.formatPrice = formatPrice;
window.renderStars = renderStars;
window.debounce = debounce;
window.throttle = throttle;
