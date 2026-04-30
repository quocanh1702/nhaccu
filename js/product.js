/* ===== DLQ Music Store - Product Detail Page ===== */

const ProductDetail = {
  product: null,
  currentImageIndex: 0,
  compareProducts: [],

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id')) || 1;
    await this.loadProduct(productId);
    this.bindEvents();
  },

  async loadProduct(id) {
    try {
      this.product = await DLQData.getProductById(id);
      if (!this.product) {
        document.querySelector('.product-detail-section').innerHTML = '<div class="container"><p>Sản phẩm không tồn tại.</p></div>';
        return;
      }
      this.render();
      Storage.addRecentlyViewed(this.product);
      document.title = `${this.product.name} - DLQ Music Store`;
    } catch(e) {
      console.error(e);
    }
  },

  render() {
    const p = this.product;
    if (!p) return;

    // Update page elements
    const update = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setText('product-brand', p.specs?.brand || 'DLQ Music');
    setText('product-title', p.name);
    update('product-stars', renderStars(p.rating));
    setText('product-reviews-count', `${p.reviews || 0} đánh giá`);
    update('product-price-main', formatPrice(p.price));
    if (p.oldPrice) {
      update('product-price-old', formatPrice(p.oldPrice));
      const pct = Math.round((1 - p.price/p.oldPrice)*100);
      update('product-discount-pct', `-${pct}%`);
    }

    // Stock status
    const stockEl = document.getElementById('product-stock');
    if (stockEl) {
      stockEl.className = `stock-status ${p.inStock !== false ? 'stock-in' : 'stock-out'}`;
      stockEl.innerHTML = `<span class="stock-dot"></span>${p.inStock !== false ? 'Còn hàng' : 'Hết hàng'}`;
    }

    // Gallery
    this.renderGallery(p);

    // Specs
    this.renderSpecs(p);

    // Load reviews
    this.renderReviews(p);

    // Load related
    this.loadRelatedProducts(p);

    // Update wishlist btn state
    const wishBtn = document.getElementById('wishlist-btn');
    if (wishBtn && Storage.isInWishlist(p.id)) wishBtn.classList.add('active');
  },

  renderGallery(p) {
    // Main image
    const mainImg = document.getElementById('gallery-main-img');
    if (mainImg) {
      mainImg.src = p.image || 'assets/images/products/placeholder.jpg';
      mainImg.alt = p.name;
      mainImg.onerror = function() { this.src = '../assets/images/products/placeholder.jpg'; };
    }

    // Thumbnails (generate from main image for demo)
    const thumbsContainer = document.getElementById('gallery-thumbs');
    if (thumbsContainer) {
      const imgs = [p.image, p.image, p.image].map((img, i) => img || '').filter(Boolean);
      thumbsContainer.innerHTML = imgs.map((img, i) => `
        <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}" onclick="ProductDetail.setImage('${img}', ${i})">
          <img src="../${img}" alt="${p.name} ${i+1}" onerror="this.src='../assets/images/products/placeholder.jpg'">
        </div>
      `).join('');
    }
  },

  setImage(src, idx) {
    const mainImg = document.getElementById('gallery-main-img');
    if (mainImg) { mainImg.src = '../' + src; }
    document.querySelectorAll('.gallery-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
    this.currentImageIndex = idx;
  },

  renderSpecs(p) {
    const specsTable = document.getElementById('specs-table');
    if (!specsTable || !p.specs) return;

    const specRows = [
      ['Chất liệu', p.specs.material],
      ['Xuất xứ', p.specs.origin],
      ['Số phím', p.specs.keys ? `${p.specs.keys} phím` : null],
      ['Kích thước', p.specs.size],
      ['Trọng lượng', p.specs.weight],
      ['Màu sắc', p.specs.colors?.join(', ')],
      ['Bảo hành', p.specs.warranty || '12 tháng'],
    ].filter(([_, val]) => val);

    specsTable.innerHTML = specRows.map(([label, val]) => `
      <tr>
        <td>${label}</td>
        <td>${val}</td>
      </tr>
    `).join('');

    // Suited for
    const levelsEl = document.getElementById('suited-for');
    if (levelsEl && p.specs.suited_for) {
      levelsEl.innerHTML = p.specs.suited_for.map(level => `
        <span class="level-tag level-${level.toLowerCase()}">${level}</span>
      `).join('');
    }
  },

  renderReviews(p) {
    const reviewList = document.getElementById('review-list');
    if (!reviewList) return;

    const mockReviews = [
      { name: 'Nguyễn Văn A', rating: 5, text: 'Sản phẩm rất tốt, âm thanh hay, đáng đồng tiền. Giao hàng nhanh, đóng gói cẩn thận.', date: '2025-01-15', helpful: 23 },
      { name: 'Trần Thị B', rating: 4, text: 'Chất lượng tốt, phù hợp cho người mới như mình. Nhân viên tư vấn nhiệt tình.', date: '2025-01-20', helpful: 15 },
      { name: 'Lê Văn C', rating: 5, text: 'Mua lần thứ 3 tại DLQ rồi, lần nào cũng hài lòng. Sản phẩm chính hãng, giá hợp lý.', date: '2025-02-01', helpful: 31 }
    ];

    const rating = p.rating || 4.8;
    // Update rating overview
    const bigNum = document.getElementById('rating-big-num');
    if (bigNum) bigNum.textContent = rating.toFixed(1);
    const starsEl = document.getElementById('rating-stars-overview');
    if (starsEl) starsEl.textContent = renderStars(rating);
    const totalEl = document.getElementById('rating-total');
    if (totalEl) totalEl.textContent = `${p.reviews || 0} đánh giá`;

    // Rating bars
    const barsEl = document.getElementById('rating-bars');
    if (barsEl) {
      const barData = [
        { stars: 5, pct: 75 }, { stars: 4, pct: 15 }, { stars: 3, pct: 6 },
        { stars: 2, pct: 3 }, { stars: 1, pct: 1 }
      ];
      barsEl.innerHTML = barData.map(b => `
        <div class="rating-bar-row">
          <span class="bar-label">${b.stars}⭐</span>
          <div class="bar-track"><div class="bar-fill" style="width:${b.pct}%"></div></div>
          <span class="bar-count">${b.pct}%</span>
        </div>`).join('');
    }

    reviewList.innerHTML = mockReviews.map(r => `
      <div class="review-item">
        <div class="review-header">
          <div class="reviewer-info">
            <div class="reviewer-avatar">${r.name[0]}</div>
            <div>
              <div class="reviewer-name">${r.name}</div>
              <div class="reviewer-date">${r.date}</div>
            </div>
          </div>
          <div class="review-right">
            <div class="review-stars">${'⭐'.repeat(r.rating)}</div>
            <div class="review-verified">✓ Đã mua hàng</div>
          </div>
        </div>
        <p class="review-text">${r.text}</p>
        <div class="review-helpful">
          <span>Hữu ích không?</span>
          <button class="helpful-btn" onclick="this.textContent='👍 ${r.helpful + 1}'">👍 ${r.helpful}</button>
          <button class="helpful-btn">👎</button>
        </div>
      </div>`).join('');
  },

  async loadRelatedProducts(p) {
    const container = document.getElementById('related-products');
    if (!container) return;
    try {
      const products = await DLQData.getProducts({ category: p.category });
      const related = products.filter(prod => prod.id !== p.id).slice(0, 4);
      container.innerHTML = related.map(rp => `
        <div class="product-card">
          <div class="product-img-wrap">
            <img src="../${rp.image}" alt="${rp.name}" class="product-img"
              onerror="this.src='../assets/images/products/placeholder.jpg'">
          </div>
          <div class="product-body">
            <div class="product-name">${rp.name}</div>
            <div class="product-price"><span class="price-current">${formatPrice(rp.price)}</span></div>
          </div>
          <div class="product-footer">
            <a href="product-detail.html?id=${rp.id}" class="btn btn-ghost btn-sm" style="flex:1;text-align:center">Xem chi tiết</a>
          </div>
        </div>`).join('');
    } catch(e) {}
  },

  bindEvents() {
    // Wishlist toggle
    const wishBtn = document.getElementById('wishlist-btn');
    if (wishBtn && this.product) {
      wishBtn.addEventListener('click', () => {
        const added = Storage.toggleWishlist(this.product);
        wishBtn.classList.toggle('active', added);
        showToast(added ? '❤️ Đã thêm vào yêu thích!' : '💔 Đã xóa khỏi yêu thích!');
      });
    }

    // Add to cart
    const addCartBtn = document.getElementById('add-to-cart-btn');
    if (addCartBtn && this.product) {
      addCartBtn.addEventListener('click', () => {
        const qty = parseInt(document.getElementById('qty-input')?.value || '1');
        Storage.addToCart({ ...this.product, qty: undefined }, qty);
        showToast(`🛒 "${this.product.name}" đã thêm vào giỏ!`);
        Storage.updateCartBadge();
      });
    }

    // Buy now
    const buyNowBtn = document.getElementById('buy-now-btn');
    if (buyNowBtn && this.product) {
      buyNowBtn.addEventListener('click', () => {
        Storage.addToCart(this.product);
        window.location.href = 'cart.html';
      });
    }

    // Qty control
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('qty-input');
        if (!input) return;
        const current = parseInt(input.value) || 1;
        const delta = btn.textContent.includes('+') ? 1 : -1;
        input.value = Math.max(1, current + delta);
      });
    });

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
      });
    });

    // Audio samples
    document.querySelectorAll('.audio-sample-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sample = btn.dataset.sample;
        btn.classList.toggle('playing');
        // Synthesize a demo sound
        if (btn.classList.contains('playing')) {
          AudioPlayer.playNote(440, 'sine', 2.0);
          setTimeout(() => btn.classList.remove('playing'), 2000);
        }
      });
    });

    // Compare button
    const compareBtn = document.getElementById('compare-btn');
    if (compareBtn) {
      compareBtn.addEventListener('click', () => this.openCompareModal());
    }

    // Gallery zoom
    const galleryMain = document.getElementById('gallery-main');
    if (galleryMain) {
      galleryMain.addEventListener('mousemove', (e) => {
        const rect = galleryMain.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        galleryMain.style.setProperty('--zoom-x', x + '%');
        galleryMain.style.setProperty('--zoom-y', y + '%');
      });
    }
  },

  async openCompareModal() {
    const modal = document.getElementById('compare-modal');
    if (!modal || !this.product) return;

    try {
      const similar = await DLQData.getProducts({ category: this.product.category });
      const others = similar.filter(p => p.id !== this.product.id).slice(0, 2);
      const compareList = [this.product, ...others];

      const tbody = document.getElementById('compare-table-body');
      if (tbody) {
        const rows = [
          ['Hình ảnh', p => `<img src="../${p.image}" class="compare-product-img" alt="${p.name}">`],
          ['Tên', p => p.name],
          ['Giá', p => `<span class="highlight">${formatPrice(p.price)}</span>`],
          ['Đánh giá', p => renderStars(p.rating) + ` ${p.rating}`],
          ['Chất liệu', p => p.specs?.material || '-'],
          ['Xuất xứ', p => p.specs?.origin || '-'],
          ['Phù hợp cho', p => p.specs?.suited_for?.join(', ') || '-'],
        ];

        tbody.innerHTML = rows.map(([label, fn]) => `
          <tr>
            <th>${label}</th>
            ${compareList.map(p => `<td>${fn(p)}</td>`).join('')}
          </tr>`).join('');
      }
      modal.classList.add('open');
    } catch(e) {}
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.product-detail-section')) {
    ProductDetail.init();
  }
});

window.ProductDetail = ProductDetail;
