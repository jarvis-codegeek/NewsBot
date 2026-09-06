import React from 'react';
import { CategoryId, CategoryInfo } from '../types/news';

interface CategoryFilterProps {
  currentCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  viewLayout: 'grid' | 'list';
  onToggleLayout: (layout: 'grid' | 'list') => void;
}

const CATEGORIES: CategoryInfo[] = [
  { id: 'all', name: 'All News', icon: 'ph-globe' },
  { id: 'ai', name: 'AI & Innovation', icon: 'ph-cpu' },
  { id: 'technology', name: 'Technology', icon: 'ph-laptop' },
  { id: 'business', name: 'Business & Markets', icon: 'ph-trend-up' },
  { id: 'world', name: 'World', icon: 'ph-newspaper' },
  { id: 'science', name: 'Science & Space', icon: 'ph-atom' },
  { id: 'health', name: 'Health', icon: 'ph-heartbeat' },
  { id: 'entertainment', name: 'Entertainment', icon: 'ph-film-strip' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  currentCategory,
  onSelectCategory,
  onRefresh,
  isRefreshing,
  viewLayout,
  onToggleLayout,
}) => {
  return (
    <section className="categories-bar">
      <div className="categories-scroll">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`cat-tab ${currentCategory === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            <i className={`ph ${cat.icon}`}></i>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="feed-controls">
        <button
          className="btn-icon-subtle"
          onClick={onRefresh}
          title="Refresh Live News"
        >
          <i className={`ph ph-arrows-clockwise ${isRefreshing ? 'ph-spin' : ''}`}></i>
        </button>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewLayout === 'grid' ? 'active' : ''}`}
            onClick={() => onToggleLayout('grid')}
            title="Grid View"
          >
            <i className="ph ph-squares-four"></i>
          </button>
          <button
            className={`view-btn ${viewLayout === 'list' ? 'active' : ''}`}
            onClick={() => onToggleLayout('list')}
            title="Compact List View"
          >
            <i className="ph ph-list-dashes"></i>
          </button>
        </div>
      </div>
    </section>
  );
};
