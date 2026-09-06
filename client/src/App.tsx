import React, { useState, useEffect } from 'react';
import { useNews } from './hooks/useNews';
import { useChat } from './hooks/useChat';
import { useAudio } from './hooks/useAudio';
import { Article } from './types/news';
import { Header } from './components/Header';
import { Ticker } from './components/Ticker';
import { HeroSection } from './components/HeroSection';
import { CategoryFilter } from './components/CategoryFilter';
import { NewsGrid } from './components/NewsGrid';
import { SummaryModal } from './components/SummaryModal';
import { DailyBriefingModal } from './components/DailyBriefingModal';
import { ChatDrawer } from './components/ChatDrawer';
import { AudioPlayerBar } from './components/AudioPlayerBar';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('newsbot_theme') as 'dark' | 'light') || 'dark';
  });
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    category,
    articles,
    trending,
    isLoading,
    searchQuery,
    selectCategory,
    search,
    refresh,
  } = useNews('all');

  const {
    messages,
    isGenerating,
    isOpen: isChatOpen,
    sendMessage,
    clearChat,
    openChat,
    closeChat,
    toggleChat,
  } = useChat();

  const {
    isPlaying: isAudioPlaying,
    isPaused: isAudioPaused,
    statusText: audioStatusText,
    speak,
    togglePause: toggleAudioPause,
    stop: stopAudio,
  } = useAudio();

  // Apply theme to html root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('newsbot_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenSummary = (article: Article) => {
    setSelectedArticle(article);
    setIsSummaryOpen(true);
  };

  const categoryTitles: Record<string, string> = {
    all: 'Latest Global Headlines',
    ai: 'Artificial Intelligence & Innovation Radar',
    technology: 'Technology & Silicon Landscape',
    business: 'Business, Markets & Economy',
    world: 'World News & Geopolitics',
    science: 'Science Discoveries & Space Exploration',
    health: 'Health, Medicine & Biotech',
    entertainment: 'Entertainment & Culture',
  };

  const currentTitle = searchQuery
    ? `Search Results for "${searchQuery}"`
    : categoryTitles[category] || 'Live News Feed';

  return (
    <div className="app-root">
      {/* Ambient background glows */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      <div className="bg-glow bg-glow-3"></div>

      {/* Breaking News Ticker */}
      <Ticker articles={articles} onArticleClick={handleOpenSummary} />

      {/* Main Navigation */}
      <Header
        onSearch={search}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        onOpenChat={() => openChat()}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="main-content">
        {!searchQuery && (
          <HeroSection
            trending={trending}
            onTopicClick={(topic) => search(topic)}
          />
        )}

        <CategoryFilter
          currentCategory={category}
          onSelectCategory={selectCategory}
          onRefresh={refresh}
          isRefreshing={isLoading}
          viewLayout={viewLayout}
          onToggleLayout={setViewLayout}
        />

        <NewsGrid
          articles={articles}
          isLoading={isLoading}
          viewLayout={viewLayout}
          onOpenSummary={handleOpenSummary}
          onResetSearch={() => search('')}
          categoryTitle={currentTitle}
        />
      </main>

      {/* AI Summary Modal */}
      <SummaryModal
        article={selectedArticle}
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        onListen={speak}
        onAskInChat={(prompt) => openChat(prompt)}
        onShowToast={showToast}
      />

      {/* Daily Briefing Modal */}
      <DailyBriefingModal
        isOpen={isBriefingOpen}
        category={category}
        onClose={() => setIsBriefingOpen(false)}
        onListen={speak}
      />

      {/* Conversational AI Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        messages={messages}
        isGenerating={isGenerating}
        onSendMessage={sendMessage}
        onClearChat={clearChat}
        onClose={closeChat}
        onToggle={toggleChat}
      />

      {/* Audio Player Bar */}
      <AudioPlayerBar
        isPlaying={isAudioPlaying}
        isPaused={isAudioPaused}
        statusText={audioStatusText}
        onTogglePause={toggleAudioPause}
        onStop={stopAudio}
      />

      {/* Toast Notification */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
};

export default App;
