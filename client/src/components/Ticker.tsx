import React, { useState } from 'react';
import { Article } from '../types/news';

interface TickerProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

export const Ticker: React.FC<TickerProps> = ({ articles, onArticleClick }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || articles.length === 0) return null;

  return (
    <div className="ticker-bar">
      <div className="ticker-label">
        <span className="live-dot"></span>
        <span>BREAKING</span>
      </div>
      <div className="ticker-content-wrapper">
        <div className="ticker-content">
          {articles.slice(0, 10).map((a, i) => (
            <span
              key={a.id || i}
              className="ticker-item"
              onClick={() => onArticleClick(a)}
            >
              <i className="ph-fill ph-caret-right" style={{ color: 'var(--accent-rose)', fontSize: '0.8rem' }}></i>
              <strong>[{a.source}]</strong> {a.title}
            </span>
          ))}
        </div>
      </div>
      <button
        className="ticker-close"
        onClick={() => setIsVisible(false)}
        title="Dismiss Ticker"
        aria-label="Dismiss Ticker"
      >
        <i className="ph ph-x"></i>
      </button>
    </div>
  );
};
