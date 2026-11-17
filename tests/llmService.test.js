import {
  isApiKeyConfigured,
  summarizeArticle,
  generateDailyBriefing,
  chatWithNews,
} from '../server/services/llmService.js';

describe('LLMService Unit Tests (Jest)', () => {
  let savedApiKey;

  beforeEach(() => {
    savedApiKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = '';
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = savedApiKey;
  });

  describe('isApiKeyConfigured()', () => {
    test('returns false when GEMINI_API_KEY is empty', () => {
      process.env.GEMINI_API_KEY = '';
      expect(isApiKeyConfigured()).toBe(false);
    });

    test('returns true when GEMINI_API_KEY is present', () => {
      process.env.GEMINI_API_KEY = 'test-key-123';
      expect(isApiKeyConfigured()).toBe(true);
    });
  });

  describe('summarizeArticle() heuristic engine', () => {
    const sampleArticle = {
      title: 'Revolutionary Quantum Processor Unveiled by Researchers',
      snippet: 'A team has constructed a 1,000-qubit fault-tolerant quantum computer that operates at room temperature.',
      source: 'TechScience Daily',
      link: 'https://example.com/quantum',
    };

    test('summarizes in tldr mode with executive takeaways', async () => {
      const result = await summarizeArticle({ ...sampleArticle, mode: 'tldr' });
      expect(result.summary).toBeDefined();
      expect(result.mode).toBe('tldr');
      expect(result.provider).toBe('Heuristic Engine');
      expect(result.summary).toContain('Executive Takeaways');
      expect(result.summary).toContain(sampleArticle.title);
      expect(result.summary).toContain(sampleArticle.source);
    });

    test('summarizes in eli5 mode with simplified language', async () => {
      const result = await summarizeArticle({ ...sampleArticle, mode: 'eli5' });
      expect(result.summary).toBeDefined();
      expect(result.mode).toBe('eli5');
      expect(result.provider).toBe('Heuristic Engine');
      expect(result.summary).toContain('Simple Explanation');
      expect(result.summary).toContain(sampleArticle.title);
    });

    test('summarizes in market_impact mode with sector analysis', async () => {
      const result = await summarizeArticle({ ...sampleArticle, mode: 'market_impact' });
      expect(result.summary).toBeDefined();
      expect(result.mode).toBe('market_impact');
      expect(result.provider).toBe('Heuristic Engine');
      expect(result.summary).toContain('Market & Industry Assessment');
      expect(result.summary).toContain('Sectors Affected');
    });

    test('handles deep_dive and timeline modes with default heuristic fallback', async () => {
      const resultDeep = await summarizeArticle({ ...sampleArticle, mode: 'deep_dive' });
      expect(resultDeep.summary).toBeDefined();
      expect(resultDeep.mode).toBe('deep_dive');

      const resultTimeline = await summarizeArticle({ ...sampleArticle, mode: 'timeline' });
      expect(resultTimeline.summary).toBeDefined();
      expect(resultTimeline.mode).toBe('timeline');
    });

    test('handles empty snippet and missing source gracefully', async () => {
      const result = await summarizeArticle({
        title: 'Minimal Story',
        snippet: '',
        source: '',
        mode: 'tldr',
      });
      expect(result.summary).toBeDefined();
      expect(result.summary).toContain('Minimal Story');
      expect(result.summary).toContain('Verified News Feeds');
    });
  });

  describe('generateDailyBriefing()', () => {
    test('generates a formatted executive briefing from articles', async () => {
      const articles = [
        { title: 'Global Climate Summit Concludes', source: 'Reuters', snippet: 'World leaders agree on new emission targets.' },
        { title: 'Autonomous EV Fleet Launched', source: 'Automotive News', snippet: 'Self driving taxis deploy across capital.' },
      ];

      const result = await generateDailyBriefing(articles);
      expect(result.briefing).toBeDefined();
      expect(result.provider).toBe('Heuristic Engine');
      expect(result.timestamp).toBeDefined();
      expect(result.briefing).toContain('Daily Intelligence Briefing');
      expect(result.briefing).toContain('Global Climate Summit Concludes');
      expect(result.briefing).toContain('Autonomous EV Fleet Launched');
    });

    test('handles empty article list gracefully', async () => {
      const result = await generateDailyBriefing([]);
      expect(result.briefing).toBeDefined();
      expect(result.provider).toBe('Heuristic Engine');
      expect(result.timestamp).toBeDefined();
      expect(result.briefing).toContain('Daily Intelligence Briefing');
    });
  });

  describe('chatWithNews() conversational assistant', () => {
    const currentArticles = [
      {
        title: 'Semiconductor Foundry Expands Global Manufacturing',
        source: 'Nikkei Asia',
        snippet: 'Investment of 20 billion dollars in new fabrication plant.',
        pubDate: '2026-11-17T08:00:00Z',
      },
      {
        title: 'Mars Rover Discovers Subsurface Ice Formations',
        source: 'NASA Wire',
        snippet: 'Radar scans confirm extensive water ice reservoir.',
        pubDate: '2026-11-17T09:30:00Z',
      },
    ];

    test('matches query keywords to relevant news context', async () => {
      const tokens = [];
      const result = await chatWithNews({
        message: 'What is happening with the semiconductor foundry?',
        currentArticles,
        onToken: (t) => tokens.push(t),
      });

      expect(result.text).toBeDefined();
      expect(result.text).toContain('Semiconductor Foundry Expands Global Manufacturing');
      expect(result.text).toContain('Nikkei Asia');
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens.join('')).toBe(result.text);
      expect(result.provider).toBe('Heuristic Engine');
    }, 10000);

    test('provides structured general overview when no specific articles match', async () => {
      const tokens = [];
      const result = await chatWithNews({
        message: 'Tell me about mysterious ancient relics',
        currentArticles,
        onToken: (t) => tokens.push(t),
      });

      expect(result.text).toBeDefined();
      expect(result.text).toContain("Here is what's happening");
      expect(tokens.length).toBeGreaterThan(0);
      expect(result.provider).toBe('Heuristic Engine');
    }, 10000);

    test('works without onToken callback supplied', async () => {
      const result = await chatWithNews({
        message: 'Hello NewsBot',
        currentArticles: [],
      });
      expect(result.text).toBeDefined();
      expect(result.provider).toBe('Heuristic Engine');
    });
  });
});
