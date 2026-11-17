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
  { id: 'all', name: 'Top Stories', icon: 'ph-globe' },
  { id: 'world', name: 'World & Politics', icon: 'ph-newspaper' },
  { id: 'business', name: 'Business & Markets', icon: 'ph-trend-up' },
  { id: 'technology', name: 'Technology', icon: 'ph-laptop' },
  { id: 'ai', name: 'AI & Innovation', icon: 'ph-cpu' },
  { id: 'science', name: 'Science & Space', icon: 'ph-atom' },
  { id: 'health', name: 'Health & Wellness', icon: 'ph-heartbeat' },
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
    <nav className="top-menu-bar" aria-label="News sections navigation">
      <div className="menu-bar-container">
        <div className="menu-categories-scroll">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                className={`menu-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <i className={`ph ${cat.icon}`}></i>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="menu-controls">
          <button
            className="menu-control-btn"
            onClick={onRefresh}
            title="Refresh Live News Feeds"
            disabled={isRefreshing}
          >
            <i className={`ph ph-arrows-clockwise ${isRefreshing ? 'ph-spin' : ''}`}></i>
            <span className="control-label">{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>

          <div className="layout-toggle-group">
            <button
              className={`layout-btn ${viewLayout === 'grid' ? 'active' : ''}`}
              onClick={() => onToggleLayout('grid')}
              title="Newspaper Grid View"
              aria-label="Grid view"
            >
              <i className="ph ph-squares-four"></i>
            </button>
            <button
              className={`layout-btn ${viewLayout === 'list' ? 'active' : ''}`}
              onClick={() => onToggleLayout('list')}
              title="Compact Editorial List View"
              aria-label="List view"
            >
              <i className="ph ph-list-dashes"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
