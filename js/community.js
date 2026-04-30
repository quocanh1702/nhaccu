/* ===== DLQ Music Store - Community Page ===== */

const Community = {
  posts: [],
  currentFilter: 'all',
  currentUser: null,

  init() {
    this.currentUser = Storage.getUser() || {
      id: 1, name: 'Bạn', avatar: null, level: 'Intermediate'
    };
    this.loadPosts();
    this.loadLeaderboard();
    this.bindEvents();
    this.renderUserMini();
  },

  samplePosts: [
    {
      id: 1, userId: 2, userName: 'Minh Tuấn', userLevel: 'Pro 🎸',
      text: 'Vừa mua Guitar Fender Stratocaster từ DLQ! Âm thanh cực kỳ ấn tương, đúng hàng chính hãng. Cảm ơn team DLQ đã tư vấn tận tình ❤️',
      image: 'assets/images/backgrounds/blog-guitar.jpg',
      tags: ['#guitar', '#fender', '#review'],
      likes: 127, comments: 23, time: '2 giờ trước', liked: false
    },
    {
      id: 2, userId: 3, userName: 'Thu Hà', userLevel: 'Intermediate 🎹',
      text: '🎹 Cover "Nơi Này Có Anh" trên Piano Yamaha P-125. Luyện tập 2 tuần mới chơi được bài này hehe. Mọi người nghe thử nhé!',
      tags: ['#piano', '#cover', '#yamaha', '#nơinàycóanh'],
      likes: 89, comments: 45, time: '5 giờ trước', liked: false
    },
    {
      id: 3, userId: 4, userName: 'Quốc Anh', userLevel: 'Beginner 🥁',
      text: 'Mới học trống được 3 tháng. Đây là lần đầu mình chơi bài beat 4/4 cơ bản hoàn chỉnh! 🥁🥁',
      tags: ['#drums', '#beginner', '#progress'],
      likes: 156, comments: 67, time: '1 ngày trước', liked: true
    },
    {
      id: 4, userId: 5, userName: 'Lan Anh', userLevel: 'Advanced 🎻',
      text: 'Violin Suzuki 4/4 - Review sau 6 tháng sử dụng. Âm thanh ấm, dễ lên dây, rất phù hợp cho cả người mới lẫn bán chuyên. Đây là video nhỏ mình record...',
      image: 'assets/images/backgrounds/blog-compare.jpg',
      tags: ['#violin', '#suzuki', '#review', '#nhạccổđiển'],
      likes: 203, comments: 88, time: '2 ngày trước', liked: false
    }
  ],

  sampleLeaderboard: [
    { rank: 1, name: 'Quốc Anh', points: 4820, instrument: '🥁', avatar: 'Q' },
    { rank: 2, name: 'Thu Hà', points: 3960, instrument: '🎹', avatar: 'T' },
    { rank: 3, name: 'Minh Tuấn', points: 3410, instrument: '🎸', avatar: 'M' },
    { rank: 4, name: 'Lan Anh', points: 2890, instrument: '🎻', avatar: 'L' },
    { rank: 5, name: 'Bình Dương', points: 2340, instrument: '🪗', avatar: 'B' }
  ],

  loadPosts() {
    this.posts = [...this.samplePosts];
    this.renderPosts();
  },

  renderPosts() {
    const container = document.getElementById('post-feed');
    if (!container) return;

    const filtered = this.currentFilter === 'all'
      ? this.posts
      : this.posts.filter(p => p.tags.includes('#' + this.currentFilter));

    container.innerHTML = filtered.map(post => this.renderPostCard(post)).join('');
  },

  renderPostCard(post) {
    return `
      <div class="post-card animate-on-scroll" data-post-id="${post.id}">
        <div class="post-header">
          <div class="post-author-avatar">${post.avatar || post.userName[0]}</div>
          <div class="post-author-info">
            <div class="post-author-name">${post.userName}
              <span class="post-badge">${post.userLevel}</span>
            </div>
            <div class="post-author-detail">
              <span>📍 TP. Hồ Chí Minh</span>
              <span>•</span>
              <span>${post.time}</span>
            </div>
          </div>
          <div class="post-more-btn">⋯</div>
        </div>

        <p class="post-text">${post.text}</p>

        ${post.image ? `<img class="post-media" src="../${post.image}" alt="post" onerror="this.style.display='none'">` : ''}

        <div class="post-tags">
          ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>

        <div class="post-stats">
          <span>❤️ ${post.likes} lượt thích</span>
          <span>💬 ${post.comments} bình luận</span>
        </div>

        <div class="post-footer">
          <button class="post-action-btn ${post.liked ? 'liked' : ''}" onclick="Community.toggleLike(${post.id}, this)">
            ${post.liked ? '❤️' : '🤍'} Thích
          </button>
          <button class="post-action-btn" onclick="Community.toggleComments(${post.id}, this)">
            💬 Bình luận
          </button>
          <button class="post-action-btn" onclick="Community.sharePost(${post.id})">
            🔗 Chia sẻ
          </button>
        </div>

        <div class="post-comments" id="comments-${post.id}">
          <div class="comment-list">
            <div class="comment-item">
              <div class="comment-avatar">A</div>
              <div class="comment-bubble">
                <div class="comment-author">Nguyễn Anh</div>
                <div class="comment-text">Tuyệt vời quá! Mình cũng đang học loại này 👏</div>
                <div class="comment-meta">
                  <span>2 giờ trước</span>
                  <span>👍 5</span>
                </div>
              </div>
            </div>
          </div>
          <div class="comment-input-row">
            <div class="comment-avatar">${this.currentUser.name[0]}</div>
            <input class="comment-field" placeholder="Viết bình luận..." onkeydown="if(event.key==='Enter')Community.addComment(${post.id},this)">
          </div>
        </div>
      </div>
    `;
  },

  toggleLike(postId, btn) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    btn.classList.toggle('liked', post.liked);
    btn.innerHTML = `${post.liked ? '❤️' : '🤍'} Thích`;

    // Update stats
    const card = btn.closest('.post-card');
    const statsEl = card?.querySelector('.post-stats');
    if (statsEl) statsEl.innerHTML = `<span>❤️ ${post.likes} lượt thích</span><span>💬 ${post.comments} bình luận</span>`;
  },

  toggleComments(postId, btn) {
    const commentsEl = document.getElementById(`comments-${postId}`);
    if (commentsEl) commentsEl.classList.toggle('open');
  },

  addComment(postId, input) {
    if (!input.value.trim()) return;
    const post = this.posts.find(p => p.id === postId);
    if (post) post.comments++;
    const commentList = document.querySelector(`#comments-${postId} .comment-list`);
    if (commentList) {
      const div = document.createElement('div');
      div.className = 'comment-item';
      div.innerHTML = `
        <div class="comment-avatar">${this.currentUser.name[0]}</div>
        <div class="comment-bubble">
          <div class="comment-author">${this.currentUser.name}</div>
          <div class="comment-text">${input.value}</div>
          <div class="comment-meta"><span>Vừa xong</span></div>
        </div>`;
      commentList.appendChild(div);
      commentList.scrollTop = commentList.scrollHeight;
    }
    input.value = '';
  },

  sharePost(postId) {
    if (navigator.share) {
      navigator.share({ title: 'DLQ Music - Community', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      if (window.showToast) showToast('🔗 Đã sao chép link bài đăng!', 'success');
    }
  },

  loadLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;

    container.innerHTML = this.sampleLeaderboard.map(player => `
      <div class="leaderboard-item">
        <div class="rank-badge rank-${player.rank <= 3 ? player.rank : 'other'}">${player.rank}</div>
        <div class="leader-avatar">${player.avatar}</div>
        <div class="leader-info">
          <div class="leader-name">${player.name} ${player.instrument}</div>
          <div class="leader-points">⭐ ${player.points.toLocaleString()} điểm</div>
        </div>
      </div>`).join('');
  },

  renderUserMini() {
    const user = this.currentUser;
    const el = document.getElementById('user-mini-profile');
    if (!el) return;
    el.innerHTML = `
      <div class="profile-mini">
        <div class="profile-mini-avatar">${user.name[0]}</div>
        <div class="profile-mini-name">${user.name}</div>
        <div class="profile-mini-level">🎵 ${user.level}</div>
        <div class="profile-mini-stats">
          <div class="mini-stat"><span class="mini-stat-num">12</span><div class="mini-stat-label">Bài đăng</div></div>
          <div class="mini-stat"><span class="mini-stat-num">248</span><div class="mini-stat-label">Theo dõi</div></div>
          <div class="mini-stat"><span class="mini-stat-num">89</span><div class="mini-stat-label">Follower</div></div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="window.location.href='profile.html'">Trang cá nhân</button>
      </div>`;
  },

  bindEvents() {
    // Create post button
    const createBtn = document.getElementById('open-post-modal');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        const modal = document.getElementById('post-modal');
        if (modal) modal.classList.add('open');
      });
    }

    const postInput = document.getElementById('create-post-input');
    if (postInput) {
      postInput.addEventListener('click', () => {
        const modal = document.getElementById('post-modal');
        if (modal) modal.classList.add('open');
      });
    }

    // Submit post
    const submitPost = document.getElementById('submit-post');
    if (submitPost) {
      submitPost.addEventListener('click', () => this.createPost());
    }

    // Filter tabs
    document.querySelectorAll('[data-filter-posts]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentFilter = btn.dataset.filterPosts;
        document.querySelectorAll('[data-filter-posts]').forEach(b => b.classList.toggle('active', b === btn));
        this.renderPosts();
      });
    });

    // Close modals
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-overlay')?.classList.remove('open');
      });
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });
  },

  createPost() {
    const textarea = document.getElementById('post-textarea');
    if (!textarea?.value?.trim()) {
      if (window.showToast) showToast('⚠️ Vui lòng nhập nội dung bài đăng!', 'warning');
      return;
    }
    const newPost = {
      id: Date.now(),
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userLevel: this.currentUser.level,
      text: textarea.value.trim(),
      tags: [],
      likes: 0, comments: 0,
      time: 'Vừa xong', liked: false
    };
    this.posts.unshift(newPost);
    this.renderPosts();
    document.getElementById('post-modal')?.classList.remove('open');
    textarea.value = '';
    if (window.showToast) showToast('✅ Đã đăng bài thành công!');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.community-page')) {
    Community.init();
  }
});

window.Community = Community;
