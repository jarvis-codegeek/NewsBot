import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { ChatMessage } from '../types/news';

interface ChatDrawerProps {
  isOpen: boolean;
  messages: ChatMessage[];
  isGenerating: boolean;
  onSendMessage: (msg: string) => void;
  onClearChat: () => void;
  onClose: () => void;
  onToggle: () => void;
}

const PROMPT_CHIPS = [
  '🤖 Top AI News Today',
  '⚡ 60s Global Summary',
  '📈 Market Movements',
  '🚀 Space & Science',
];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  messages,
  isGenerating,
  onSendMessage,
  onClearChat,
  onClose,
  onToggle,
}) => {
  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isGenerating) return;
    onSendMessage(inputVal.trim());
    setInputVal('');
  };

  const handleChipClick = (prompt: string) => {
    const cleanPrompt = prompt.replace(/^[^a-zA-Z0-9]+/, '').trim();
    onSendMessage(cleanPrompt);
  };

  return (
    <>
      <div className={`chat-drawer ${isOpen ? 'active' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <i className="ph-fill ph-robot"></i>
            </div>
            <div>
              <h3 className="chat-title">Chronicle AI Intelligence</h3>
              <span className="chat-status">
                <span className="live-dot-green"></span> Real-Time Newsroom Grounded
              </span>
            </div>
          </div>
          <div className="chat-header-tools">
            <button
              className="btn-icon-subtle"
              onClick={onClearChat}
              title="Clear Conversation"
            >
              <i className="ph ph-trash"></i>
            </button>
            <button
              className="btn-icon-subtle"
              onClick={onClose}
              title="Close Assistant"
            >
              <i className="ph ph-x"></i>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`chat-bubble ${
                m.role === 'user' ? 'user-bubble' : 'bot-bubble'
              }`}
            >
              <div className="chat-bubble-avatar">
                <i className={`ph ${m.role === 'user' ? 'ph-user' : 'ph-fill ph-robot'}`}></i>
              </div>
              <div className="chat-bubble-body">
                {m.content ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(m.content) as string,
                    }}
                  />
                ) : (
                  <div
                    className="spinner"
                    style={{ width: 18, height: 18, borderWidth: 2 }}
                  ></div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Chips */}
        <div className="chat-prompt-chips">
          {PROMPT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              className="prompt-chip"
              onClick={() => handleChipClick(chip)}
              disabled={isGenerating}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <textarea
            rows={1}
            placeholder="Ask about any news event or trend..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={isGenerating}
            title="Send Message"
          >
            <i className="ph-bold ph-paper-plane-right"></i>
          </button>
        </form>
      </div>

      {/* Floating Button */}
      <button
        className="floating-chat-btn"
        onClick={onToggle}
        title="Consult Chronicle AI Intelligence"
      >
        <div className="floating-chat-icon-wrapper">
          <i className="ph-fill ph-chats-circle"></i>
        </div>
        <span className="floating-chat-label">Ask AI</span>
        <span className="floating-chat-pulse"></span>
      </button>
    </>
  );
};
