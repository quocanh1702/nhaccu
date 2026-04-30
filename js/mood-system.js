/* ===== DLQ Music Store - Mood System ===== */

const MoodSystem = {
  moods: {
    chill: {
      emoji: '😌',
      name: 'Chill',
      colors: {
        '--primary': '#2d6a8f',
        '--accent': '#4ecdc4',
        '--bg-dark': '#0d2137',
        '--bg-card': '#0e2d40',
        '--text-primary': '#e0f4f1'
      },
      bgClass: 'mood-bg-chill',
      bodyClass: 'mood-chill',
      products: ['guitar', 'ukulele', 'violin', 'piano'],
      lessons: ['Beginner'],
      message: 'Nhạc cụ acoustic sẽ giúp bạn thư giãn tuyệt vời 🌊',
      playlist: 'Chill Acoustic Playlist',
      ambientNote: '♪'
    },
    sad: {
      emoji: '😢',
      name: 'Sad',
      colors: {
        '--primary': '#3d3561',
        '--accent': '#7c5cbf',
        '--bg-dark': '#1a1428',
        '--bg-card': '#221a38',
        '--text-primary': '#d4ccf0'
      },
      bgClass: 'mood-bg-sad',
      bodyClass: 'mood-sad',
      products: ['piano', 'violin', 'guitar'],
      lessons: ['Intermediate'],
      message: 'Piano và violin sẽ giúp bạn thể hiện cảm xúc 🌙',
      playlist: 'Melancholic Piano Playlist',
      ambientNote: '♩'
    },
    energetic: {
      emoji: '🔥',
      name: 'Energetic',
      colors: {
        '--primary': '#b5290b',
        '--accent': '#ff6b35',
        '--bg-dark': '#1f0a05',
        '--bg-card': '#2a1208',
        '--text-primary': '#ffe8d6'
      },
      bgClass: 'mood-bg-energetic',
      bodyClass: 'mood-energetic',
      products: ['drum', 'guitar', 'keyboard'],
      lessons: ['Advanced'],
      message: 'Trống và electric guitar giải phóng năng lượng của bạn ⚡',
      playlist: 'High Energy Rock Playlist',
      ambientNote: '♫'
    }
  },

  currentMood: null,
  noteInterval: null,

  init() {
    this.bindMoodButtons();
    const savedMood = Storage.getMood();
    if (savedMood) this.apply(savedMood, false);
  },

  bindMoodButtons() {
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mood = btn.dataset.mood;
        this.apply(mood, true);
      });
    });
  },

  apply(mood, animate = true) {
    if (!this.moods[mood]) return;
    this.currentMood = mood;
    const config = this.moods[mood];

    // Update buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mood === mood);
    });

    // Apply CSS variables
    const root = document.documentElement;
    Object.entries(config.colors).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });

    // Apply body class
    document.body.classList.remove('mood-chill', 'mood-sad', 'mood-energetic');
    document.body.classList.add(config.bodyClass);

    // Apply background
    document.body.classList.remove('mood-bg-chill', 'mood-bg-sad', 'mood-bg-energetic');
    document.body.classList.add(config.bgClass);

    // Save
    Storage.setMood(mood);

    // Show mood message
    this.showMoodMessage(config, animate);

    // Load mood products
    this.loadMoodProducts(mood);

    // Ambient notes
    this.startAmbientNotes(config.ambientNote);

    // Update navbar accent color
    this.updateNavbarAccent(config.colors['--accent']);

    if (animate) {
      this.playMoodTransition();
    }
  },

  showMoodMessage(config, animate) {
    const msgEl = document.getElementById('mood-message');
    if (!msgEl) return;
    msgEl.innerHTML = `
      <span style="font-size:1.5rem">${config.emoji}</span>
      <strong>${config.name} Mode</strong>:
      ${config.message}
    `;
    msgEl.style.display = 'flex';
    if (animate) {
      msgEl.style.animation = 'slideUp 0.4s ease';
    }

    // Update playlist hint
    const playlistEl = document.getElementById('mood-playlist');
    if (playlistEl) playlistEl.textContent = config.playlist;
  },

  async loadMoodProducts(mood) {
    const container = document.getElementById('mood-products');
    if (!container) return;

    try {
      const products = await DLQData.getProducts({ mood });
      if (!products.length) return;

      container.innerHTML = products.slice(0, 4).map(p => `
        <div class="product-card animate-scale">
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
              <span class="rating-count">(${p.reviews})</span>
            </div>
            <div class="product-price">
              <span class="price-current">${formatPrice(p.price)}</span>
              ${p.oldPrice ? `<span class="price-original">${formatPrice(p.oldPrice)}</span>` : ''}
            </div>
          </div>
          <div class="product-footer">
            <button class="btn btn-primary btn-sm" data-add-cart="${p.id}">🛒 Thêm vào giỏ</button>
            <a href="pages/product-detail.html?id=${p.id}" class="btn btn-ghost btn-sm">Xem chi tiết</a>
          </div>
        </div>
      `).join('');

      // Animate new cards
      setTimeout(() => {
        container.querySelectorAll('.animate-scale').forEach(el => el.classList.add('visible'));
      }, 50);
    } catch(e) {
      console.warn('Could not load mood products');
    }
  },

  startAmbientNotes(noteChar) {
    clearInterval(this.noteInterval);
    const container = document.getElementById('floating-notes');
    if (!container) return;
    container.innerHTML = '';

    const notes = ['♪', '♫', '♩', '♬', noteChar];
    this.noteInterval = setInterval(() => {
      if (Math.random() > 0.5) return; // 50% chance each interval
      const note = document.createElement('div');
      note.className = 'note-particle';
      note.textContent = notes[Math.floor(Math.random() * notes.length)];
      note.style.left = `${Math.random() * 100}vw`;
      note.style.animationDuration = `${6 + Math.random() * 6}s`;
      note.style.animationDelay = `${Math.random() * 2}s`;
      note.style.fontSize = `${1 + Math.random() * 1.5}rem`;
      note.style.opacity = `${0.3 + Math.random() * 0.4}`;
      container.appendChild(note);
      setTimeout(() => note.remove(), 12000);
    }, 800);
  },

  updateNavbarAccent(color) {
    document.querySelectorAll('.nav-link.active, .logo-mark').forEach(el => {
      el.style.transition = 'all 0.5s ease';
    });
  },

  playMoodTransition() {
    // Ripple overlay effect
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9998; pointer-events: none;
      background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05), transparent);
      animation: fadeIn 0.3s ease, fadeIn 0.3s ease 0.3s reverse forwards;
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 600);
  },

  reset() {
    document.body.classList.remove('mood-chill', 'mood-sad', 'mood-energetic');
    document.body.classList.remove('mood-bg-chill', 'mood-bg-sad', 'mood-bg-energetic');
    document.documentElement.removeAttribute('style');
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    clearInterval(this.noteInterval);
    this.currentMood = null;
    Storage.setMood(null);
  }
};

function getBadgeLabel(badge) {
  const labels = { hot: '🔥 Hot', new: '🆕 Mới', sale: '💸 Sale', best: '⭐ Best' };
  return labels[badge] || badge;
}

function getCategoryLabel(cat) {
  const labels = { guitar: 'Guitar', piano: 'Piano', drum: 'Trống', ukulele: 'Ukulele', violin: 'Violin', keyboard: 'Keyboard' };
  return labels[cat] || cat;
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof Storage !== 'undefined' && typeof DLQData !== 'undefined') {
    MoodSystem.init();
  }
});

window.MoodSystem = MoodSystem;
