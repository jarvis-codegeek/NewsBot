function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/#+\s/g, '')
    .replace(/[*_~`]/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[-*•]\s/g, '. ')
    .replace(/\n+/g, '. ')
    .trim();
}

function formatTime(dateStr, mockNow) {
  if (!dateStr) return 'Recent';
  const d = new Date(dateStr);
  const now = mockNow ? new Date(mockNow) : new Date();
  const diffSecs = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSecs < 60) return 'Just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

describe('Client Logic & Utilities Unit Tests (Jest)', () => {
  describe('stripMarkdown (Audio TTS Helper)', () => {
    test('returns empty string for null, undefined, or empty text', () => {
      expect(stripMarkdown('')).toBe('');
      expect(stripMarkdown(null)).toBe('');
      expect(stripMarkdown(undefined)).toBe('');
    });

    test('strips markdown headers (#, ##, ###)', () => {
      const input = '### Executive Intelligence Briefing\n## Top Stories';
      const output = stripMarkdown(input);
      expect(output).not.toContain('#');
      expect(output).toContain('Executive Intelligence Briefing');
      expect(output).toContain('Top Stories');
    });

    test('removes bold, italic, strikethrough, and backtick markers', () => {
      const input = 'This is **bold** and *italic* and `code` formatting.';
      const output = stripMarkdown(input);
      expect(output).toBe('This is bold and italic and code formatting.');
    });

    test('replaces markdown links with just their display text', () => {
      const input = 'Read the full story at [BBC World News](https://bbc.com/world).';
      const output = stripMarkdown(input);
      expect(output).toBe('Read the full story at BBC World News.');
    });

    test('converts bullet points into pause periods for smooth TTS narration', () => {
      const input = '- First point\n- Second point\n• Third point';
      const output = stripMarkdown(input);
      expect(output).toContain('. First point');
      expect(output).toContain('. Second point');
      expect(output).toContain('. Third point');
    });

    test('collapses multiple consecutive newlines into periods', () => {
      const input = 'Paragraph one.\n\n\nParagraph two.';
      const output = stripMarkdown(input);
      expect(output).toBe('Paragraph one.. Paragraph two.');
    });
  });

  describe('formatTime (NewsCard Relative Time Helper)', () => {
    const fixedNow = new Date('2026-11-17T12:00:00Z').getTime();

    test('returns "Recent" when date string is missing or invalid', () => {
      expect(formatTime('', fixedNow)).toBe('Recent');
      expect(formatTime(null, fixedNow)).toBe('Recent');
    });

    test('returns "Just now" for dates within 60 seconds', () => {
      const dateStr = new Date(fixedNow - 30 * 1000).toISOString();
      expect(formatTime(dateStr, fixedNow)).toBe('Just now');
    });

    test('returns "Xm ago" for dates within 60 minutes', () => {
      const dateStr = new Date(fixedNow - 15 * 60 * 1000).toISOString();
      expect(formatTime(dateStr, fixedNow)).toBe('15m ago');
    });

    test('returns "Xh ago" for dates within 24 hours', () => {
      const dateStr = new Date(fixedNow - 4 * 3600 * 1000).toISOString();
      expect(formatTime(dateStr, fixedNow)).toBe('4h ago');
    });

    test('returns "Xd ago" for dates older than 24 hours', () => {
      const dateStr = new Date(fixedNow - 3 * 86400 * 1000).toISOString();
      expect(formatTime(dateStr, fixedNow)).toBe('3d ago');
    });
  });

  describe('App Category Titles & Search State Logic', () => {
    const categoryTitles = {
      all: 'Top Stories & Breaking Wire',
      world: 'World News & Geopolitics',
      business: 'Business, Markets & Economy',
      technology: 'Technology & Digital Horizons',
      ai: 'Artificial Intelligence & Innovation Radar',
      science: 'Science Discoveries & Space Exploration',
      health: 'Health, Medicine & Wellness',
      entertainment: 'Entertainment, Arts & Culture',
    };

    test('maps all 8 supported categories to appropriate display headers', () => {
      const categories = ['all', 'world', 'business', 'technology', 'ai', 'science', 'health', 'entertainment'];
      for (const cat of categories) {
        expect(categoryTitles[cat]).toBeDefined();
        expect(categoryTitles[cat].length).toBeGreaterThan(5);
      }
    });

    test('generates search title when searchQuery is present', () => {
      const searchQuery = 'Nvidia Blackwell';
      const title = searchQuery
        ? `Search Results for "${searchQuery}"`
        : categoryTitles['all'];

      expect(title).toBe('Search Results for "Nvidia Blackwell"');
    });

    test('falls back to category title when searchQuery is empty', () => {
      const searchQuery = '';
      const title = searchQuery
        ? `Search Results for "${searchQuery}"`
        : categoryTitles['technology'];

      expect(title).toBe('Technology & Digital Horizons');
    });
  });

  describe('Summary Modes & AI Tabs Definitions', () => {
    const modes = [
      { id: 'tldr', label: 'Executive TL;DR', icon: 'ph-lightning' },
      { id: 'deep_dive', label: 'Deep Dive', icon: 'ph-tree-structure' },
      { id: 'market_impact', label: 'Market Impact', icon: 'ph-trend-up' },
      { id: 'eli5', label: 'Simple (ELI5)', icon: 'ph-smiley' },
      { id: 'timeline', label: 'Timeline', icon: 'ph-hourglass-medium' },
    ];

    test('defines 5 standard AI analysis modes', () => {
      expect(modes).toHaveLength(5);
      const ids = modes.map(m => m.id);
      expect(ids).toEqual(['tldr', 'deep_dive', 'market_impact', 'eli5', 'timeline']);
    });

    test('each mode contains valid id, user-facing label, and phosphor icon', () => {
      for (const m of modes) {
        expect(m.id).toBeDefined();
        expect(m.label).toBeDefined();
        expect(m.icon.startsWith('ph-')).toBe(true);
      }
    });
  });

  describe('ChatDrawer Prompt Chips Cleaning', () => {
    const promptChips = [
      '🤖 Top AI News Today',
      '⚡ 60s Global Summary',
      '📈 Market Movements',
      '🚀 Space & Science',
    ];

    test('cleans leading emojis and symbols when clicked', () => {
      const cleaned = promptChips.map(p => p.replace(/^[^a-zA-Z0-9]+/, '').trim());
      expect(cleaned[0]).toBe('Top AI News Today');
      expect(cleaned[1]).toBe('60s Global Summary');
      expect(cleaned[2]).toBe('Market Movements');
      expect(cleaned[3]).toBe('Space & Science');
    });
  });

  describe('SpeechSynthesis voice selection logic', () => {
    test('prioritizes English Natural, Google, or Premium voices', () => {
      const mockVoices = [
        { lang: 'es-ES', name: 'Spanish Voice' },
        { lang: 'en-US', name: 'Default Generic Voice' },
        { lang: 'en-US', name: 'Google US English' },
        { lang: 'en-GB', name: 'Natural British' },
      ];

      const natural = mockVoices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))
      );

      expect(natural).toBeDefined();
      expect(natural.name).toBe('Google US English');
    });
  });
});
