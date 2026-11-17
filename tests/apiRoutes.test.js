import newsRoutes from '../server/routes/news.js';
import aiRoutes from '../server/routes/ai.js';
import { cache } from '../server/services/cacheService.js';

function invokeRouter(router, { method = 'GET', url = '/', query = {}, body = {}, headers = {} } = {}) {
  return new Promise((resolve) => {
    const req = {
      method,
      url,
      query,
      body,
      headers,
    };

    const res = {
      statusCode: 200,
      headers: {},
      headersSent: false,
      body: null,
      chunks: [],
      status(code) {
        this.statusCode = code;
        return this;
      },
      setHeader(name, value) {
        this.headers[name.toLowerCase()] = value;
        return this;
      },
      flushHeaders() {
        this.headersSent = true;
      },
      json(data) {
        this.body = data;
        this.headersSent = true;
        resolve({ statusCode: this.statusCode, headers: this.headers, body: this.body });
        return this;
      },
      write(chunk) {
        this.headersSent = true;
        this.chunks.push(chunk);
        return true;
      },
      end(finalChunk) {
        if (finalChunk) this.chunks.push(finalChunk);
        this.headersSent = true;
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body,
          chunks: this.chunks,
          text: this.chunks.join(''),
        });
        return this;
      },
    };

    router.handle(req, res, (err) => {
      if (err) {
        resolve({ statusCode: 500, error: err });
      }
    });
  });
}

describe('API Routes Unit Tests (Jest)', () => {
  beforeEach(() => {
    cache.clear();
  });

  describe('News Routes (/api/news)', () => {
    test('GET /categories returns all 8 categories with id, name, and icon', async () => {
      const response = await invokeRouter(newsRoutes, { method: 'GET', url: '/categories' });
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories).toHaveLength(8);

      const ids = response.body.categories.map((c) => c.id);
      expect(ids).toContain('all');
      expect(ids).toContain('ai');
      expect(ids).toContain('technology');
      expect(ids).toContain('business');
    });

    test('GET / returns articles and metadata from cache', async () => {
      const sampleArticles = [
        { id: '1', title: 'Top News Article', source: 'The Chronicle', timestamp: Date.now() },
      ];
      cache.set('news_all_30', sampleArticles, 300);

      const response = await invokeRouter(newsRoutes, {
        method: 'GET',
        url: '/',
        query: { category: 'all', limit: '30' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.category).toBe('all');
      expect(response.body.count).toBe(1);
      expect(response.body.articles).toEqual(sampleArticles);
      expect(response.body.lastUpdated).toBeDefined();
    });

    test('GET / caps limit to maximum of 60', async () => {
      const longList = Array.from({ length: 70 }, (_, i) => ({
        id: `${i}`,
        title: `Story ${i}`,
        timestamp: Date.now(),
      }));
      cache.set('news_tech_60', longList.slice(0, 60), 300);

      const response = await invokeRouter(newsRoutes, {
        method: 'GET',
        url: '/',
        query: { category: 'tech', limit: '999' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(60);
    });

    test('GET /search returns search results', async () => {
      const searchResults = [
        { id: 's1', title: 'Gemini AI Advances', snippet: 'New capabilities', timestamp: Date.now() },
      ];
      cache.set('search_gemini_25', searchResults, 300);

      const response = await invokeRouter(newsRoutes, {
        method: 'GET',
        url: '/search',
        query: { q: 'gemini', limit: '25' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.query).toBe('gemini');
      expect(response.body.count).toBe(1);
      expect(response.body.articles).toEqual(searchResults);
    });

    test('GET /trending returns list of trending topics', async () => {
      const trending = ['AI', 'Quantum', 'Markets', 'Robotics'];
      cache.set('trending_topics', trending, 600);

      const response = await invokeRouter(newsRoutes, { method: 'GET', url: '/trending' });
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.trending).toEqual(trending);
    });
  });

  describe('AI Routes (/api/ai)', () => {
    test('GET /status returns system AI status', async () => {
      const response = await invokeRouter(aiRoutes, { method: 'GET', url: '/status' });
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.apiKeyConfigured).toBe('boolean');
      expect(response.body.provider).toBeDefined();
    });

    test('POST /summarize returns 400 if title is missing', async () => {
      const response = await invokeRouter(aiRoutes, {
        method: 'POST',
        url: '/summarize',
        body: { snippet: 'Some text without a headline' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Title is required');
    });

    test('POST /summarize returns summary when valid payload provided', async () => {
      const response = await invokeRouter(aiRoutes, {
        method: 'POST',
        url: '/summarize',
        body: {
          title: 'Quantum Computing Landmark',
          snippet: 'Zero electrical resistance observed.',
          source: 'Science Today',
          mode: 'tldr',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.summary).toBeDefined();
      expect(response.body.mode).toBe('tldr');
    });

    test('POST /briefing generates executive daily briefing', async () => {
      const cached = [
        { title: 'Market Rally', source: 'Bloomberg', snippet: 'Indexes close higher' },
      ];
      cache.set('news_all_10', cached, 300);

      const response = await invokeRouter(aiRoutes, {
        method: 'POST',
        url: '/briefing',
        body: { category: 'all' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.briefing).toBeDefined();
      expect(response.body.category).toBe('all');
    });

    test('POST /chat returns 400 if message is empty', async () => {
      const response = await invokeRouter(aiRoutes, {
        method: 'POST',
        url: '/chat',
        body: { message: '   ' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Message is required');
    });

    test('POST /chat in non-streaming mode (stream: false) returns JSON', async () => {
      cache.set('news_all_12', [], 300);

      const response = await invokeRouter(aiRoutes, {
        method: 'POST',
        url: '/chat',
        body: {
          message: 'Hello Assistant',
          stream: false,
          category: 'all',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.response).toBeDefined();
      expect(response.body.provider).toBeDefined();
    }, 10000);

    test('POST /chat in streaming mode (stream: true) sends Server-Sent Events', async () => {
      cache.set('news_all_12', [], 300);

      const response = await invokeRouter(aiRoutes, {
        method: 'POST',
        url: '/chat',
        body: {
          message: 'Hello streaming test',
          stream: true,
          category: 'all',
        },
      });

      expect(response.headers['content-type']).toBe('text/event-stream');
      expect(response.headers['cache-control']).toBe('no-cache');
      expect(response.text).toContain('data: {"token":');
      expect(response.text).toContain('data: {"done":true}');
    }, 10000);
  });

  describe('Health Check API', () => {
    test('returns healthy status and metadata', () => {
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        framework: 'React + TypeScript + Vite + Express',
      };

      expect(healthData.status).toBe('healthy');
      expect(healthData.version).toBe('1.0.0');
      expect(typeof healthData.uptime).toBe('number');
      expect(healthData.timestamp).toBeDefined();
    });
  });
});
