import React, { useState, useEffect } from 'react';

interface HeaderProps {
  onSearch: (query: string) => void;
  onOpenBriefing: () => void;
  onOpenChat: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isLargeFont: boolean;
  onToggleFontSize: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onOpenBriefing,
  onOpenChat,
  theme,
  onToggleTheme,
  isLargeFont,
  onToggleFontSize,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    setCurrentDateStr(now.toLocaleDateString('en-US', options));
  }, []);

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
    <header className="header-wrapper">
      {/* Top Utility Bar (Inspired by Times Now & Deccan Herald) */}
      <div className="top-utility-bar">
        <div className="utility-container">
          <div className="utility-left">
            <span className="current-date">
              <i className="ph ph-calendar-blank"></i> {currentDateStr || 'Today'}
            </span>
            <span className="utility-divider">•</span>
            <span className="edition-badge">
              <i className="ph ph-map-pin"></i> Global Edition
            </span>
            <span className="utility-divider">•</span>
            <span className="live-pulse-badge">
              <span className="live-dot-green"></span> Live Newsroom
            </span>
          </div>

          <div className="utility-right">
            {/* Font Size Accessibility Adjuster */}
            <button
              className={`utility-btn ${isLargeFont ? 'active' : ''}`}
              onClick={onToggleFontSize}
              title={isLargeFont ? 'Switch to Standard Font Size' : 'Increase Font Size (Better Readability)'}
              aria-label="Toggle Font Size"
            >
              <i className="ph ph-text-aa"></i>
              <span>{isLargeFont ? 'Standard Text' : 'Large Text'}</span>
            </button>

            <button
              className="utility-btn"
              onClick={onOpenBriefing}
              title="Daily Executive News Briefing"
            >
              <i className="ph-fill ph-sparkle"></i>
              <span>Daily Briefing</span>
            </button>

            <button
              className="utility-btn utility-btn-ai"
              onClick={onOpenChat}
              title="Open Chronicle AI News Analyst"
            >
              <i className="ph-fill ph-chat-circle-dots"></i>
              <span>Ask Chronicle AI</span>
            </button>

            <button
              className="utility-icon-btn"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              <i className={`ph ${theme === 'dark' ? 'ph-sun' : 'ph-moon'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main Masthead / Broadsheet Newspaper Banner */}
      <div className="masthead">
        <div className="masthead-container">
          <div className="masthead-branding" onClick={() => onSearch('')} role="button" tabIndex={0}>
            <div className="masthead-crest">
              <i className="ph-bold ph-newspaper-clipping"></i>
            </div>
            <div className="masthead-title-group">
              <h1 className="masthead-title">THE DAILY CHRONICLE</h1>
              <p className="masthead-tagline">
                Truth, Insight & Real-Time Global Journalism
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="masthead-search-wrapper">
            <i className="ph ph-magnifying-glass search-icon"></i>
            <input
              type="text"
              placeholder="Search breaking stories, topics, business, leaders..."
              value={inputVal}
              onChange={handleInputChange}
              aria-label="Search news"
            />
            {inputVal && (
              <button
                className="search-clear-btn"
                onClick={handleClear}
                title="Clear search query"
              >
                <i className="ph ph-x-circle"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
