import React from 'react';
import { Article } from '../types/news';
import { NewsCard } from './NewsCard';

interface NewsGridProps {
  articles: Article[];
  isLoading: boolean;
  viewLayout: 'grid' | 'list';
  onQuickView: (article: Article) => void;
  onOpenSummary?: (article: Article) => void;
  onResetSearch: () => void;
  categoryTitle: string;
}

export const NewsGrid: React.FC<NewsGridProps> = ({
  articles,
  isLoading,
  viewLayout,
  onQuickView,
  onOpenSummary,
  onResetSearch,
  categoryTitle,
}) => {
  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const standardArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <section className="feed-section">
      <div className="feed-header">
        <div className="feed-title-wrapper">
          <div className="section-accent-bar"></div>
          <h2 className="feed-title">{categoryTitle}</h2>
          <span className="feed-counter">
            {isLoading ? 'Fetching latest wire...' : `${articles.length} verified reports`}
          </span>
        </div>
        <div className="feed-status">
          <span className="status-indicator"></span>
          <span>Live Newsroom Syndication</span>
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
          <i className="ph ph-newspaper empty-icon"></i>
          <h3>No articles found</h3>
          <p>No reports currently match your filter or search query. Try another keyword or explore top stories.</p>
          <button className="btn btn-outline" onClick={onResetSearch}>
            Return to Top Stories
          </button>
        </div>
      ) : (
        <>
          {/* Featured Lead Story for Broadsheet Journalism standard (if grid view and more than 3 articles) */}
          {featuredArticle && viewLayout === 'grid' && (
            <div className="featured-story-wrapper">
              <div className="featured-lead-tag">
                <span className="lead-tag-bullet"></span> LEAD STORY
              </div>
              <NewsCard
                article={featuredArticle}
                onQuickView={onQuickView}
                onOpenSummary={onOpenSummary}
                isFeatured={true}
              />
            </div>
          )}

          {/* Standard Article Grid or List */}
          <div className={`news-grid ${viewLayout === 'list' ? 'list-layout' : ''}`}>
            {(viewLayout === 'list' ? articles : standardArticles).map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onQuickView={onQuickView}
                onOpenSummary={onOpenSummary}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
