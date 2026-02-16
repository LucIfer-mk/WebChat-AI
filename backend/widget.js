(function () {
  // ─── Find the script tag and extract config ─────────────────
  const currentScript = document.currentScript;
  if (!currentScript) return;

  const chatbotId = currentScript.getAttribute("data-chatbot-id");
  if (!chatbotId) {
    console.error("WebChat Widget: Missing data-chatbot-id attribute");
    return;
  }

  const baseUrl = new URL(currentScript.src).origin;

  // ─── Session ID (persisted per visitor) ───────────────────
  const storageKey = `webchat_session_${chatbotId}`;
  let sessionId = null;
  try {
    sessionId = localStorage.getItem(storageKey);
  } catch (e) {}

  if (!sessionId) {
    sessionId =
      "sess_" +
      Math.random().toString(36).substring(2) +
      Date.now().toString(36);
    try {
      localStorage.setItem(storageKey, sessionId);
    } catch (e) {}
  }

  // ─── Fetch chatbot config from the server ───────────────────
  fetch(`${baseUrl}/api/widget/config/${chatbotId}?session_id=${sessionId}`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load chatbot config");
      return res.json();
    })
    .then((config) => initWidget(config, sessionId))
    .catch((err) => console.error("WebChat Widget Error:", err));

  function initWidget(cfg, existingSessionId) {
    let sessionId = existingSessionId;
    // ─── Inject styles ──────────────────────────────────────────
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      #webchat-widget-container * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      /* ── Trigger Button ── */
      #webchat-trigger {
        position: fixed;
        ${cfg.position === "bottom-left" ? "left: 24px" : "right: 24px"};
        bottom: 24px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${cfg.primary_color};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 24px rgba(0,0,0,0.25);
        z-index: 999999;
        transition: transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s ease;
        overflow: hidden;
      }
      #webchat-trigger:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 32px rgba(0,0,0,0.35);
      }
      #webchat-trigger img {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        object-fit: cover;
      }
      #webchat-trigger svg {
        width: 28px;
        height: 28px;
        fill: ${cfg.text_color};
      }

      /* ── Chat Window ── */
      #webchat-window {
        position: fixed;
        ${cfg.position === "bottom-left" ? "left: 24px" : "right: 24px"};
        bottom: 96px;
        width: 380px;
        height: 520px;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 12px 48px rgba(0,0,0,0.2);
        z-index: 999999;
        display: none;
        flex-direction: column;
        background: #fff;
        animation: webchat-slide-up 0.35s cubic-bezier(.4,0,.2,1);
      }
      #webchat-window.open {
        display: flex;
      }

      @keyframes webchat-slide-up {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      /* ── Header ── */
      #webchat-header {
        background: ${cfg.header_color};
        color: ${cfg.text_color};
        padding: 18px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
      }
      #webchat-header-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(255,255,255,0.2);
      }
      #webchat-header-info h3 {
        font-size: 15px;
        font-weight: 600;
        color: ${cfg.text_color};
      }
      #webchat-header-info span {
        font-size: 12px;
        opacity: 0.75;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      #webchat-header-info span::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #05CD99;
        display: inline-block;
      }
      #webchat-close {
        margin-left: auto;
        background: rgba(255,255,255,0.1);
        border: none;
        color: ${cfg.text_color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      #webchat-close:hover {
        background: rgba(255,255,255,0.2);
      }

      /* ── Messages Area ── */
      #webchat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f8f9fc;
      }
      #webchat-messages::-webkit-scrollbar { width: 4px; }
      #webchat-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

      #webchat-widget-container .webchat-msg {
        max-width: 80%;
        padding: 12px 20px !important;
        border-radius: 20px;
        font-size: 14px;
        line-height: 1.6;
        word-break: break-word;
        animation: webchat-msg-in 0.25s ease;
      }
      @keyframes webchat-msg-in {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      #webchat-widget-container .webchat-msg.bot {
        align-self: flex-start;
        background: #fff;
        color: #1e293b;
        border: 1px solid #e2e8f0;
        border-bottom-left-radius: 4px;
      }
      #webchat-widget-container .webchat-msg.user {
        align-self: flex-end;
        background: ${cfg.bubble_color};
        color: ${cfg.text_color};
        border-bottom-right-radius: 4px;
      }

      #webchat-widget-container .webchat-typing {
        display: flex;
        gap: 4px;
        padding: 12px 18px;
        align-self: flex-start;
        background: #fff;
        border-radius: 18px;
        border: 1px solid #e2e8f0;
        border-bottom-left-radius: 4px;
      }
      .webchat-typing span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #94a3b8;
        animation: webchat-bounce 1.2s infinite ease-in-out;
      }
      .webchat-typing span:nth-child(2) { animation-delay: 0.15s; }
      .webchat-typing span:nth-child(3) { animation-delay: 0.3s; }
      @keyframes webchat-bounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }

      /* ── Input Area ── */
      #webchat-input-area {
        display: flex;
        padding: 12px 16px;
        gap: 8px;
        border-top: 1px solid #e2e8f0;
        background: #fff;
        flex-shrink: 0;
      }
      #webchat-input {
        flex: 1;
        border: 1px solid #e2e8f0;
        border-radius: 24px;
        padding: 10px 18px;
        font-size: 14px;
        outline: none;
        font-family: inherit;
        transition: border 0.2s;
      }
      #webchat-input:focus {
        border-color: ${cfg.primary_color};
      }
      #webchat-input::placeholder {
        color: #94a3b8;
      }
      #webchat-send {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: ${cfg.primary_color};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s, transform 0.15s;
        flex-shrink: 0;
      }
      #webchat-send:hover {
        filter: brightness(1.1);
        transform: scale(1.05);
      }
      #webchat-send svg {
        width: 18px;
        height: 18px;
        fill: ${cfg.text_color};
      }

      /* Powered by */
      #webchat-powered {
        text-align: center;
        padding: 6px;
        font-size: 11px;
        color: #94a3b8;
        background: #fff;
      }

      /* ── Rating Screen ── */
      #webchat-rating-screen {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #fff;
        z-index: 100;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 30px;
        text-align: center;
        animation: webchat-fade-in 0.3s ease;
      }
      @keyframes webchat-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      #webchat-rating-screen h4 {
        margin-bottom: 12px;
        color: #1e293b;
        font-size: 18px;
      }
      #webchat-rating-screen p {
        font-size: 14px;
        color: #64748b;
        margin-bottom: 24px;
      }
      .webchat-stars {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
      }
      .webchat-star {
        cursor: pointer;
        font-size: 32px;
        color: #e2e8f0;
        transition: color 0.2s;
      }
      .webchat-star.active {
        color: #ffb800;
      }
      #webchat-rating-comment {
        width: 100%;
        padding: 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        margin-bottom: 20px;
        resize: none;
        height: 80px;
        outline: none;
      }
      #webchat-submit-rating {
        background: ${cfg.primary_color};
        color: ${cfg.text_color};
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: opacity 0.2s;
      }
      #webchat-submit-rating:hover {
        opacity: 0.9;
      }
      #webchat-skip-rating {
        margin-top: 16px;
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 13px;
        cursor: pointer;
        text-decoration: underline;
      }

      @media (max-width: 420px) {
        #webchat-window {
          width: calc(100vw - 16px);
          height: calc(100vh - 120px);
          ${cfg.position === "bottom-left" ? "left: 8px" : "right: 8px"};
          bottom: 88px;
          border-radius: 12px;
        }
      }
    `;
    document.head.appendChild(style);

    // ─── Build the widget DOM ─────────────────────────────────
    const container = document.createElement("div");
    container.id = "webchat-widget-container";

    // Icon for trigger (fallback SVG chat icon)
    const iconContent = cfg.icon_url
      ? `<img src="${cfg.icon_url}" alt="${cfg.name}" />`
      : `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>`;

    // Avatar for header
    const avatarSrc = cfg.icon_url || "";
    const avatarHtml = avatarSrc
      ? `<img id="webchat-header-avatar" src="${avatarSrc}" alt="${cfg.name}" />`
      : `<div id="webchat-header-avatar" style="width:40px;height:40px;border-radius:50%;background:${cfg.primary_color};display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:16px;">${cfg.name.charAt(0).toUpperCase()}</div>`;

    container.innerHTML = `
      <button id="webchat-trigger" aria-label="Open chat">${iconContent}</button>
      <div id="webchat-window">
        <div id="webchat-header">
          ${avatarHtml}
          <div id="webchat-header-info">
            <h3>${cfg.name}</h3>
            <span>Online</span>
          </div>
          <button id="webchat-close" aria-label="Close chat">&times;</button>
        </div>
        <div id="webchat-messages"></div>
        <div id="webchat-input-area">
          <input id="webchat-input" type="text" placeholder="Type a message..." autocomplete="off" />
          <button id="webchat-send" aria-label="Send message">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
        <div id="webchat-powered">Powered by WebChat AI</div>
        
        <div id="webchat-rating-screen">
          <h4>Rate your experience</h4>
          <p>How would you rate your conversation with ${cfg.name}?</p>
          <div class="webchat-stars">
            <span class="webchat-star" data-rating="1">★</span>
            <span class="webchat-star" data-rating="2">★</span>
            <span class="webchat-star" data-rating="3">★</span>
            <span class="webchat-star" data-rating="4">★</span>
            <span class="webchat-star" data-rating="5">★</span>
          </div>
          <textarea id="webchat-rating-comment" placeholder="Any feedback for us? (Optional)"></textarea>
          <button id="webchat-submit-rating">Submit Review</button>
          <button id="webchat-skip-rating">Skip</button>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    // ─── Get elements ─────────────────────────────────────────
    const trigger = document.getElementById("webchat-trigger");
    const chatWindow = document.getElementById("webchat-window");
    const closeBtn = document.getElementById("webchat-close");
    const messagesEl = document.getElementById("webchat-messages");
    const inputEl = document.getElementById("webchat-input");
    const sendBtn = document.getElementById("webchat-send");

    const ratingScreen = document.getElementById("webchat-rating-screen");
    const stars = document.querySelectorAll(".webchat-star");
    const submitRatingBtn = document.getElementById("webchat-submit-rating");
    const skipRatingBtn = document.getElementById("webchat-skip-rating");
    const ratingComment = document.getElementById("webchat-rating-comment");

    let isOpen = false;
    let currentRating = 0;
    let reviewSubmitted = false;
    let hasConvo = false;

    function recordUsage() {
      if (!hasConvo) return;
      fetch(`${baseUrl}/api/widget/usage/${chatbotId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      }).catch((err) => console.error("Error recording usage:", err));
      hasConvo = false; // Reset for next time they open/chat
    }

    // ─── Toggle Chat ──────────────────────────────────────────
    trigger.addEventListener("click", () => {
      isOpen = !isOpen;
      if (isOpen) {
        chatWindow.classList.add("open");
        trigger.style.display = "none";
        if (messagesEl.children.length === 0) {
          addMessage(cfg.welcome_message, "bot");
        }
        inputEl.focus();
      } else {
        closeChat();
      }
    });

    function closeChat() {
      if (reviewSubmitted || messagesEl.children.length <= 1) {
        // Just close if already reviewed or no conversation happened
        if (hasConvo) recordUsage();
        chatWindow.classList.remove("open");
        trigger.style.display = "flex";
        isOpen = false;
        ratingScreen.style.display = "none";
      } else {
        // Show rating screen
        ratingScreen.style.display = "flex";
      }
    }

    closeBtn.addEventListener("click", closeChat);

    // ─── Rating Logic ─────────────────────────────────────────
    stars.forEach((star) => {
      star.addEventListener("mouseover", () => {
        const r = parseInt(star.getAttribute("data-rating"));
        updateStars(r);
      });
      star.addEventListener("mouseout", () => {
        updateStars(currentRating);
      });
      star.addEventListener("click", () => {
        currentRating = parseInt(star.getAttribute("data-rating"));
        updateStars(currentRating);
      });
    });

    function updateStars(r) {
      stars.forEach((s) => {
        const starRating = parseInt(s.getAttribute("data-rating"));
        if (starRating <= r) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
    }

    submitRatingBtn.addEventListener("click", () => {
      if (currentRating === 0) {
        alert("Please select a rating");
        return;
      }

      const comment = ratingComment.value.trim();

      fetch(`${baseUrl}/api/widget/review/${chatbotId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: currentRating,
          comment: comment,
          session_id: sessionId,
        }),
      })
        .then(() => {
          recordUsage();
          reviewSubmitted = true;
          ratingScreen.innerHTML = `
          <div style="color: #05CD99; font-size: 48px; margin-bottom: 20px;">✓</div>
          <h4>Thank you!</h4>
          <p>Your review has been submitted.</p>
        `;
          setTimeout(() => {
            chatWindow.classList.remove("open");
            trigger.style.display = "flex";
            isOpen = false;
          }, 2000);
        })
        .catch((err) => {
          console.error("Error submitting review:", err);
          alert("Something went wrong. Please try again.");
        });
    });

    skipRatingBtn.addEventListener("click", () => {
      recordUsage();
      chatWindow.classList.remove("open");
      trigger.style.display = "flex";
      isOpen = false;
      ratingScreen.style.display = "none";
    });

    // ─── Send Message ─────────────────────────────────────────
    function sendMessage() {
      const text = inputEl.value.trim();
      if (!text) return;

      hasConvo = true;
      addMessage(text, "user");
      inputEl.value = "";

      // Show typing indicator
      const typing = document.createElement("div");
      typing.className = "webchat-typing";
      typing.innerHTML = "<span></span><span></span><span></span>";
      messagesEl.appendChild(typing);
      scrollToBottom();

      fetch(`${baseUrl}/api/widget/chat/${chatbotId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          typing.remove();
          addMessage(data.reply, "bot");
          if (data.session_id) sessionId = data.session_id;
        })
        .catch(() => {
          typing.remove();
          addMessage("Sorry, something went wrong. Please try again.", "bot");
        });
    }

    sendBtn.addEventListener("click", sendMessage);
    inputEl.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    // ─── Helpers ──────────────────────────────────────────────
    function addMessage(text, sender) {
      const msg = document.createElement("div");
      msg.className = `webchat-msg ${sender}`;
      msg.textContent = text;
      messagesEl.appendChild(msg);
      scrollToBottom();
    }

    function scrollToBottom() {
      requestAnimationFrame(() => {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      });
    }
  }
})();
