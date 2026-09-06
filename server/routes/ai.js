import express from 'express';
import {
  summarizeArticle,
  generateDailyBriefing,
  chatWithNews,
  isApiKeyConfigured,
} from '../services/llmService.js';
import { fetchNewsByCategory } from '../services/newsService.js';

const router = express.Router();

// AI Status check
router.get('/status', (req, res) => {
  res.json({
    success: true,
    apiKeyConfigured: isApiKeyConfigured(),
    provider: process.env.GEMINI_API_KEY ? 'Google Gemini' : 'Mock/Heuristic Engine',
  });
});

// Summarize a single article
router.post('/summarize', async (req, res) => {
  try {
    const { title, snippet, source, link, mode } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required for summarization' });
    }

    const result = await summarizeArticle({
      title,
      snippet: snippet || '',
      source: source || 'News Source',
      link: link || '',
      mode: mode || 'tldr',
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('Error in /api/ai/summarize:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary',
    });
  }
});

// Generate Daily Executive Briefing
router.post('/briefing', async (req, res) => {
  try {
    const category = req.body.category || 'all';
    const articles = await fetchNewsByCategory(category, 10);
    const result = await generateDailyBriefing(articles);

    res.json({
      success: true,
      category,
      ...result,
    });
  } catch (err) {
    console.error('Error in /api/ai/briefing:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate daily briefing',
    });
  }
});

// Conversational Chat with streaming (SSE) support
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], category = 'all', stream = true } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Fetch current top articles for real-time RAG context
    const currentArticles = await fetchNewsByCategory(category, 12);

    if (stream) {
      // Setup Server-Sent Events headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      await chatWithNews({
        message,
        history,
        currentArticles,
        onToken: (token) => {
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        },
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    } else {
      let accumulated = '';
      const result = await chatWithNews({
        message,
        history,
        currentArticles,
        onToken: (token) => {
          accumulated += token;
        },
      });

      return res.json({
        success: true,
        response: accumulated || result.text,
        provider: result.provider,
      });
    }
  } catch (err) {
    console.error('Error in /api/ai/chat:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to process chat message',
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Chat processing failed' })}\n\n`);
      res.end();
    }
  }
});

export default router;
