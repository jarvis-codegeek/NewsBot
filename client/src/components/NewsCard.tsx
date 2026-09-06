import React from 'react';
import { Article } from '../types/news';

interface NewsCardProps {
  article: Article;
  onOpenSummary: (article: Article) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onOpenSummary }) => {
  const formatTime = (dateStr: string) => {
    if (!dateStr) return 'Recent';
    const d = new Date(dateStr);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSecs < 60) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <article className="article-card">
      <div className="card-media">
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            onError={(e) => {
              // replace with fallback
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="card-media-fallback">
            <i className="ph-fill ph-newspaper"></i>
          </div>
        )}
        <span className="card-source-tag">{article.source}</span>
        <span className="card-time-tag">{formatTime(article.pubDate)}</span>
      </div>

      <div className="card-body">
        <h3 className="card-title">
          <a href={article.link} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h3>
        <p className="card-snippet">
          {article.snippet || 'Click to explore complete coverage and AI analysis.'}
        </p>
        <div className="card-footer">
          <button
            className="card-ai-btn"
            onClick={() => onOpenSummary(article)}
          >
            <i className="ph-fill ph-sparkle"></i> AI Summary
          </button>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="card-read-more"
          >
            {article.readTime || 'Read'} <i className="ph ph-arrow-right"></i>
          </a>
        </div>
      </div>
    </article>
  );
};
