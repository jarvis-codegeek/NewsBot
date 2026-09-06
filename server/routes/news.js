import express from 'express';
import {
  CATEGORIES,
  fetchNewsByCategory,
  searchNews,
  getTrendingTopics,
} from '../services/newsService.js';

const router = express.Router();

// Get list of supported categories
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    categories: Object.entries(CATEGORIES).map(([key, val]) => ({
      id: key,
      name: val.name,
      icon: val.icon,
    })),
  });
});

// Get news by category
router.get('/', async (req, res) => {
  try {
    const category = req.query.category || 'all';
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 60);

    const articles = await fetchNewsByCategory(category, limit);
    res.json({
      success: true,
      category,
      count: articles.length,
      articles,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error in /api/news:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news feed',
    });
  }
});

// Search news
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 50);

    const articles = await searchNews(query, limit);
    res.json({
      success: true,
      query,
      count: articles.length,
      articles,
    });
  } catch (err) {
    console.error('Error in /api/news/search:', err);
    res.status(500).json({
      success: false,
      error: 'Search operation failed',
    });
  }
});

// Get trending search/topic keywords
router.get('/trending', async (req, res) => {
  try {
    const topics = await getTrendingTopics();
    res.json({
      success: true,
      trending: topics,
    });
  } catch (err) {
    console.error('Error in /api/news/trending:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get trending topics',
    });
  }
});

export default router;
