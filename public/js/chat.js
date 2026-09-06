/**
 * NewsBot Conversational AI Chat Client
 * Supports real-time streaming SSE and context-aware news discussions
 */
class ChatManager {
  constructor() {
    this.drawer = document.getElementById('chat-drawer');
    this.messagesContainer = document.getElementById('chat-messages');
    this.chatForm = document.getElementById('chat-form');
    this.chatInput = document.getElementById('chat-input');
    this.openBtn = document.getElementById('btn-open-chat');
    this.floatingBtn = document.getElementById('floating-chat-btn');
    this.closeBtn = document.getElementById('btn-close-chat');
    this.clearBtn = document.getElementById('btn-clear-chat');
    this.promptChipsContainer = document.getElementById('chat-prompt-chips');

    this.history = [];
    this.isGenerating = false;

    this.init();
  }

  init() {
    if (this.openBtn) this.openBtn.addEventListener('click', () => this.open());
    if (this.floatingBtn) this.floatingBtn.addEventListener('click', () => this.toggle());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
    if (this.clearBtn) this.clearBtn.addEventListener('click', () => this.clearHistory());

    if (this.chatForm) {
      this.chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUserSubmit();
      });
    }

    if (this.chatInput) {
      this.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleUserSubmit();
        }
      });
    }

    // Prompt chips
    if (this.promptChipsContainer) {
      this.promptChipsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.prompt-chip');
        if (chip && !this.isGenerating) {
          const prompt = chip.getAttribute('data-prompt');
          if (prompt) {
            this.sendMessage(prompt);
          }
        }
      });
    }
  }

  open(initialMessage = null) {
    if (this.drawer) {
      this.drawer.classList.add('active');
      this.drawer.setAttribute('aria-hidden', 'false');
      if (this.chatInput) this.chatInput.focus();
    }
    if (initialMessage) {
      this.sendMessage(initialMessage);
    }
  }

  close() {
    if (this.drawer) {
      this.drawer.classList.remove('active');
      this.drawer.setAttribute('aria-hidden', 'true');
    }
  }

  toggle() {
    if (this.drawer && this.drawer.classList.contains('active')) {
      this.close();
    } else {
      this.open();
    }
  }

  clearHistory() {
    this.history = [];
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = `
        <div class="chat-bubble bot-bubble">
          <div class="chat-bubble-avatar"><i class="ph-fill ph-robot"></i></div>
          <div class="chat-bubble-body">
            <p>Conversation history cleared. How can I assist you with today's news?</p>
          </div>
        </div>
      `;
    }
  }

  handleUserSubmit() {
    const text = this.chatInput.value.trim();
    if (!text || this.isGenerating) return;
    this.chatInput.value = '';
    this.sendMessage(text);
  }

  async sendMessage(messageText) {
    this.appendMessage('user', messageText);
    this.history.push({ role: 'user', content: messageText });
    this.isGenerating = true;

    // Create bot response bubble placeholder
    const botBubble = this.createBotBubble();
    const contentDiv = botBubble.querySelector('.chat-bubble-body');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: this.history.slice(-6),
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat API returned an error');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                accumulatedText += data.token;
                contentDiv.innerHTML = typeof marked !== 'undefined'
                  ? marked.parse(accumulatedText)
                  : accumulatedText;
                this.scrollToBottom();
              }
              if (data.done) {
                break;
              }
            } catch (err) {
              // ignore partial json
            }
          }
        }
      }

      this.history.push({ role: 'model', content: accumulatedText });
    } catch (err) {
      console.error('Chat error:', err);
      contentDiv.innerHTML = `<p style="color: var(--accent-rose);">Sorry, I encountered an issue retrieving that information. Please try again.</p>`;
    } finally {
      this.isGenerating = false;
      this.scrollToBottom();
    }
  }

  appendMessage(role, text) {
    if (!this.messagesContainer) return;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role === 'user' ? 'user-bubble' : 'bot-bubble'}`;

    const icon = role === 'user' ? 'ph-user' : 'ph-fill ph-robot';
    const parsed = typeof marked !== 'undefined' && role !== 'user'
      ? marked.parse(text)
      : `<p>${this.escapeHtml(text)}</p>`;

    bubble.innerHTML = `
      <div class="chat-bubble-avatar"><i class="${icon}"></i></div>
      <div class="chat-bubble-body">${parsed}</div>
    `;

    this.messagesContainer.appendChild(bubble);
    this.scrollToBottom();
  }

  createBotBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot-bubble';
    bubble.innerHTML = `
      <div class="chat-bubble-avatar"><i class="ph-fill ph-robot"></i></div>
      <div class="chat-bubble-body"><div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div></div>
    `;
    this.messagesContainer.appendChild(bubble);
    this.scrollToBottom();
    return bubble;
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.chatManager = new ChatManager();
