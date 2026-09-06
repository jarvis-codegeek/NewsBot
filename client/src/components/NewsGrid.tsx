import React from 'react';
import { Article } from '../types/news';
import { NewsCard } from './NewsCard';

interface NewsGridProps {
  articles: Article[];
  isLoading: boolean;
  viewLayout: 'grid' | 'list';
  onOpenSummary: (article: Article) => void;
  onResetSearch: () => void;
  categoryTitle: string;
}

export const NewsGrid: React.FC<NewsGridProps> = ({
  articles,
  isLoading,
  viewLayout,
  onOpenSummary,
  onResetSearch,
  categoryTitle,
}) => {
  return (
    <section className="feed-section">
      <div className="feed-header">
        <div className="feed-title-wrapper">
          <h2 className="feed-title">{categoryTitle}</h2>
          <span className="feed-counter">
            {isLoading ? 'Updating feed...' : `${articles.length} live stories`}
          </span>
        </div>
        <div className="feed-status">
          <span className="status-indicator"></span>
          <span>Connected to Live Feeds</span>
        </div>
      </div>

      {isLoading ? (
        <div className={`news-grid ${viewLayout === 'list' ? 'list-layout' : ''}`}>
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="card skeleton-card"></div>
            ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="empty-state">
          <i className="ph ph-magnifying-glass empty-icon"></i>
          <h3>No articles found</h3>
          <p>Try searching for a different keyword or explore another category.</p>
          <button className="btn btn-outline" onClick={onResetSearch}>
            Reset Search
          </button>
        </div>
      ) : (
        <div className={`news-grid ${viewLayout === 'list' ? 'list-layout' : ''}`}>
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onOpenSummary={onOpenSummary}
            />
          ))}
        </div>
      )}
    </section>
  );
};
