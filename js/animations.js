/* ===== DLQ Music Store - Animations & Scroll Effects ===== */

const Animations = {
  init() {
    this.initScrollAnimations();
    this.initParallax();
    this.initFloatingNotes();
    this.initHoverSounds();
    this.initCounterAnimations();
    this.initSmoothReveal();
  },

  // ===== Scroll Animations =====
  initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll, .animate-left, .animate-right, .animate-scale').forEach(el => {
      observer.observe(el);
    });

    this._scrollObserver = observer;
  },

  // ===== Parallax =====
  initParallax() {
    const hero = document.querySelector('.hero-bg');
    if (!hero) return;

    window.addEventListener('scroll', throttle(() => {
      const scrollY = window.scrollY;
      hero.style.transform = `translateY(${scrollY * 0.4}px)`;

      // Background color shift based on scroll
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollPct = scrollY / maxScroll;
      this.shiftBackground(scrollPct);
    }, 16));
  },

  shiftBackground(pct) {
    const r = Math.floor(15 + pct * 5);
    const g = Math.floor(15 + pct * 3);
    const b = Math.floor(26 + pct * 10);
    document.body.style.setProperty('--bg-scroll', `rgb(${r},${g},${b})`);
  },

  // ===== Floating Music Notes =====
  _noteInterval: null,

  initFloatingNotes() {
    const container = document.getElementById('floating-notes');
    if (!container) return;

    const notes = ['♪', '♫', '♩', '♬', '🎵', '🎶'];
    let noteCount = 0;

    this._noteInterval = setInterval(() => {
      // Only spawn notes when user has scrolled or after short delay
      if (noteCount > 15) return; // Limit active notes
      if (Math.random() > 0.4) return;

      const note = document.createElement('div');
      note.className = 'note-particle';
      note.textContent = notes[Math.floor(Math.random() * notes.length)];
      note.style.left = `${Math.random() * 90 + 5}vw`;
      note.style.bottom = `${Math.random() * 20}vh`;
      note.style.fontSize = `${0.8 + Math.random() * 1.2}rem`;
      note.style.animationDuration = `${7 + Math.random() * 5}s`;
      note.style.opacity = `${0.2 + Math.random() * 0.4}`;
      container.appendChild(note);
      noteCount++;

      setTimeout(() => {
        note.remove();
        noteCount--;
      }, 12000);
    }, 1200);
  },

  // ===== Hover Sounds =====
  _hoverSoundEnabled: true,

  initHoverSounds() {
    // Only play on buttons and interactive elements
    document.addEventListener('mouseenter', (e) => {
      if (!this._hoverSoundEnabled) return;
      const target = e.target;
      if (target.matches('.btn, .mood-btn, .nav-link, .product-card')) {
        this.playHoverSound();
      }
    }, true);
  },

  playHoverSound() {
    if (!window.AudioPlayer || !AudioPlayer.audioCtx) return;
    try {
      const ctx = AudioPlayer.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.02); // Very subtle
      gain.gain.linearRampToValueAtTime(0, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e) {}
  },

  // ===== Counter Animations =====
  initCounterAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target._counted) {
          entry.target._counted = true;
          const target = parseInt(entry.target.dataset.count || entry.target.textContent);
          this.animateCounter(entry.target, target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
  },

  animateCounter(el, target) {
    const duration = 2000;
    const start = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(easeOut(progress) * target);
      el.textContent = value.toLocaleString('vi-VN');
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString('vi-VN');
    };
    requestAnimationFrame(update);
  },

  // ===== Smooth Reveal =====
  initSmoothReveal() {
    // Add animation classes to elements that don't have them
    document.querySelectorAll('.product-card:not(.animate-on-scroll)').forEach((el, i) => {
      el.classList.add('animate-on-scroll');
      if (i > 0) el.classList.add(`animate-delay-${Math.min(i, 6)}`);
      this._scrollObserver?.observe(el);
    });

    document.querySelectorAll('.blog-card:not(.animate-on-scroll), .feature-item:not(.animate-on-scroll)').forEach(el => {
      el.classList.add('animate-on-scroll');
      this._scrollObserver?.observe(el);
    });
  },

  // ===== Click Ripple Effect =====
  addRippleEffect() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn, .ripple-wrapper');
      if (!btn) return;
      const ripple = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'click-ripple';
      ripple.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - rect.left - size/2}px;
        top: ${e.clientY - rect.top - size/2}px;
      `;
      btn.style.position = btn.style.position || 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }
};

// ===== Page-specific Animations =====

// Hero typing effect
function initHeroTyping() {
  const el = document.getElementById('hero-typing');
  if (!el) return;
  const texts = ['Guitar 🎸', 'Piano 🎹', 'Trống 🥁', 'Ukulele 🪗', 'Violin 🎻'];
  let i = 0;
  let charIdx = 0;
  let deleting = false;

  const type = () => {
    const text = texts[i];
    if (deleting) {
      el.textContent = text.substring(0, charIdx--);
      if (charIdx < 0) { deleting = false; i = (i + 1) % texts.length; charIdx = 0; setTimeout(type, 600); return; }
    } else {
      el.textContent = text.substring(0, charIdx++);
      if (charIdx > text.length) { deleting = true; setTimeout(type, 1500); return; }
    }
    setTimeout(type, deleting ? 50 : 120);
  };
  type();
}

// Spotlight on hero
function initSpotlight() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.addEventListener('mousemove', throttle((e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    hero.style.setProperty('--mouse-x', `${x}%`);
    hero.style.setProperty('--mouse-y', `${y}%`);
  }, 30));
}

document.addEventListener('DOMContentLoaded', () => {
  Animations.init();
  Animations.addRippleEffect();
  initHeroTyping();
  initSpotlight();
});

window.Animations = Animations;
