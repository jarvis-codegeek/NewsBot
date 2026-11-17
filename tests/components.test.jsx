import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioPlayerBar } from '../client/src/components/AudioPlayerBar';
import { Ticker } from '../client/src/components/Ticker';
import { HeroSection } from '../client/src/components/HeroSection';
import { CategoryFilter } from '../client/src/components/CategoryFilter';
import { NewsCard } from '../client/src/components/NewsCard';
import { NewsGrid } from '../client/src/components/NewsGrid';
import { Header } from '../client/src/components/Header';
import { SummaryModal } from '../client/src/components/SummaryModal';
import { DailyBriefingModal } from '../client/src/components/DailyBriefingModal';
import { ChatDrawer } from '../client/src/components/ChatDrawer';
import { ArticleQuickViewModal } from '../client/src/components/ArticleQuickViewModal';

beforeAll(() => {
  // Polyfill for jsdom missing APIs
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn().mockImplementation(() => Promise.resolve()),
    },
  });
});

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, summary: 'Mock AI Summary Text', briefing: 'Mock Briefing' }),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

const dummyArticle = {
  id: 'test-article-1',
  title: 'Supercomputing AI Cluster Deployed in Tokyo',
  source: 'Nikkei Tech',
  snippet: 'A 100,000 GPU cluster dedicated to climate modeling has come online.',
  fullSnippet: 'A 100,000 GPU cluster dedicated to climate modeling has come online in downtown Tokyo.',
  link: 'https://example.com/tokyo-supercomputer',
  category: 'technology',
  pubDate: '2026-11-17T10:00:00Z',
  timestamp: 1731837600000,
  image: 'https://example.com/img.jpg',
  readTime: '3 min read',
};

describe('React Components with React Testing Library (RTL)', () => {
  describe('AudioPlayerBar Component', () => {
    test('renders nothing when isPlaying is false', () => {
      const { container } = render(
        <AudioPlayerBar
          isPlaying={false}
          isPaused={false}
          statusText=""
          onTogglePause={jest.fn()}
          onStop={jest.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    test('renders status text and handles pause/stop interactions', () => {
      const onTogglePause = jest.fn();
      const onStop = jest.fn();

      render(
        <AudioPlayerBar
          isPlaying={true}
          isPaused={false}
          statusText="Playing Evening Wire"
          onTogglePause={onTogglePause}
          onStop={onStop}
        />
      );

      expect(screen.getByText('Playing Evening Wire')).toBeInTheDocument();

      const pauseBtn = screen.getByTitle('Pause');
      fireEvent.click(pauseBtn);
      expect(onTogglePause).toHaveBeenCalledTimes(1);

      const stopBtn = screen.getByTitle('Stop Audio');
      fireEvent.click(stopBtn);
      expect(onStop).toHaveBeenCalledTimes(1);
    });

    test('shows Resume button when isPaused is true', () => {
      render(
        <AudioPlayerBar
          isPlaying={true}
          isPaused={true}
          statusText="Paused Audio"
          onTogglePause={jest.fn()}
          onStop={jest.fn()}
        />
      );

      expect(screen.getByTitle('Resume')).toBeInTheDocument();
    });
  });

  describe('Ticker Component', () => {
    test('renders nothing when article list is empty', () => {
      const { container } = render(<Ticker articles={[]} onArticleClick={jest.fn()} />);
      expect(container.firstChild).toBeNull();
    });

    test('renders breaking news headline and triggers click', () => {
      const onArticleClick = jest.fn();
      render(<Ticker articles={[dummyArticle]} onArticleClick={onArticleClick} />);

      expect(screen.getByText('BREAKING')).toBeInTheDocument();
      expect(screen.getByText('[Nikkei Tech]')).toBeInTheDocument();

      const item = screen.getByText(dummyArticle.title);
      fireEvent.click(item);
      expect(onArticleClick).toHaveBeenCalledWith(dummyArticle);
    });

    test('dismisses ticker when close button is clicked', () => {
      render(<Ticker articles={[dummyArticle]} onArticleClick={jest.fn()} />);
      const closeBtn = screen.getByTitle('Dismiss Ticker');
      fireEvent.click(closeBtn);
      expect(screen.queryByText('BREAKING')).not.toBeInTheDocument();
    });
  });

  describe('HeroSection Component', () => {
    test('renders title, badge, and triggers topic filter on chip click', () => {
      const onTopicClick = jest.fn();
      render(
        <HeroSection
          trending={['Quantum Computing', 'Green Energy']}
          onTopicClick={onTopicClick}
        />
      );

      expect(
        screen.getByText('Authoritative World News, Markets & Technological Intelligence')
      ).toBeInTheDocument();
      expect(screen.getByText('WIRE DESK • VERIFIED REAL-TIME FEEDS')).toBeInTheDocument();

      const chip = screen.getByText('Quantum Computing');
      fireEvent.click(chip);
      expect(onTopicClick).toHaveBeenCalledWith('Quantum Computing');
    });
  });

  describe('CategoryFilter Component', () => {
    test('renders categories with active category indicator', () => {
      const onSelectCategory = jest.fn();
      render(
        <CategoryFilter
          currentCategory="technology"
          onSelectCategory={onSelectCategory}
          onRefresh={jest.fn()}
          isRefreshing={false}
          viewLayout="grid"
          onToggleLayout={jest.fn()}
        />
      );

      const techBtn = screen.getByRole('button', { name: /technology/i });
      expect(techBtn).toHaveClass('active');
      expect(techBtn).toHaveAttribute('aria-current', 'page');

      const worldBtn = screen.getByRole('button', { name: /world & politics/i });
      fireEvent.click(worldBtn);
      expect(onSelectCategory).toHaveBeenCalledWith('world');
    });

    test('handles refresh button and layout toggle buttons', () => {
      const onRefresh = jest.fn();
      const onToggleLayout = jest.fn();

      render(
        <CategoryFilter
          currentCategory="all"
          onSelectCategory={jest.fn()}
          onRefresh={onRefresh}
          isRefreshing={false}
          viewLayout="grid"
          onToggleLayout={onToggleLayout}
        />
      );

      const refreshBtn = screen.getByTitle('Refresh Live News Feeds');
      fireEvent.click(refreshBtn);
      expect(onRefresh).toHaveBeenCalledTimes(1);

      const listBtn = screen.getByTitle('Compact Editorial List View');
      fireEvent.click(listBtn);
      expect(onToggleLayout).toHaveBeenCalledWith('list');
    });
  });

  describe('NewsCard Component', () => {
    test('renders title, snippet, source, and quick view button', () => {
      const onQuickView = jest.fn();
      const onOpenSummary = jest.fn();

      render(
        <NewsCard
          article={dummyArticle}
          onQuickView={onQuickView}
          onOpenSummary={onOpenSummary}
        />
      );

      expect(screen.getByText(dummyArticle.title)).toBeInTheDocument();
      expect(screen.getByText(dummyArticle.snippet)).toBeInTheDocument();
      expect(screen.getByText('Nikkei Tech')).toBeInTheDocument();

      const quickViewBtn = screen.getByText('Quick View');
      fireEvent.click(quickViewBtn);
      expect(onQuickView).toHaveBeenCalledWith(dummyArticle);

      const aiBriefBtn = screen.getByText('AI Brief');
      fireEvent.click(aiBriefBtn);
      expect(onOpenSummary).toHaveBeenCalledWith(dummyArticle);
    });

    test('renders fallback icon when article has no image', () => {
      const noImageArticle = { ...dummyArticle, image: null };
      const { container } = render(
        <NewsCard article={noImageArticle} onQuickView={jest.fn()} />
      );
      expect(container.querySelector('.card-media-fallback')).toBeInTheDocument();
    });
  });

  describe('NewsGrid Component', () => {
    test('renders skeleton cards while loading', () => {
      const { container } = render(
        <NewsGrid
          articles={[]}
          isLoading={true}
          viewLayout="grid"
          onQuickView={jest.fn()}
          onResetSearch={jest.fn()}
          categoryTitle="Top Stories"
        />
      );
      expect(container.querySelectorAll('.skeleton-card')).toHaveLength(6);
      expect(screen.getByText('Fetching latest wire...')).toBeInTheDocument();
    });

    test('renders empty state and handles reset search button', () => {
      const onResetSearch = jest.fn();
      render(
        <NewsGrid
          articles={[]}
          isLoading={false}
          viewLayout="grid"
          onQuickView={jest.fn()}
          onResetSearch={onResetSearch}
          categoryTitle="Search Results"
        />
      );

      expect(screen.getByText('No articles found')).toBeInTheDocument();
      const resetBtn = screen.getByText('Return to Top Stories');
      fireEvent.click(resetBtn);
      expect(onResetSearch).toHaveBeenCalledTimes(1);
    });

    test('renders featured lead story when articles exist in grid view', () => {
      render(
        <NewsGrid
          articles={[dummyArticle, { ...dummyArticle, id: 'art-2', title: 'Second Story' }]}
          isLoading={false}
          viewLayout="grid"
          onQuickView={jest.fn()}
          onResetSearch={jest.fn()}
          categoryTitle="Top Stories"
        />
      );

      expect(screen.getByText('LEAD STORY')).toBeInTheDocument();
      expect(screen.getByText('2 verified reports')).toBeInTheDocument();
    });
  });

  describe('Header Component', () => {
    test('renders title, utilities, and updates search input', () => {
      const onSearch = jest.fn();
      const onOpenBriefing = jest.fn();
      const onOpenChat = jest.fn();
      const onToggleTheme = jest.fn();
      const onToggleFontSize = jest.fn();

      render(
        <Header
          onSearch={onSearch}
          onOpenBriefing={onOpenBriefing}
          onOpenChat={onOpenChat}
          theme="dark"
          onToggleTheme={onToggleTheme}
          isLargeFont={false}
          onToggleFontSize={onToggleFontSize}
        />
      );

      expect(screen.getByText('THE DAILY CHRONICLE')).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(
        'Search breaking stories, topics, business, leaders...'
      );
      fireEvent.change(searchInput, { target: { value: 'quantum' } });
      expect(onSearch).toHaveBeenCalledWith('quantum');

      const clearBtn = screen.getByTitle('Clear search query');
      fireEvent.click(clearBtn);
      expect(onSearch).toHaveBeenCalledWith('');

      const briefingBtn = screen.getByText('Daily Briefing');
      fireEvent.click(briefingBtn);
      expect(onOpenBriefing).toHaveBeenCalledTimes(1);

      const chatBtn = screen.getByText('Ask Chronicle AI');
      fireEvent.click(chatBtn);
      expect(onOpenChat).toHaveBeenCalledTimes(1);
    });
  });

  describe('SummaryModal Component', () => {
    test('renders nothing when isOpen is false', () => {
      const { container } = render(
        <SummaryModal
          article={dummyArticle}
          isOpen={false}
          onClose={jest.fn()}
          onListen={jest.fn()}
          onAskInChat={jest.fn()}
          onShowToast={jest.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    test('renders summary modal tabs and action buttons when open', () => {
      const onClose = jest.fn();
      const onAskInChat = jest.fn();

      render(
        <SummaryModal
          article={dummyArticle}
          isOpen={true}
          onClose={onClose}
          onListen={jest.fn()}
          onAskInChat={onAskInChat}
          onShowToast={jest.fn()}
        />
      );

      expect(screen.getByText('AI Intelligence Analysis')).toBeInTheDocument();
      expect(screen.getByText(dummyArticle.title)).toBeInTheDocument();
      expect(screen.getByText('3-Bullet TL;DR')).toBeInTheDocument();
      expect(screen.getByText('Deep Dive')).toBeInTheDocument();

      const askBtn = screen.getByText('Ask AI About This Story');
      fireEvent.click(askBtn);
      expect(onAskInChat).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('DailyBriefingModal Component', () => {
    test('renders nothing when isOpen is false', () => {
      const { container } = render(
        <DailyBriefingModal
          isOpen={false}
          category="all"
          onClose={jest.fn()}
          onListen={jest.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    test('renders briefing modal when open and handles close', () => {
      const onClose = jest.fn();
      render(
        <DailyBriefingModal
          isOpen={true}
          category="all"
          onClose={onClose}
          onListen={jest.fn()}
        />
      );

      expect(
        screen.getByText('Daily Executive Audio & Intelligence Briefing')
      ).toBeInTheDocument();

      const closeBtn = screen.getByTitle('Close');
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ChatDrawer Component', () => {
    test('renders drawer with prompt chips, messages, and input form', () => {
      const onSendMessage = jest.fn();
      const onClearChat = jest.fn();
      const onClose = jest.fn();

      render(
        <ChatDrawer
          isOpen={true}
          messages={[
            { id: '1', role: 'model', content: 'Welcome to Chronicle AI.' },
            { id: '2', role: 'user', content: 'Tell me about tech.' },
          ]}
          isGenerating={false}
          onSendMessage={onSendMessage}
          onClearChat={onClearChat}
          onClose={onClose}
          onToggle={jest.fn()}
        />
      );

      expect(screen.getByText('Chronicle AI Intelligence')).toBeInTheDocument();
      expect(screen.getByText('Welcome to Chronicle AI.')).toBeInTheDocument();

      const chip = screen.getByText('🤖 Top AI News Today');
      fireEvent.click(chip);
      expect(onSendMessage).toHaveBeenCalledWith('Top AI News Today');

      const textarea = screen.getByPlaceholderText('Ask about any news event or trend...');
      fireEvent.change(textarea, { target: { value: 'What is new?' } });

      const form = textarea.closest('form');
      fireEvent.submit(form);
      expect(onSendMessage).toHaveBeenCalledWith('What is new?');

      const clearBtn = screen.getByTitle('Clear Conversation');
      fireEvent.click(clearBtn);
      expect(onClearChat).toHaveBeenCalledTimes(1);
    });
  });

  describe('ArticleQuickViewModal Component', () => {
    test('renders article details, story view, and handles close', () => {
      const onClose = jest.fn();
      const onAskInChat = jest.fn();

      render(
        <ArticleQuickViewModal
          article={dummyArticle}
          isOpen={true}
          onClose={onClose}
          onListen={jest.fn()}
          onAskInChat={onAskInChat}
          onShowToast={jest.fn()}
        />
      );

      expect(screen.getByText(dummyArticle.title)).toBeInTheDocument();
      expect(screen.getByText('Story View')).toBeInTheDocument();
      expect(screen.getByText('Executive TL;DR')).toBeInTheDocument();

      const askAiBtn = screen.getByText('Ask AI About This Story');
      fireEvent.click(askAiBtn);
      expect(onAskInChat).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
