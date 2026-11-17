import React, { useState, useEffect } from 'react';
import { useNews } from './hooks/useNews';
import { useChat } from './hooks/useChat';
import { useAudio } from './hooks/useAudio';
import { Article, SummaryMode } from './types/news';
import { Header } from './components/Header';
import { Ticker } from './components/Ticker';
import { HeroSection } from './components/HeroSection';
import { CategoryFilter } from './components/CategoryFilter';
import { NewsGrid } from './components/NewsGrid';
import { ArticleQuickViewModal } from './components/ArticleQuickViewModal';
import { DailyBriefingModal } from './components/DailyBriefingModal';
import { ChatDrawer } from './components/ChatDrawer';
import { AudioPlayerBar } from './components/AudioPlayerBar';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('chronicle_theme') as 'dark' | 'light') || 'dark';
  });

  const [isLargeFont, setIsLargeFont] = useState<boolean>(() => {
    return localStorage.getItem('chronicle_large_font') === 'true';
  });

  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewInitialTab, setQuickViewInitialTab] = useState<'story' | SummaryMode>('story');
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
    localStorage.setItem('chronicle_theme', theme);
  }, [theme]);

  // Apply accessibility text size class to body
  useEffect(() => {
    if (isLargeFont) {
      document.body.classList.add('text-size-large');
    } else {
      document.body.classList.remove('text-size-large');
    }
    localStorage.setItem('chronicle_large_font', String(isLargeFont));
  }, [isLargeFont]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleFontSize = () => {
    setIsLargeFont((prev) => !prev);
    showToast(isLargeFont ? 'Standard font size restored' : 'Large font size enabled for better reading');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenQuickView = (article: Article) => {
    setSelectedArticle(article);
    setQuickViewInitialTab('story');
    setIsQuickViewOpen(true);
  };

  const handleOpenSummary = (article: Article) => {
    setSelectedArticle(article);
    setQuickViewInitialTab('tldr');
    setIsQuickViewOpen(true);
  };

  const categoryTitles: Record<string, string> = {
    all: 'Top Stories & Breaking Wire',
    world: 'World News & Geopolitics',
    business: 'Business, Markets & Economy',
    technology: 'Technology & Digital Horizons',
    ai: 'Artificial Intelligence & Innovation Radar',
    science: 'Science Discoveries & Space Exploration',
    health: 'Health, Medicine & Wellness',
    entertainment: 'Entertainment, Arts & Culture',
  };

  const currentTitle = searchQuery
    ? `Search Results for "${searchQuery}"`
    : categoryTitles[category] || 'Live News Wire';

  return (
    <div className="app-root">
      {/* Breaking News Ticker (Topmost, like TimesNow / Deccan Herald) */}
      <Ticker articles={articles} onArticleClick={handleOpenQuickView} />

      {/* Main Masthead & Top Utilities */}
      <Header
        onSearch={search}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        onOpenChat={() => openChat()}
        theme={theme}
        onToggleTheme={toggleTheme}
        isLargeFont={isLargeFont}
        onToggleFontSize={toggleFontSize}
      />

      {/* Sticky Primary Top Menu Bar */}
      <CategoryFilter
        currentCategory={category}
        onSelectCategory={selectCategory}
        onRefresh={refresh}
        isRefreshing={isLoading}
        viewLayout={viewLayout}
        onToggleLayout={setViewLayout}
      />

      {/* Main Container */}
      <main className="main-content">
        {!searchQuery && (
          <HeroSection
            trending={trending}
            onTopicClick={(topic) => search(topic)}
          />
        )}

        <NewsGrid
          articles={articles}
          isLoading={isLoading}
          viewLayout={viewLayout}
          onQuickView={handleOpenQuickView}
          onOpenSummary={handleOpenSummary}
          onResetSearch={() => search('')}
          categoryTitle={currentTitle}
        />
      </main>

      {/* Article Quick View & Analysis Reader Modal */}
      <ArticleQuickViewModal
        article={selectedArticle}
        isOpen={isQuickViewOpen}
        initialTab={quickViewInitialTab}
        onClose={() => setIsQuickViewOpen(false)}
        onListen={speak}
        onAskInChat={(prompt) => openChat(prompt)}
        onShowToast={showToast}
      />

      {/* Daily Executive Briefing Modal */}
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
      <div className={`toast ${toastMessage ? 'show' : ''}`} role="alert" aria-live="polite">
        {toastMessage}
      </div>
    </div>
  );
};

export default App;
