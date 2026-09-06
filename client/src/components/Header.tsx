import React, { useState } from 'react';

interface HeaderProps {
  onSearch: (query: string) => void;
  onOpenBriefing: () => void;
  onOpenChat: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onOpenBriefing,
  onOpenChat,
  theme,
  onToggleTheme,
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    onSearch(val);
  };

  const handleClear = () => {
    setInputVal('');
    onSearch('');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="brand" onClick={() => onSearch('')}>
          <div className="brand-logo">
            <i className="ph-fill ph-newspaper-clipping"></i>
          </div>
          <div className="brand-info">
            <span className="brand-title">
              NewsBot <span className="brand-badge">AI</span>
            </span>
            <span className="brand-subtitle">Real-Time Intelligence (React + TS)</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="search-wrapper">
          <i className="ph ph-magnifying-glass search-icon"></i>
          <input
            type="text"
            placeholder="Search news, topics, companies, or people..."
            value={inputVal}
            onChange={handleInputChange}
          />
          {inputVal && (
            <button className="search-clear-btn" onClick={handleClear} title="Clear search">
              <i className="ph ph-x-circle"></i>
            </button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="nav-actions">
          <button className="btn btn-outline" onClick={onOpenBriefing} title="Generate AI Daily Briefing">
            <i className="ph ph-sparkle"></i>
            <span className="btn-text">Daily Briefing</span>
          </button>
          <button className="btn btn-primary" onClick={onOpenChat} title="Open AI News Assistant">
            <i className="ph ph-chats-circle"></i>
            <span className="btn-text">Ask NewsBot</span>
          </button>
          <button className="btn-icon" onClick={onToggleTheme} title="Toggle Theme" aria-label="Toggle Theme">
            <i className={`ph ${theme === 'dark' ? 'ph-sun' : 'ph-moon'}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
};
