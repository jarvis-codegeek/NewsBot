import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { CategoryId } from '../types/news';

interface DailyBriefingModalProps {
  isOpen: boolean;
  category: CategoryId;
  onClose: () => void;
  onListen: (text: string, title: string) => void;
}

export const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({
  isOpen,
  category,
  onClose,
  onListen,
}) => {
  const [briefingMarkdown, setBriefingMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchBriefing();
    }
  }, [isOpen, category]);

  const fetchBriefing = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (data.success && data.briefing) {
        setBriefingMarkdown(data.briefing);
      } else {
        setBriefingMarkdown('Unable to generate daily briefing.');
      }
    } catch (err) {
      console.error('Briefing fetch error:', err);
      setBriefingMarkdown('Failed to generate daily briefing.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleListen = () => {
    if (briefingMarkdown) {
      onListen(briefingMarkdown, 'Playing Daily Executive Briefing');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-container briefing-modal-container">
        <div className="modal-header">
          <div className="modal-badge briefing-badge">
            <i className="ph-fill ph-broadcast"></i>
            <span>Daily Executive Audio & Intelligence Briefing</span>
          </div>
          <div className="modal-header-actions">
            <button
              className="btn-icon"
              onClick={handleListen}
              title="Listen to Briefing"
            >
              <i className="ph ph-speaker-high"></i>
            </button>
            <button
              className="btn-icon modal-close"
              onClick={onClose}
              title="Close"
            >
              <i className="ph ph-x"></i>
            </button>
          </div>
        </div>
        <div className="modal-body">
          <div className="briefing-content">
            {isLoading ? (
              <div className="summary-loading">
                <div className="spinner"></div>
                <span>Compiling daily executive briefing with AI...</span>
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: marked.parse(briefingMarkdown) as string,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
