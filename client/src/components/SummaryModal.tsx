import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { Article, SummaryMode, SummaryModeOption } from '../types/news';

interface SummaryModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  onListen: (text: string, title: string) => void;
  onAskInChat: (prompt: string) => void;
  onShowToast: (msg: string) => void;
}

const MODES: SummaryModeOption[] = [
  { id: 'tldr', label: '3-Bullet TL;DR', icon: 'ph-lightning' },
  { id: 'deep_dive', label: 'Deep Dive', icon: 'ph-tree-structure' },
  { id: 'eli5', label: 'ELI5', icon: 'ph-smiley' },
  { id: 'market_impact', label: 'Market Impact', icon: 'ph-trend-up' },
  { id: 'timeline', label: 'Timeline', icon: 'ph-hourglass-medium' },
];

export const SummaryModal: React.FC<SummaryModalProps> = ({
  article,
  isOpen,
  onClose,
  onListen,
  onAskInChat,
  onShowToast,
}) => {
  const [mode, setMode] = useState<SummaryMode>('tldr');
  const [summaryMarkdown, setSummaryMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (article && isOpen) {
      fetchSummary(article, mode);
    }
  }, [article, isOpen, mode]);

  const fetchSummary = async (art: Article, currentMode: SummaryMode) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: art.title,
          snippet: art.fullSnippet || art.snippet,
          source: art.source,
          link: art.link,
          mode: currentMode,
        }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setSummaryMarkdown(data.summary);
      } else {
        setSummaryMarkdown('Unable to generate summary at this time.');
      }
    } catch (err) {
      console.error('Summary error:', err);
      setSummaryMarkdown('Failed to generate summary.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (summaryMarkdown) {
      navigator.clipboard.writeText(summaryMarkdown);
      onShowToast('Analysis copied to clipboard!');
    }
  };

  const handleListen = () => {
    if (summaryMarkdown && article) {
      onListen(summaryMarkdown, `Analysis: ${article.title}`);
    }
  };

  const handleAsk = () => {
    if (article) {
      const query = `Can you provide more context and key implications about this story: "${article.title}"?`;
      onClose();
      onAskInChat(query);
    }
  };

  if (!isOpen || !article) return null;

  return (
    <div className="modal-overlay active" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-badge">
            <i className="ph-fill ph-sparkle"></i>
            <span>AI Intelligence Analysis</span>
          </div>
          <div className="modal-header-actions">
            <button className="btn-icon" onClick={handleListen} title="Listen with Text-to-Speech">
              <i className="ph ph-speaker-high"></i>
            </button>
            <button className="btn-icon" onClick={handleCopy} title="Copy to Clipboard">
              <i className="ph ph-copy"></i>
            </button>
            <button className="btn-icon modal-close" onClick={onClose} title="Close">
              <i className="ph ph-x"></i>
            </button>
          </div>
        </div>

        <div className="modal-body">
          <h2 className="modal-article-title">{article.title}</h2>
          <div className="modal-meta">
            <span>{article.source}</span> • <span>{new Date(article.pubDate).toLocaleDateString()}</span>
          </div>

          {/* Mode Tabs */}
          <div className="summary-modes">
            {MODES.map((m) => (
              <button
                key={m.id}
                className={`mode-tab ${mode === m.id ? 'active' : ''}`}
                onClick={() => setMode(m.id)}
              >
                <i className={`ph ${m.icon}`}></i> {m.label}
              </button>
            ))}
          </div>

          {/* Summary Markdown Content */}
          <div className="summary-content">
            {isLoading ? (
              <div className="summary-loading">
                <div className="spinner"></div>
                <span>Generating AI {mode.replace('_', ' ')} analysis...</span>
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: marked.parse(summaryMarkdown) as string,
                }}
              />
            )}
          </div>

          <div className="modal-footer">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <span>Read Original Article</span>
              <i className="ph ph-arrow-square-out"></i>
            </a>
            <button className="btn btn-primary" onClick={handleAsk}>
              <i className="ph ph-chat-circle-dots"></i>
              <span>Ask AI About This Story</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
