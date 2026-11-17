import React from 'react';

interface HeroSectionProps {
  trending: string[];
  onTopicClick: (topic: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ trending, onTopicClick }) => {
  return (
    <section className="hero-section">
      <div className="hero-card">
        <div className="hero-top-meta">
          <div className="hero-badge">
            <span className="live-dot-red"></span>
            <span>WIRE DESK • VERIFIED REAL-TIME FEEDS</span>
          </div>
          <span className="hero-date-tag">
            <i className="ph ph-shield-check"></i> Credible Sources
          </span>
        </div>

        <h1 className="hero-title">
          Authoritative World News, Markets & Technological Intelligence
        </h1>
        <p className="hero-desc">
          Live syndicated reports from global and national newsdesks. Tap any story for an instant reader view, listen via audio synthesis, or review executive AI briefings.
        </p>

        {/* Trending Topics */}
        {trending.length > 0 && (
          <div className="trending-container">
            <span className="trending-label">
              <i className="ph-bold ph-trend-up"></i> Trending Now:
            </span>
            <div className="trending-chips">
              {trending.map((topic) => (
                <button
                  key={topic}
                  className="chip"
                  onClick={() => onTopicClick(topic)}
                  title={`Filter news by ${topic}`}
                >
                  <span className="chip-hash">#</span>
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
