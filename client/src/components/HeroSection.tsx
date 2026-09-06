import React from 'react';

interface HeroSectionProps {
  trending: string[];
  onTopicClick: (topic: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ trending, onTopicClick }) => {
  return (
    <section className="hero-section">
      <div className="hero-card">
        <div className="hero-badge">
          <i className="ph-fill ph-lightning"></i>
          <span>LIVE AGGREGATION & LLM REASONING</span>
        </div>
        <h1 className="hero-title">Stay Ahead With AI-Powered News Intelligence</h1>
        <p className="hero-desc">
          Continuous real-time news radar analyzed by Large Language Models. Get 30-second executive summaries, deep market impact analyses, or converse directly with our AI intelligence bot.
        </p>

        {/* Trending Topics */}
        {trending.length > 0 && (
          <div className="trending-container">
            <span className="trending-label">
              <i className="ph ph-trend-up"></i> Trending:
            </span>
            <div className="trending-chips">
              {trending.map((topic) => (
                <button
                  key={topic}
                  className="chip"
                  onClick={() => onTopicClick(topic)}
                >
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
