import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { Article, SummaryMode, SummaryModeOption } from '../types/news';

interface ArticleQuickViewModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  onListen: (text: string, title: string) => void;
  onAskInChat: (prompt: string) => void;
  onShowToast: (msg: string) => void;
  initialTab?: 'story' | SummaryMode;
}

const AI_TABS: SummaryModeOption[] = [
  { id: 'tldr', label: 'Executive TL;DR', icon: 'ph-lightning' },
  { id: 'deep_dive', label: 'Deep Dive', icon: 'ph-tree-structure' },
  { id: 'market_impact', label: 'Market Impact', icon: 'ph-trend-up' },
  { id: 'eli5', label: 'Simple (ELI5)', icon: 'ph-smiley' },
  { id: 'timeline', label: 'Timeline', icon: 'ph-hourglass-medium' },
];

export const ArticleQuickViewModal: React.FC<ArticleQuickViewModalProps> = ({
  article,
  isOpen,
  onClose,
  onListen,
  onAskInChat,
  onShowToast,
  initialTab = 'story',
}) => {
  const [activeTab, setActiveTab] = useState<'story' | SummaryMode>('story');
  const [analysisMap, setAnalysisMap] = useState<Record<string, string>>({});
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Sync tab when modal opens or initialTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab, article?.id]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch AI summary when an AI tab is selected
  useEffect(() => {
    if (!article || !isOpen || activeTab === 'story') return;

    // Check if we already fetched this analysis mode for this article
    const cacheKey = `${article.id}_${activeTab}`;
    if (analysisMap[cacheKey]) return;

    const fetchAnalysis = async () => {
      setIsLoadingAnalysis(true);
      try {
        const res = await fetch('/api/ai/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: article.title,
            snippet: article.fullSnippet || article.snippet,
            source: article.source,
            link: article.link,
            mode: activeTab,
          }),
        });
        const data = await res.json();
        if (data.success && data.summary) {
          setAnalysisMap((prev) => ({ ...prev, [cacheKey]: data.summary }));
        } else {
          setAnalysisMap((prev) => ({
            ...prev,
            [cacheKey]: 'Analysis is temporarily unavailable. Please try again.',
          }));
        }
      } catch (err) {
        console.error('QuickView analysis fetch error:', err);
        setAnalysisMap((prev) => ({
          ...prev,
          [cacheKey]: 'Failed to generate analysis. Please check network connection.',
        }));
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    fetchAnalysis();
  }, [article, isOpen, activeTab, analysisMap]);

  if (!isOpen || !article) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(article.link || window.location.href);
    onShowToast('Article link copied to clipboard!');
  };

  const handleListen = () => {
    const textToSpeak =
      activeTab === 'story'
        ? `${article.title}. Published by ${article.source}. ${article.fullSnippet || article.snippet}`
        : analysisMap[`${article.id}_${activeTab}`] || article.title;

    onListen(textToSpeak, article.title);
  };

  const handleAskAI = () => {
    const query = `Provide in-depth background, analysis, and key questions regarding this story: "${article.title}" reported by ${article.source}.`;
    onClose();
    onAskInChat(query);
  };

  const formattedDate = article.pubDate
    ? new Date(article.pubDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent Story';

  const currentAnalysisText = analysisMap[`${article.id}_${activeTab}`] || '';

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickview-title"
    >
      <div className="quickview-modal-container">
        {/* Modal Top Bar */}
        <div className="quickview-header">
          <div className="quickview-publisher-info">
            <span className="publisher-tag">{article.source}</span>
            <span className="meta-separator">•</span>
            <span className="reading-badge">
              <i className="ph ph-book-open"></i> {article.readTime || '2 min read'}
            </span>
          </div>

          <div className="quickview-actions">
            <button
              className="quickview-icon-btn"
              onClick={handleListen}
              title="Listen with Text-to-Speech"
              aria-label="Listen to article"
            >
              <i className="ph-fill ph-speaker-high"></i>
              <span className="btn-label">Listen</span>
            </button>

            <button
              className="quickview-icon-btn"
              onClick={handleCopyLink}
              title="Copy Story Link"
              aria-label="Copy story link"
            >
              <i className="ph ph-share-network"></i>
            </button>

            <button
              className="quickview-icon-btn close-btn"
              onClick={onClose}
              title="Close Quick View (Esc)"
              aria-label="Close modal"
            >
              <i className="ph ph-x"></i>
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="quickview-scroll-body">
          {/* Article Headline & Dateline */}
          <div className="quickview-title-block">
            <h2 id="quickview-title" className="quickview-headline">
              {article.title}
            </h2>

            <div className="quickview-dateline">
              <span>
                <i className="ph ph-clock"></i> {formattedDate}
              </span>
              <span className="meta-separator">•</span>
              <span className="quickview-cat-badge">
                {article.category?.toUpperCase() || 'GENERAL'}
              </span>
            </div>
          </div>

          {/* Hero Media */}
          {article.image && (
            <div className="quickview-hero-media">
              <img
                src={article.image}
                alt={article.title}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="media-caption">Image: {article.source} via syndicated wire</span>
            </div>
          )}

          {/* Reader Tabs (Editorial View vs AI Analysis modes) */}
          <div className="quickview-tabs-bar">
            <button
              className={`quickview-tab ${activeTab === 'story' ? 'active' : ''}`}
              onClick={() => setActiveTab('story')}
            >
              <i className="ph-bold ph-article"></i> Story View
            </button>

            <div className="tab-divider"></div>

            {AI_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`quickview-tab ai-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`ph ${tab.icon}`}></i> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="quickview-content-panel">
            {activeTab === 'story' ? (
              <div className="editorial-story-content">
                <div className="story-lead-paragraph">
                  {article.fullSnippet || article.snippet}
                </div>

                <div className="story-context-box">
                  <div className="context-box-header">
                    <i className="ph-fill ph-info"></i>
                    <h4>Newsroom Context & Wire Report</h4>
                  </div>
                  <p>
                    This report has been syndicated and cross-verified via{' '}
                    <strong>{article.source}</strong>. For complete unedited reporting, media
                    attachments, photojournalism, and community comments, explore the official source coverage.
                  </p>
                </div>
              </div>
            ) : (
              <div className="ai-analysis-content">
                {isLoadingAnalysis ? (
                  <div className="analysis-loading-state">
                    <div className="spinner"></div>
                    <p>Generating verified {activeTab.replace('_', ' ')} intelligence...</p>
                  </div>
                ) : (
                  <div
                    className="markdown-rendered-body"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(currentAnalysisText) as string,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div className="quickview-footer">
          <div className="footer-left">
            <button
              className="quickview-ask-ai-btn"
              onClick={handleAskAI}
              title="Discuss this story with Chronicle AI Analyst"
            >
              <i className="ph-fill ph-chat-circle-dots"></i>
              <span>Ask AI About This Story</span>
            </button>
          </div>

          <div className="footer-right">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="quickview-primary-btn"
              title={`Read full coverage directly on ${article.source}`}
            >
              <span>Read Full Story on {article.source}</span>
              <i className="ph ph-arrow-square-out"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

