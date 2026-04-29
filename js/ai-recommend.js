/* ===== DLQ Music Store - AI Recommendations ===== */

const AIRecommend = {
  weights: {
    category: 0.35,
    priceRange: 0.25,
    level: 0.20,
    rating: 0.20
  },

  init() {
    this.renderRecommendations();
    this.initSmartFilter();
  },

  async getRecommendations(options = {}) {
    const allProducts = await DLQData.getProducts();
    const recent = Storage.getRecentlyViewed();
    const wishlist = Storage.getWishlist();
    const currentMood = Storage.getMood();

    // Build preference profile
    const profile = this._buildProfile(recent, wishlist, currentMood);
    Object.assign(profile, options);

    // Score each product
    const scored = allProducts.map(product => ({
      product,
      score: this._scoreProduct(product, profile, recent)
    }));

    // Sort by score, exclude already seen top items
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 8).map(s => s.product);
  },

  _buildProfile(recent, wishlist, mood) {
    const profile = {
      preferredCategories: {},
      avgPrice: 5000000,
      level: 'Beginner',
      moodCategories: []
    };

    // From recently viewed
    recent.forEach((p, i) => {
      const weight = 1 / (i + 1); // More recent = higher weight
      profile.preferredCategories[p.category] = (profile.preferredCategories[p.category] || 0) + weight;
    });

    // From wishlist
    wishlist.forEach(p => {
      profile.preferredCategories[p.category] = (profile.preferredCategories[p.category] || 0) + 0.5;
    });

    // Average price from recent
    if (recent.length) {
      profile.avgPrice = recent.reduce((sum, p) => sum + (p.price || 0), 0) / recent.length;
    }

    // Mood-based categories
    if (mood) {
      const moodCategories = {
        chill: ['guitar', 'ukulele', 'violin', 'piano'],
        sad: ['piano', 'violin', 'guitar'],
        energetic: ['drum', 'guitar', 'keyboard']
      };
      profile.moodCategories = moodCategories[mood] || [];
    }

    return profile;
  },

  _scoreProduct(product, profile, recent) {
    let score = 0;

    // Category preference
    const catScore = profile.preferredCategories[product.category] || 0;
    score += catScore * this.weights.category;

    // Price range match (Gaussian bell curve around avg price)
    const priceDiff = Math.abs(product.price - (profile.avgPrice || 5000000));
    const priceScore = Math.exp(-(priceDiff * priceDiff) / (2 * 5000000 * 5000000));
    score += priceScore * this.weights.priceRange;

    // Level match
    if (product.specs?.suited_for?.includes(profile.level || 'Beginner')) {
      score += this.weights.level;
    }

    // Rating
    score += ((product.rating || 4) / 5) * this.weights.rating;

    // Mood bonus
    if (profile.moodCategories.includes(product.category)) {
      score += 0.15;
    }

    // Boost for featured products
    if (product.featured) score += 0.05;

    // Don't recommend very recently viewed items (last 2)
    const recentIds = recent.slice(0, 2).map(p => p.id);
    if (recentIds.includes(product.id)) score -= 0.5;

    return score;
  },

  async renderRecommendations() {
    const container = document.getElementById('ai-recommendations');
    if (!container) return;

    container.innerHTML = this._renderSkeleton(4);

    try {
      const products = await this.getRecommendations();
      if (!products.length) {
        container.innerHTML = '<p class="text-center text-muted">Chưa có đủ dữ liệu để gợi ý</p>';
        return;
      }
      container.innerHTML = products.slice(0, 4).map(p => this._renderProductCard(p)).join('');
    } catch (e) {
      container.innerHTML = '<p class="text-center text-muted">Không thể tải gợi ý lúc này</p>';
    }
  },

  _renderProductCard(p) {
    return `
      <div class="product-card">
        <div class="product-img-wrap">
          <img src="${p.image}" alt="${p.name}" class="product-img"
            onerror="this.src='assets/images/products/placeholder.jpg'">
          ${p.badge ? `<div class="product-badges"><span class="badge badge-${p.badge}">${getBadgeLabel(p.badge)}</span></div>` : ''}
        </div>
        <div class="product-body">
          <div class="product-category">${getCategoryLabel(p.category)}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-rating">
            <span class="stars">${renderStars(p.rating)}</span>
            <span class="rating-count">(${p.reviews || 0})</span>
          </div>
          <div class="product-price">
            <span class="price-current">${formatPrice(p.price)}</span>
            ${p.oldPrice ? `<span class="price-original">${formatPrice(p.oldPrice)}</span>` : ''}
          </div>
        </div>
        <div class="product-footer">
          <button class="btn btn-primary btn-sm" data-add-cart="${p.id}">🛒 Thêm vào giỏ</button>
          <a href="pages/product-detail.html?id=${p.id}" class="btn btn-ghost btn-sm">Chi tiết</a>
        </div>
      </div>
    `;
  },

  _renderSkeleton(count) {
    return Array(count).fill(0).map(() => `
      <div class="product-card">
        <div class="skeleton-loader" style="height:200px;"></div>
        <div class="product-body">
          <div class="skeleton-loader" style="height:14px;width:60%;margin-bottom:8px;"></div>
          <div class="skeleton-loader" style="height:18px;margin-bottom:8px;"></div>
          <div class="skeleton-loader" style="height:14px;width:40%;margin-bottom:8px;"></div>
          <div class="skeleton-loader" style="height:20px;width:50%;"></div>
        </div>
      </div>
    `).join('');
  },

  // ===== Smart Filter =====
  filterState: {
    category: 'all',
    level: 'all',
    minPrice: 0,
    maxPrice: 50000000,
    sort: 'popular',
    search: ''
  },

  initSmartFilter() {
    const filterForm = document.getElementById('smart-filter');
    if (!filterForm) return;

    // Bind filter controls
    filterForm.querySelectorAll('[data-filter]').forEach(el => {
      el.addEventListener('change', () => this.applyFilter());
      el.addEventListener('input', () => this.applyFilter());
    });

    // Search
    const searchInput = document.getElementById('filter-search');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(() => this.applyFilter(), 400));
    }

    this.applyFilter();
  },

  async applyFilter() {
    const container = document.getElementById('filtered-products');
    if (!container) return;

    // Read filter values
    const state = {};
    document.querySelectorAll('[data-filter]').forEach(el => {
      state[el.dataset.filter] = el.value || el.dataset.value;
    });
    const search = (document.getElementById('filter-search')?.value || '').toLowerCase();
    Object.assign(this.filterState, state, { search });

    container.innerHTML = this._renderSkeleton(8);

    try {
      let products = await DLQData.getProducts();

      // Apply filters
      if (this.filterState.category && this.filterState.category !== 'all') {
        products = products.filter(p => p.category === this.filterState.category);
      }
      if (this.filterState.level && this.filterState.level !== 'all') {
        products = products.filter(p => p.specs?.suited_for?.includes(this.filterState.level));
      }
      if (this.filterState.minPrice) {
        products = products.filter(p => p.price >= parseInt(this.filterState.minPrice));
      }
      if (this.filterState.maxPrice) {
        products = products.filter(p => p.price <= parseInt(this.filterState.maxPrice));
      }
      if (search) {
        products = products.filter(p =>
          p.name.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search) ||
          (p.specs?.material || '').toLowerCase().includes(search)
        );
      }

      // Sort
      switch (this.filterState.sort) {
        case 'price-asc': products.sort((a, b) => a.price - b.price); break;
        case 'price-desc': products.sort((a, b) => b.price - a.price); break;
        case 'rating': products.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
        case 'popular': products.sort((a, b) => (b.reviews || 0) - (a.reviews || 0)); break;
        default: break;
      }

      if (!products.length) {
        container.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)">
            🔍 Không tìm thấy sản phẩm phù hợp. Hãy thử thay đổi bộ lọc.
          </div>`;
        return;
      }

      container.innerHTML = products.map(p => this._renderProductCard(p)).join('');

      // Update count
      const countEl = document.getElementById('filter-count');
      if (countEl) countEl.textContent = `${products.length} sản phẩm`;
    } catch(e) {
      container.innerHTML = '<div style="grid-column:1/-1;text-align:center">Không thể tải sản phẩm</div>';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (typeof DLQData !== 'undefined') {
    AIRecommend.init();
  }
});

window.AIRecommend = AIRecommend;
