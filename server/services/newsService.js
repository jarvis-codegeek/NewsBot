import Parser from 'rss-parser';
import sanitizeHtml from 'sanitize-html';
import { cache } from './cacheService.js';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  }
});

export const CATEGORIES = {
  all: { name: 'All News', icon: 'globe' },
  ai: { name: 'AI & Tech Innovation', icon: 'cpu' },
  technology: { name: 'Technology', icon: 'laptop' },
  business: { name: 'Business & Finance', icon: 'trend-up' },
  world: { name: 'World & Politics', icon: 'newspaper' },
  science: { name: 'Science & Space', icon: 'atom' },
  health: { name: 'Health & Wellness', icon: 'heartbeat' },
  entertainment: { name: 'Entertainment', icon: 'film-strip' },
};

const FEEDS = {
  all: [
    { name: 'Google News - Top', url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en' },
    { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  ],
  ai: [
    { name: 'Google News - AI', url: 'https://news.google.com/rss/search?q=Artificial+Intelligence+OR+Generative+AI&hl=en-US&gl=US&ceid=US:en' },
    { name: 'TechCrunch - AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
    { name: 'VentureBeat - AI', url: 'https://venturebeat.com/category/ai/feed/' },
  ],
  technology: [
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
    { name: 'Google News - Tech', url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en' },
  ],
  business: [
    { name: 'Google News - Business', url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en' },
    { name: 'CNBC Top News', url: 'https://search.cnbc.com/rs/search/view.html?partnerId=2000&keywords=business&partner=all&sort=date' },
    { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex' },
  ],
  world: [
    { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
    { name: 'Google News - World', url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en' },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  ],
  science: [
    { name: 'Google News - Science', url: 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en' },
    { name: 'ScienceDaily', url: 'https://www.sciencedaily.com/rss/top/science.xml' },
    { name: 'Phys.org', url: 'https://phys.org/rss-feed/' },
  ],
  health: [
    { name: 'Google News - Health', url: 'https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en-US&gl=US&ceid=US:en' },
    { name: 'ScienceDaily - Health', url: 'https://www.sciencedaily.com/rss/top/health.xml' },
  ],
  entertainment: [
    { name: 'Google News - Entertainment', url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en' },
    { name: 'Variety', url: 'https://variety.com/feed/' },
  ],
};

function extractImage(item) {
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image')) {
    return item.enclosure.url;
  }
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
    return item.mediaContent.$.url;
  }
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
    return item.mediaThumbnail.$.url;
  }

  // Search inside description or content for <img>
  const htmlContent = item.contentEncoded || item.content || item.description || '';
  const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1] && !imgMatch[1].includes('google.com/tracker')) {
    return imgMatch[1];
  }

  return null;
}

function cleanText(text) {
  if (!text) return '';
  const cleaned = sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTitle(title) {
  if (!title) return '';
  // Remove trailing source e.g. "Title - BBC News" or "Title | TechCrunch"
  return title.replace(/\s*[-–|]\s*[A-Za-z0-9\s.]+$/, '').trim();
}

function estimateReadingTime(text) {
  const words = text ? text.split(/\s+/).length : 50;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export async function fetchNewsByCategory(category = 'all', limit = 30) {
  const cacheKey = `news_${category}_${limit}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const feedList = FEEDS[category] || FEEDS['all'];
  const allArticles = [];

  const promises = feedList.map(async (feed) => {
    try {
      const parsed = await parser.parseURL(feed.url);
      return (parsed.items || []).map((item) => {
        const rawTitle = item.title || 'Untitled Story';
        const cleanTitle = normalizeTitle(rawTitle);
        const snippet = cleanText(item.contentSnippet || item.contentEncoded || item.content || item.description || '');
        const image = extractImage(item);
        const pubDate = item.isoDate || item.pubDate || new Date().toISOString();

        // Extract clean source
        let source = feed.name.split(' - ')[0];
        if (item.creator) source = item.creator;
        if (rawTitle.includes(' - ') && !item.creator) {
          const parts = rawTitle.split(' - ');
          source = parts[parts.length - 1].trim();
        }

        return {
          id: Buffer.from(item.link || item.guid || rawTitle).toString('base64').substring(0, 24),
          title: cleanTitle,
          originalTitle: rawTitle,
          link: item.link || '#',
          snippet: snippet.slice(0, 280) + (snippet.length > 280 ? '...' : ''),
          fullSnippet: snippet,
          source: source || feed.name,
          category: category === 'all' ? 'top' : category,
          pubDate,
          timestamp: new Date(pubDate).getTime(),
          image,
          readTime: estimateReadingTime(snippet),
        };
      });
    } catch (err) {
      console.warn(`[NewsService] Error fetching feed ${feed.url}:`, err.message);
      return [];
    }
  });

  const results = await Promise.all(promises);
  results.forEach(items => allArticles.push(...items));

  // Deduplicate by title similarity & link
  const seenTitles = new Set();
  const uniqueArticles = [];

  for (const article of allArticles) {
    const key = article.title.toLowerCase().substring(0, 45);
    if (!seenTitles.has(key) && article.title.length > 5) {
      seenTitles.add(key);
      uniqueArticles.push(article);
    }
  }

  // Sort latest first
  uniqueArticles.sort((a, b) => b.timestamp - a.timestamp);
  const finalArticles = uniqueArticles.slice(0, limit);

  // Cache for 4 minutes
  cache.set(cacheKey, finalArticles, 240);

  return finalArticles;
}

export async function searchNews(query, limit = 25) {
  if (!query || query.trim().length === 0) {
    return fetchNewsByCategory('all', limit);
  }

  const cacheKey = `search_${encodeURIComponent(query.toLowerCase())}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const searchFeedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const parsed = await parser.parseURL(searchFeedUrl);
    const articles = (parsed.items || []).map((item) => {
      const rawTitle = item.title || 'Untitled';
      const cleanTitle = normalizeTitle(rawTitle);
      const snippet = cleanText(item.contentSnippet || item.description || '');
      const pubDate = item.isoDate || item.pubDate || new Date().toISOString();

      let source = 'News Source';
      if (rawTitle.includes(' - ')) {
        const parts = rawTitle.split(' - ');
        source = parts[parts.length - 1].trim();
      }

      return {
        id: Buffer.from(item.link || item.guid || rawTitle).toString('base64').substring(0, 24),
        title: cleanTitle,
        originalTitle: rawTitle,
        link: item.link || '#',
        snippet: snippet.slice(0, 280) + (snippet.length > 280 ? '...' : ''),
        fullSnippet: snippet,
        source,
        category: 'search',
        pubDate,
        timestamp: new Date(pubDate).getTime(),
        image: extractImage(item),
        readTime: estimateReadingTime(snippet),
      };
    }).slice(0, limit);

    cache.set(cacheKey, articles, 300);
    return articles;
  } catch (err) {
    console.error('[NewsService] Search error:', err.message);
    // Fallback search over cached top news
    const all = await fetchNewsByCategory('all', 50);
    const qLower = query.toLowerCase();
    return all.filter(a => a.title.toLowerCase().includes(qLower) || a.snippet.toLowerCase().includes(qLower));
  }
}

export async function getTrendingTopics() {
  const cacheKey = 'trending_topics';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const allArticles = await fetchNewsByCategory('all', 40);
  const wordFreq = {};
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'were',
    'will', 'says', 'about', 'after', 'over', 'into', 'what', 'more', 'when',
    'been', 'their', 'which', 'your', 'said', 'they', 'than', 'amid', 'here',
    'news', 'live', 'update', 'updates', 'report', 'first', 'look', 'amidst'
  ]);

  for (const article of allArticles) {
    const words = article.title.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/);
    for (const w of words) {
      const lower = w.toLowerCase();
      if (lower.length > 3 && !stopWords.has(lower) && isNaN(lower)) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    }
  }

  const sortedTopics = Object.entries(wordFreq)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([topic]) => topic);

  const defaultTrending = ['Artificial Intelligence', 'Global Markets', 'Quantum Tech', 'Space Exploration', 'Climate Tech', 'Tech Giants'];
  const finalTopics = sortedTopics.length >= 4 ? sortedTopics : defaultTrending;

  cache.set(cacheKey, finalTopics, 600);
  return finalTopics;
}
