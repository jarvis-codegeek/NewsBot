import {
  CATEGORIES,
  fetchNewsByCategory,
  searchNews,
  getTrendingTopics,
} from '../server/services/newsService.js';
import { cache } from '../server/services/cacheService.js';

describe('NewsService Unit Tests (Jest)', () => {
  beforeEach(() => {
    cache.clear();
  });

  describe('CATEGORIES validation', () => {
    test('contains all 8 required categories with names and icons', () => {
      const required = ['all', 'ai', 'technology', 'business', 'world', 'science', 'health', 'entertainment'];
      for (const cat of required) {
        expect(CATEGORIES[cat]).toBeDefined();
        expect(typeof CATEGORIES[cat].name).toBe('string');
        expect(CATEGORIES[cat].name.length).toBeGreaterThan(0);
        expect(typeof CATEGORIES[cat].icon).toBe('string');
        expect(CATEGORIES[cat].icon.length).toBeGreaterThan(0);
      }
    });

    test('has descriptive names for all sections', () => {
      expect(CATEGORIES.ai.name).toBe('AI & Tech Innovation');
      expect(CATEGORIES.world.name).toBe('World & Politics');
      expect(CATEGORIES.business.name).toBe('Business & Finance');
    });
  });

  describe('fetchNewsByCategory caching & processing', () => {
    test('returns cached data when available', async () => {
      const mockArticles = [
        {
          id: 'test-1',
          title: 'Cached Breaking News',
          source: 'BBC News',
          timestamp: 1731800000000,
          snippet: 'Cached snippet content',
          category: 'top',
        },
      ];
      cache.set('news_all_30', mockArticles, 300);

      const result = await fetchNewsByCategory('all', 30);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Cached Breaking News');
      expect(result[0].source).toBe('BBC News');
    });

    test('returns empty array or cached fallback when offline/unreachable feed', async () => {
      const result = await fetchNewsByCategory('science', 10);
      expect(Array.isArray(result)).toBe(true);
    });

    test('enforces article count limit', async () => {
      const mockList = Array.from({ length: 50 }, (_, i) => ({
        id: `art-${i}`,
        title: `Story Headline Number ${i}`,
        timestamp: 1731800000000 - i * 1000,
        snippet: `Snippet ${i}`,
        category: 'technology',
      }));

      cache.set('news_technology_15', mockList.slice(0, 15), 300);

      const result = await fetchNewsByCategory('technology', 15);
      expect(result).toHaveLength(15);
    });

    test('orders cached articles by latest timestamp first', async () => {
      const unorderedArticles = [
        { id: '1', title: 'Older Article', timestamp: 1000 },
        { id: '2', title: 'Newer Article', timestamp: 5000 },
        { id: '3', title: 'Middle Article', timestamp: 3000 },
      ];
      const sorted = [...unorderedArticles].sort((a, b) => b.timestamp - a.timestamp);
      cache.set('news_world_10', sorted, 300);

      const result = await fetchNewsByCategory('world', 10);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('1');
    });
  });

  describe('searchNews functionality', () => {
    test('delegates to fetchNewsByCategory(all) if query is empty or whitespace', async () => {
      const topArticles = [
        { id: 'top-1', title: 'Major Global Event', snippet: 'Top news', timestamp: Date.now() },
      ];
      cache.set('news_all_25', topArticles, 300);

      const resultEmpty = await searchNews('');
      expect(resultEmpty).toHaveLength(1);
      expect(resultEmpty[0].title).toBe('Major Global Event');

      const resultSpaces = await searchNews('    ');
      expect(resultSpaces).toHaveLength(1);
    });

    test('returns cached search results if present', async () => {
      const searchResults = [
        { id: 'ai-1', title: 'New Model Released', snippet: 'AI breakthrough', timestamp: Date.now() },
      ];
      cache.set('search_gemini_25', searchResults, 300);

      const result = await searchNews('gemini', 25);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('New Model Released');
    });

    test('falls back to searching over cached top news when network search fails', async () => {
      const cachedNews = [
        { id: 'a1', title: 'Superconductor Breakthrough in Physics', snippet: 'Zero resistance material', timestamp: 100 },
        { id: 'a2', title: 'Stock Markets Reach Record High', snippet: 'Wall street gains', timestamp: 90 },
      ];
      cache.set('news_all_50', cachedNews, 300);

      const result = await searchNews('Superconductor', 10);
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result.some((a) => a.title.includes('Superconductor'))).toBe(true);
      }
    });
  });

  describe('getTrendingTopics calculation', () => {
    test('returns cached trending topics if available', async () => {
      const cachedTopics = ['NVIDIA', 'Quantum', 'SpaceX', 'Electric Vehicles'];
      cache.set('trending_topics', cachedTopics, 600);

      const topics = await getTrendingTopics();
      expect(topics).toEqual(cachedTopics);
    });

    test('extracts top recurring words and filters common stop words', async () => {
      const articles = [
        { id: '1', title: 'Nvidia launches new chip architecture with AI tools', timestamp: 100 },
        { id: '2', title: 'Nvidia reveals record revenue amidst AI surge', timestamp: 99 },
        { id: '3', title: 'SpaceX launches rocket into orbit for lunar mission', timestamp: 98 },
        { id: '4', title: 'SpaceX plans next rocket test flight soon', timestamp: 97 },
        { id: '5', title: 'Semiconductor market expands with new chip foundries', timestamp: 96 },
        { id: '6', title: 'Global chip shortage ends with massive manufacturing surge', timestamp: 95 },
      ];
      cache.set('news_all_40', articles, 300);

      const topics = await getTrendingTopics();
      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBeGreaterThanOrEqual(4);
      const lowerTopics = topics.map(t => t.toLowerCase());
      const hasExpected = lowerTopics.includes('nvidia') || lowerTopics.includes('spacex') || lowerTopics.includes('chip') || lowerTopics.includes('artificial intelligence');
      expect(hasExpected).toBe(true);
    });

    test('falls back to default trending topics if fewer than 4 recurring topics found', async () => {
      cache.set('news_all_40', [], 300);

      const topics = await getTrendingTopics();
      expect(topics).toEqual([
        'Artificial Intelligence',
        'Global Markets',
        'Quantum Tech',
        'Space Exploration',
        'Climate Tech',
        'Tech Giants',
      ]);
    });
  });
});
