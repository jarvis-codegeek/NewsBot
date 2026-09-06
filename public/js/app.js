/**
 * NewsBot AI — Main Application Controller
 */

class NewsBotApp {
  constructor() {
    this.currentCategory = 'all';
    this.currentArticles = [];
    this.currentArticleForSummary = null;
    this.currentSummaryMode = 'tldr';
    this.currentSummaryMarkdown = '';
    this.currentBriefingMarkdown = '';
    this.searchTimeout = null;

    // DOM Elements
    this.grid = document.getElementById('news-grid');
    this.tickerContent = document.getElementById('ticker-content');
    this.tickerBar = document.getElementById('ticker-bar');
    this.tickerClose = document.getElementById('ticker-close');
    this.categoryTabs = document.getElementById('category-tabs');
    this.searchInput = document.getElementById('news-search-input');
    this.searchClear = document.getElementById('search-clear');
    this.feedTitle = document.getElementById('feed-current-title');
    this.feedCounter = document.getElementById('feed-counter');
    this.emptyState = document.getElementById('empty-state');
    this.btnRefresh = document.getElementById('btn-refresh-feed');
    this.btnResetSearch = document.getElementById('btn-reset-search');
    this.btnDailyBriefing = document.getElementById('btn-daily-briefing');
    this.trendingChips = document.getElementById('trending-chips');
    this.themeToggle = document.getElementById('btn-theme-toggle');
    this.themeIcon = document.getElementById('theme-icon');
    this.viewGrid = document.getElementById('view-grid');
    this.viewList = document.getElementById('view-list');

    // Summary Modal Elements
    this.summaryModal = document.getElementById('summary-modal');
    this.modalClose = document.getElementById('modal-close');
    this.modalTitle = document.getElementById('modal-article-title');
    this.modalSource = document.getElementById('modal-source');
    this.modalTime = document.getElementById('modal-time');
    this.modalOriginalLink = document.getElementById('modal-original-link');
    this.summaryContent = document.getElementById('summary-content');
    this.btnListenSummary = document.getElementById('btn-listen-summary');
    this.btnCopySummary = document.getElementById('btn-copy-summary');
    this.btnAskAboutArticle = document.getElementById('btn-ask-about-article');

    // Daily Briefing Modal Elements
    this.briefingModal = document.getElementById('briefing-modal');
    this.briefingModalClose = document.getElementById('briefing-modal-close');
    this.briefingContent = document.getElementById('briefing-content');
    this.btnListenBriefing = document.getElementById('btn-listen-briefing');

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadTheme();
    this.fetchTrending();
    this.loadNews(this.currentCategory);
  }

  setupEventListeners() {
    // Category tabs
    if (this.categoryTabs) {
      this.categoryTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.cat-tab');
        if (tab) {
          document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.currentCategory = tab.getAttribute('data-cat') || 'all';
          this.updateFeedTitle();
          this.loadNews(this.currentCategory);
        }
      });
    }

    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => {
        const query = this.searchInput.value.trim();
        if (this.searchClear) {
          this.searchClear.style.display = query ? 'flex' : 'none';
        }
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          if (query) {
            this.search(query);
          } else {
            this.loadNews(this.currentCategory);
          }
        }, 400);
      });
    }

    if (this.searchClear) {
      this.searchClear.addEventListener('click', () => {
        this.searchInput.value = '';
        this.searchClear.style.display = 'none';
        this.loadNews(this.currentCategory);
      });
    }

    if (this.btnResetSearch) {
      this.btnResetSearch.addEventListener('click', () => {
        if (this.searchInput) this.searchInput.value = '';
        if (this.searchClear) this.searchClear.style.display = 'none';
        this.loadNews('all');
      });
    }

    // Refresh
    if (this.btnRefresh) {
      this.btnRefresh.addEventListener('click', () => {
        const icon = document.getElementById('refresh-icon');
        if (icon) icon.classList.add('ph-spin');
        this.loadNews(this.currentCategory).finally(() => {
          if (icon) icon.classList.remove('ph-spin');
        });
      });
    }

    // Ticker close
    if (this.tickerClose && this.tickerBar) {
      this.tickerClose.addEventListener('click', () => {
        this.tickerBar.style.display = 'none';
        document.querySelector('.navbar').style.top = '0';
      });
    }

    // Trending chips
    if (this.trendingChips) {
      this.trendingChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (chip) {
          const topic = chip.getAttribute('data-topic');
          if (this.searchInput) {
            this.searchInput.value = topic;
            if (this.searchClear) this.searchClear.style.display = 'flex';
            this.search(topic);
          }
        }
      });
    }

    // Layout views
    if (this.viewGrid && this.viewList) {
      this.viewGrid.addEventListener('click', () => {
        this.viewGrid.classList.add('active');
        this.viewList.classList.remove('active');
        this.grid.classList.remove('list-layout');
      });
      this.viewList.addEventListener('click', () => {
        this.viewList.classList.add('active');
        this.viewGrid.classList.remove('active');
        this.grid.classList.add('list-layout');
      });
    }

    // Theme toggle
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Modals
    if (this.modalClose) {
      this.modalClose.addEventListener('click', () => this.closeSummaryModal());
    }
    if (this.summaryModal) {
      this.summaryModal.addEventListener('click', (e) => {
        if (e.target === this.summaryModal) this.closeSummaryModal();
      });
    }

    if (this.btnDailyBriefing) {
      this.btnDailyBriefing.addEventListener('click', () => this.openDailyBriefing());
    }
    if (this.briefingModalClose) {
      this.briefingModalClose.addEventListener('click', () => this.closeBriefingModal());
    }
    if (this.briefingModal) {
      this.briefingModal.addEventListener('click', (e) => {
        if (e.target === this.briefingModal) this.closeBriefingModal();
      });
    }

    // Summary mode tabs
    const summaryModes = document.querySelectorAll('.mode-tab');
    summaryModes.forEach(tab => {
      tab.addEventListener('click', () => {
        summaryModes.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentSummaryMode = tab.getAttribute('data-mode') || 'tldr';
        if (this.currentArticleForSummary) {
          this.fetchSummary(this.currentArticleForSummary, this.currentSummaryMode);
        }
      });
    });

    // Copy Summary
    if (this.btnCopySummary) {
      this.btnCopySummary.addEventListener('click', () => {
        if (this.currentSummaryMarkdown) {
          navigator.clipboard.writeText(this.currentSummaryMarkdown);
          this.showToast('Analysis copied to clipboard!');
        }
      });
    }

    // Audio briefing on summary
    if (this.btnListenSummary) {
      this.btnListenSummary.addEventListener('click', () => {
        if (this.currentSummaryMarkdown && window.audioManager) {
          window.audioManager.speak(this.currentSummaryMarkdown, `Reading Analysis: ${this.currentArticleForSummary?.title}`);
        }
      });
    }

    // Audio briefing on daily briefing
    if (this.btnListenBriefing) {
      this.btnListenBriefing.addEventListener('click', () => {
        if (this.currentBriefingMarkdown && window.audioManager) {
          window.audioManager.speak(this.currentBriefingMarkdown, 'Playing Daily Executive Briefing');
        }
      });
    }

    // Ask about article in Chat
    if (this.btnAskAboutArticle) {
      this.btnAskAboutArticle.addEventListener('click', () => {
        if (this.currentArticleForSummary && window.chatManager) {
          const query = `Can you provide more context and key implications about this news: "${this.currentArticleForSummary.title}"?`;
          this.closeSummaryModal();
          window.chatManager.open(query);
        }
      });
    }
  }

  updateFeedTitle() {
    const titles = {
      all: 'Latest Global Headlines',
      ai: 'Artificial Intelligence & Innovation Radar',
      technology: 'Technology & Silicon Landscape',
      business: 'Business, Markets & Economy',
      world: 'World News & Geopolitics',
      science: 'Science Discoveries & Space Exploration',
      health: 'Health, Medicine & Biotech',
      entertainment: 'Entertainment & Culture',
    };
    if (this.feedTitle) {
      this.feedTitle.textContent = titles[this.currentCategory] || 'News Feed';
    }
  }

  async loadNews(category = 'all') {
    this.renderSkeletons();
    try {
      const response = await fetch(`/api/news?category=${category}&limit=35`);
      const data = await response.json();

      if (data.success && data.articles) {
        this.currentArticles = data.articles;
        this.renderArticles(this.currentArticles);
        this.updateTicker(this.currentArticles);
        if (this.feedCounter) {
          this.feedCounter.textContent = `${this.currentArticles.length} live stories updated`;
        }
      } else {
        this.renderEmpty();
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      this.renderEmpty();
    }
  }

  async search(query) {
    this.renderSkeletons();
    if (this.feedTitle) {
      this.feedTitle.textContent = `Search results for "${query}"`;
    }
    try {
      const response = await fetch(`/api/news/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success && data.articles && data.articles.length > 0) {
        this.currentArticles = data.articles;
        this.renderArticles(this.currentArticles);
        if (this.feedCounter) {
          this.feedCounter.textContent = `${data.articles.length} results found`;
        }
      } else {
        this.renderEmpty();
      }
    } catch (err) {
      console.error('Search error:', err);
      this.renderEmpty();
    }
  }

  async fetchTrending() {
    try {
      const response = await fetch('/api/news/trending');
      const data = await response.json();
      if (data.success && data.trending && this.trendingChips) {
        this.trendingChips.innerHTML = data.trending
          .map(topic => `<button class="chip" data-topic="${topic}">${topic}</button>`)
          .join('');
      }
    } catch (err) {
      console.warn('Failed to fetch trending topics:', err);
    }
  }

  renderArticles(articles) {
    if (!this.grid) return;
    if (!articles || articles.length === 0) {
      this.renderEmpty();
      return;
    }

    if (this.emptyState) this.emptyState.style.display = 'none';
    this.grid.style.display = 'grid';

    this.grid.innerHTML = articles.map((article, index) => {
      const relativeTime = this.formatRelativeTime(article.pubDate);
      const mediaHtml = article.image
        ? `<div class="card-media">
            <img src="${article.image}" alt="${this.escapeHtml(article.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-media-fallback\\'><i class=\\'ph-fill ph-newspaper\\'></i></div>'">
            <span class="card-source-tag">${this.escapeHtml(article.source)}</span>
            <span class="card-time-tag">${relativeTime}</span>
           </div>`
        : `<div class="card-media">
            <div class="card-media-fallback"><i class="ph-fill ph-newspaper"></i></div>
            <span class="card-source-tag">${this.escapeHtml(article.source)}</span>
            <span class="card-time-tag">${relativeTime}</span>
           </div>`;

      return `
        <article class="article-card" data-index="${index}">
          ${mediaHtml}
          <div class="card-body">
            <h3 class="card-title">
              <a href="${article.link}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(article.title)}</a>
            </h3>
            <p class="card-snippet">${this.escapeHtml(article.snippet || 'Click to explore complete coverage and AI analysis.')}</p>
            <div class="card-footer">
              <button class="card-ai-btn btn-trigger-summary" data-index="${index}">
                <i class="ph-fill ph-sparkle"></i> AI Summary
              </button>
              <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="card-read-more">
                ${article.readTime || 'Read'} <i class="ph ph-arrow-right"></i>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click handlers to AI Summary buttons
    this.grid.querySelectorAll('.btn-trigger-summary').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (this.currentArticles[idx]) {
          this.openSummaryModal(this.currentArticles[idx]);
        }
      });
    });
  }

  updateTicker(articles) {
    if (!this.tickerContent || !articles || articles.length === 0) return;
    this.tickerContent.innerHTML = articles.slice(0, 10).map((a, i) => `
      <span class="ticker-item ticker-click-item" data-index="${i}">
        <i class="ph-fill ph-caret-right" style="color: var(--accent-rose); font-size: 0.8rem;"></i>
        <strong>[${this.escapeHtml(a.source)}]</strong> ${this.escapeHtml(a.title)}
      </span>
    `).join('');

    this.tickerContent.querySelectorAll('.ticker-click-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        if (articles[idx]) {
          this.openSummaryModal(articles[idx]);
        }
      });
    });
  }

  renderSkeletons() {
    if (!this.grid) return;
    if (this.emptyState) this.emptyState.style.display = 'none';
    this.grid.style.display = 'grid';
    this.grid.innerHTML = Array(6).fill('<div class="skeleton-card"></div>').join('');
  }

  renderEmpty() {
    if (this.grid) this.grid.style.display = 'none';
    if (this.emptyState) this.emptyState.style.display = 'block';
    if (this.feedCounter) this.feedCounter.textContent = '0 stories';
  }

  // AI Summary Modal
  openSummaryModal(article) {
    this.currentArticleForSummary = article;
    if (this.modalTitle) this.modalTitle.textContent = article.title;
    if (this.modalSource) this.modalSource.textContent = article.source;
    if (this.modalTime) this.modalTime.textContent = this.formatRelativeTime(article.pubDate);
    if (this.modalOriginalLink) this.modalOriginalLink.href = article.link;

    if (this.summaryModal) {
      this.summaryModal.classList.add('active');
      this.summaryModal.setAttribute('aria-hidden', 'false');
    }

    this.fetchSummary(article, this.currentSummaryMode);
  }

  closeSummaryModal() {
    if (this.summaryModal) {
      this.summaryModal.classList.remove('active');
      this.summaryModal.setAttribute('aria-hidden', 'true');
    }
  }

  async fetchSummary(article, mode = 'tldr') {
    if (this.summaryContent) {
      this.summaryContent.innerHTML = `
        <div class="summary-loading">
          <div class="spinner"></div>
          <span>Generating AI ${mode.replace('_', ' ')} analysis...</span>
        </div>
      `;
    }

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          snippet: article.fullSnippet || article.snippet,
          source: article.source,
          link: article.link,
          mode,
        }),
      });

      const data = await response.json();
      if (data.success && data.summary) {
        this.currentSummaryMarkdown = data.summary;
        if (this.summaryContent) {
          this.summaryContent.innerHTML = typeof marked !== 'undefined'
            ? marked.parse(data.summary)
            : data.summary;
        }
      } else {
        if (this.summaryContent) {
          this.summaryContent.innerHTML = `<p>Unable to generate summary at this time.</p>`;
        }
      }
    } catch (err) {
      console.error('Summary fetch error:', err);
      if (this.summaryContent) {
        this.summaryContent.innerHTML = `<p style="color: var(--accent-rose);">Failed to generate analysis. Please try again.</p>`;
      }
    }
  }

  // Daily Briefing Modal
  async openDailyBriefing() {
    if (this.briefingModal) {
      this.briefingModal.classList.add('active');
      this.briefingModal.setAttribute('aria-hidden', 'false');
    }

    if (this.briefingContent) {
      this.briefingContent.innerHTML = `
        <div class="summary-loading">
          <div class="spinner"></div>
          <span>Compiling today's global intelligence briefing with AI...</span>
        </div>
      `;
    }

    try {
      const response = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: this.currentCategory }),
      });

      const data = await response.json();
      if (data.success && data.briefing) {
        this.currentBriefingMarkdown = data.briefing;
        if (this.briefingContent) {
          this.briefingContent.innerHTML = typeof marked !== 'undefined'
            ? marked.parse(data.briefing)
            : data.briefing;
        }
      }
    } catch (err) {
      console.error('Briefing error:', err);
      if (this.briefingContent) {
        this.briefingContent.innerHTML = `<p style="color: var(--accent-rose);">Failed to load daily briefing.</p>`;
      }
    }
  }

  closeBriefingModal() {
    if (this.briefingModal) {
      this.briefingModal.classList.remove('active');
      this.briefingModal.setAttribute('aria-hidden', 'true');
    }
  }

  // Theme
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('newsbot_theme', nextTheme);
    this.updateThemeIcon(nextTheme);
  }

  loadTheme() {
    const saved = localStorage.getItem('newsbot_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    this.updateThemeIcon(saved);
  }

  updateThemeIcon(theme) {
    if (this.themeIcon) {
      this.themeIcon.className = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
    }
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
  }

  formatRelativeTime(dateString) {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    const now = new Date();
    const diffSecs = Math.floor((now - date) / 1000);

    if (diffSecs < 60) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new NewsBotApp();
});
