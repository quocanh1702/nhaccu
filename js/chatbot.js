/* ===== DLQ Music Store - Chatbot Support ===== */

const Chatbot = {
  isOpen: false,
  conversationStep: 0,

  responses: {
    greet: ['Xin chào! 👋 Mình là DLQ Bot, trợ lý tư vấn nhạc cụ của bạn!', 'Bạn cần tư vấn loại nhạc cụ nào?'],
    guitar: {
      keywords: ['guitar', 'đàn guitar', 'gitar'],
      reply: `🎸 **Guitar** là lựa chọn phổ biến nhất!\n\n**Cho người mới:** Yamaha F310 - 2,500,000đ\n**Trung cấp:** Yamaha FG800 - 4,500,000đ\n**Pro:** Fender Stratocaster - 18,000,000đ\n\nBạn muốn xem chi tiết không?`,
      suggestions: ['Xem Guitar Yamaha F310', 'Tư vấn theo ngân sách', 'So sánh guitar']
    },
    piano: {
      keywords: ['piano', 'đàn piano', 'keyboard', 'đàn phím'],
      reply: `🎹 **Piano & Keyboard** - Nhạc cụ hoàng gia!\n\n**Keyboard cơ bản:** Casio CT-X700 - 2,800,000đ\n**Digital Piano:** Yamaha P-125 - 15,000,000đ\n**Upright Piano:** Kawai K-15 - 85,000,000đ\n\nBạn cần piano cho mục đích gì?`,
      suggestions: ['Piano cho người mới', 'Piano luyện thi', 'Keyboard biểu diễn']
    },
    drum: {
      keywords: ['trống', 'drum', 'bộ trống'],
      reply: `🥁 **Trống** - Nhịp điệu của âm nhạc!\n\n**Acoustic Drum:** Pearl Export - 12,000,000đ\n**Electronic Drum:** Roland TD-1K - 12,000,000đ\n**Cajon:** Meinl SCAJ1BK - 1,500,000đ\n\nNhà bạn có thể lắp acoustic drum không?`,
      suggestions: ['Drum không gian nhỏ', 'Electronic vs Acoustic', 'Drum cho người mới']
    },
    ukulele: {
      keywords: ['ukulele', 'uke', 'đàn ukulele'],
      reply: `🪗 **Ukulele** - Dễ học, dễ chơi!\n\n**Soprano (Nhỏ):** Kala KA-15S - 950,000đ\n**Concert:** Kala KA-C - 1,400,000đ\n**Tenor:** Kala KA-T - 2,200,000đ\n\nUkulele phù hợp cho mọi lứa tuổi!`,
      suggestions: ['Ukulele cho trẻ em', 'Kích thước ukulele', 'Học ukulele']
    },
    beginner: {
      keywords: ['mới bắt đầu', 'người mới', 'beginner', 'học lần đầu', 'chưa biết gì'],
      reply: `🌱 **Gợi ý cho người mới bắt đầu:**\n\n1. 🎸 **Guitar Acoustic** - Dễ học nhất, rẻ nhất\n2. 🎹 **Keyboard 61 phím** - Học nhạc lý tốt\n3. 🪗 **Ukulele** - Nhanh biết chơi nhất (2-4 tuần)\n\nBạn thích thể loại âm nhạc nào?`,
      suggestions: ['Pop/Ballad', 'Rock', 'Nhạc cổ điển']
    },
    budget: {
      keywords: ['giá', 'bao nhiêu tiền', 'ngân sách', 'rẻ', 'tiết kiệm', 'budget'],
      reply: `💰 **Nhạc cụ theo ngân sách:**\n\n🟢 **Dưới 2 triệu:** Ukulele, Cajon, Harmonica\n🟡 **2-5 triệu:** Guitar Acoustic, Keyboard cơ bản\n🔴 **5-15 triệu:** Piano điện, Electric Guitar, Drum điện\n💎 **Trên 15 triệu:** Professional instruments\n\nNgân sách của bạn là bao nhiêu?`,
      suggestions: ['Dưới 2 triệu', '2-5 triệu', '5-15 triệu', 'Trên 15 triệu']
    },
    repair: {
      keywords: ['sửa', 'hỏng', 'lên dây', 'bảo dưỡng', 'repair'],
      reply: `🔧 **Dịch vụ sửa chữa của DLQ:**\n\n✅ Sửa guitar, piano, violin...\n✅ Lên dây, thay dây\n✅ Cân chỉnh action\n✅ Bảo dưỡng định kỳ\n\n📞 Hotline: 0901-234-567\n🗓️ Đặt lịch online tại trang Repair Service`,
      suggestions: ['Đặt lịch sửa', 'Xem bảng giá', 'Liên hệ']
    },
    delivery: {
      keywords: ['giao hàng', 'ship', 'vận chuyển', 'đơn hàng'],
      reply: `📦 **Thông tin vận chuyển:**\n\n🚀 **Nội thành HCM/HN:** 2-4 giờ (Giao hỏa tốc)\n📬 **Toàn quốc:** 1-3 ngày làm việc\n🆓 **Miễn phí ship** cho đơn trên 1,000,000đ\n📦 **Đóng gói chuyên nghiệp** - Chống sốc, an toàn`,
      suggestions: ['Xem đơn hàng', 'Chính sách đổi trả']
    },
    warranty: {
      keywords: ['bảo hành', 'đổi trả', 'warranty', 'lỗi'],
      reply: `🛡️ **Chính sách bảo hành DLQ:**\n\n✅ Bảo hành **6-24 tháng** tùy sản phẩm\n✅ Đổi trả **7 ngày** nếu lỗi sản xuất\n✅ Hỗ trợ kỹ thuật **miễn phí** suốt thời gian bảo hành\n✅ Sản phẩm **chính hãng 100%**`,
      suggestions: ['Kiểm tra bảo hành', 'Đăng ký bảo hành']
    },
    default: [
      'Mình chưa hiểu rõ câu hỏi của bạn. Bạn có thể nói cụ thể hơn không? 😊',
      'Để tư vấn tốt hơn, bạn muốn hỏi về loại nhạc cụ nào, hay dịch vụ của chúng mình?',
      'Bạn có thể chọn một trong các gợi ý bên dưới để mình giúp bạn nhé! 👇'
    ]
  },

  init() {
    this.bindToggle();
    this.addWelcomeMessage();
  },

  bindToggle() {
    const toggle = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');

    if (toggle) {
      toggle.addEventListener('click', () => this.toggle());
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Send message
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');

    if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // Quick reply buttons
    document.addEventListener('click', (e) => {
      const qr = e.target.closest('.quick-reply-btn');
      if (qr) {
        const text = qr.textContent.trim();
        this.processUserMessage(text);
        document.getElementById('chatbot-input').value = text;
        this.sendMessage(text);
      }
    });
  },

  toggle() {
    this.isOpen = !this.isOpen;
    const box = document.getElementById('chatbot-box');
    if (box) box.classList.toggle('open', this.isOpen);
    const toggle = document.getElementById('chatbot-toggle');
    if (toggle) toggle.innerHTML = this.isOpen ? '✕' : '💬';
  },

  close() {
    this.isOpen = false;
    const box = document.getElementById('chatbot-box');
    if (box) box.classList.remove('open');
    const toggle = document.getElementById('chatbot-toggle');
    if (toggle) toggle.innerHTML = '💬';
  },

  addWelcomeMessage() {
    setTimeout(() => {
      this.addBotMessage(this.responses.greet[0]);
      setTimeout(() => {
        this.addBotMessage(this.responses.greet[1]);
        this.showQuickReplies(['Guitar', 'Piano', 'Trống', 'Ukulele', 'Tư vấn theo ngân sách']);
      }, 800);
    }, 500);
  },

  sendMessage(text) {
    const input = document.getElementById('chatbot-input');
    const message = text || (input ? input.value.trim() : '');
    if (!message) return;

    this.addUserMessage(message);
    if (input && !text) input.value = '';

    // Simulate typing delay
    this.showTyping();
    setTimeout(() => {
      this.hideTyping();
      const response = this.getResponse(message);
      this.addBotMessage(response.reply);
      if (response.suggestions) {
        this.showQuickReplies(response.suggestions);
      }
    }, 800 + Math.random() * 400);
  },

  getResponse(message) {
    const lower = message.toLowerCase();

    // Check each response category
    for (const [key, config] of Object.entries(this.responses)) {
      if (typeof config === 'object' && config.keywords) {
        if (config.keywords.some(kw => lower.includes(kw))) {
          return { reply: config.reply, suggestions: config.suggestions };
        }
      }
    }

    // Price filters
    if (lower.includes('dưới 2 triệu') || lower.includes('< 2')) {
      return { reply: '💚 Dưới 2 triệu, mình gợi ý:\n\n🪗 **Ukulele Kala** - 950,000đ\n🥁 **Cajon nhỏ** - 1,200,000đ\n🎵 **Harmonica** - 300,000đ\n\nUkulele là lựa chọn số 1 cho người mới với ngân sách thấp!', suggestions: ['Mua Ukulele', 'Xem thêm'] };
    }
    if (lower.includes('2-5') || lower.includes('2 đến 5')) {
      return { reply: '💛 Ngân sách 2-5 triệu:\n\n🎸 **Guitar Acoustic Yamaha F310** - 2,500,000đ ⭐\n🎹 **Keyboard Casio CT-X700** - 2,800,000đ\n🎸 **Guitar Acoustic Fender CD-60S** - 3,800,000đ\n\nYamaha F310 là lựa chọn xuất sắc trong tầm giá này!', suggestions: ['Mua Yamaha F310', 'Xem Piano', 'So sánh'] };
    }

    const defaultReplies = this.responses.default;
    return {
      reply: defaultReplies[Math.floor(Math.random() * defaultReplies.length)],
      suggestions: ['Guitar', 'Piano', 'Trống', 'Giá cả', 'Sửa chữa']
    };
  },

  addUserMessage(text) {
    const messages = document.getElementById('chatbot-messages');
    if (!messages) return;
    const div = document.createElement('div');
    div.className = 'chat-message user';
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  },

  addBotMessage(text) {
    const messages = document.getElementById('chatbot-messages');
    if (!messages) return;
    const div = document.createElement('div');
    div.className = 'chat-message bot';
    // Support simple markdown-like bold
    div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  },

  showTyping() {
    const messages = document.getElementById('chatbot-messages');
    if (!messages) return;
    const typing = document.createElement('div');
    typing.className = 'chat-message bot typing-indicator';
    typing.id = 'typing-indicator';
    typing.innerHTML = '<span>●</span><span>●</span><span>●</span>';
    typing.style.cssText = 'display:flex;gap:4px;align-items:center;';
    typing.querySelectorAll('span').forEach((s, i) => {
      s.style.cssText = `animation:pulse 1s infinite;animation-delay:${i*0.2}s;font-size:1.2em;`;
    });
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  },

  hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  },

  showQuickReplies(suggestions) {
    const container = document.getElementById('chatbot-quick-replies');
    if (!container) return;
    container.innerHTML = suggestions.map(s =>
      `<button class="quick-reply-btn">${s}</button>`
    ).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Chatbot.init();
});

window.Chatbot = Chatbot;
