import React from 'react';
import { Article } from '../types/news';

interface NewsCardProps {
  article: Article;
  onQuickView: (article: Article) => void;
  onOpenSummary?: (article: Article) => void;
  isFeatured?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onQuickView,
  onOpenSummary,
  isFeatured = false,
}) => {
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

  const handleCardClick = (e: React.MouseEvent) => {
    // If the user clicked an explicit external link, allow default navigation
    const target = e.target as HTMLElement;
    if (target.closest('.card-external-link')) {
      return;
    }
    // Otherwise open Quick View
    e.preventDefault();
    onQuickView(article);
  };

  return (
    <article
      className={`article-card ${isFeatured ? 'featured-card' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onQuickView(article);
        }
      }}
      aria-label={`Quick view: ${article.title}`}
    >
      <div className="card-media">
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="card-media-fallback">
            <i className="ph-fill ph-newspaper"></i>
            <span className="fallback-tag">{article.source}</span>
          </div>
        )}
        <div className="media-overlay-badges">
          <span className="card-source-tag">{article.source}</span>
          <span className="card-time-tag">
            <i className="ph ph-clock"></i> {formatTime(article.pubDate)}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="card-meta-row">
          <span className="card-category-indicator">
            {article.category?.toUpperCase() || 'TOP STORY'}
          </span>
          <span className="card-read-time">
            <i className="ph ph-book-open"></i> {article.readTime || '2 min read'}
          </span>
        </div>

        <h3 className="card-title">
          <span className="title-text">{article.title}</span>
        </h3>

        <p className="card-snippet">
          {article.snippet || 'Click to view complete story coverage, context, and intelligence analysis.'}
        </p>

        <div className="card-footer" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="card-quickview-btn"
            onClick={() => onQuickView(article)}
            title="Read Full Story & AI Analysis in Quick View"
          >
            <i className="ph-bold ph-eye"></i> Quick View
          </button>

          <div className="card-actions-right">
            {onOpenSummary && (
              <button
                type="button"
                className="card-ai-btn"
                onClick={() => onOpenSummary(article)}
                title="AI Summary & Insights"
              >
                <i className="ph-fill ph-sparkle"></i> AI Brief
              </button>
            )}

            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="card-external-link"
              title="Open original source article in new tab"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="ph ph-arrow-square-out"></i>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
