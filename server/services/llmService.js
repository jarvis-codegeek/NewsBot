import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFilePath = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const currentDirPath = typeof __dirname !== 'undefined' ? __dirname : path.dirname(currentFilePath);
dotenv.config({ path: path.join(currentDirPath, '../../.env') });

let geminiClient = null;

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  // Use latest high-speed Gemini Flash model
  return geminiClient.getGenerativeModel({ model: 'gemini-3.6-flash' });
}

export function isApiKeyConfigured() {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Summarize an article with various analytical modes
 */
export async function summarizeArticle({ title, snippet, source, link, mode = 'tldr' }) {
  const model = getGeminiModel();

  const promptsByMode = {
    tldr: `Provide an executive TL;DR summary for this news item:
Title: "${title}"
Source: "${source}"
Snippet: "${snippet}"

Format your response in crisp Markdown with:
- **Key Takeaways** (3 bullet points capturing the core facts)
- **Why It Matters** (1 concise paragraph on implications)
- **Sentiment & Impact** (One-line assessment e.g., Bullish / Neutral / Critical)`,

    deep_dive: `Provide a detailed Deep Dive Analysis for this news item:
Title: "${title}"
Source: "${source}"
Snippet: "${snippet}"

Format your response in Markdown with:
### 1. Executive Summary
### 2. Core Development & Key Stakeholders
### 3. Industry & Global Implications
### 4. What to Watch Next`,

    eli5: `Explain this news story like I'm 5 years old (simple, engaging, no jargon):
Title: "${title}"
Snippet: "${snippet}"

Use simple analogies and friendly formatting.`,

    market_impact: `Analyze the business, economic, and market impact of this news:
Title: "${title}"
Snippet: "${snippet}"

Include:
- **Affected Sectors & Companies**
- **Short-term vs Long-term Financial Impact**
- **Risk & Opportunity Factors**`,

    timeline: `Create a brief chronological context or sequence of events around this development:
Title: "${title}"
Snippet: "${snippet}"

List chronological milestone bullets or logical progression leading up to and following this event.`,
  };

  const prompt = promptsByMode[mode] || promptsByMode['tldr'];

  if (model) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return {
        summary: response.text(),
        mode,
        provider: 'Google Gemini',
      };
    } catch (err) {
      console.error('[LLMService] Gemini error, falling back to heuristic engine:', err.message);
    }
  }

  // Smart Heuristic Fallback if no API key is provided
  return generateHeuristicSummary({ title, snippet, source, mode });
}

/**
 * Generate a Daily Executive Briefing from a list of top articles
 */
export async function generateDailyBriefing(articles = []) {
  const model = getGeminiModel();
  const headlines = articles.slice(0, 8).map((a, i) => `${i + 1}. [${a.source}] ${a.title}: ${a.snippet}`).join('\n');

  const prompt = `You are a world-class executive news anchor and intelligence analyst.
Review these top stories today:
${headlines}

Generate an engaging, high-impact "Daily AI News Briefing" in Markdown:
- 🎙️ **Today's Top 3 Highlights** (Quick 1-sentence summaries)
- 🌐 **Global & Tech Currents** (The big picture narrative connecting these stories)
- 💡 **Key Takeaway for Today**

Keep it sharp, insightful, and easy to read or listen to in under 2 minutes.`;

  if (model) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return {
        briefing: response.text(),
        provider: 'Google Gemini',
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.error('[LLMService] Briefing error:', err.message);
    }
  }

  return {
    briefing: `### 🎙️ Daily Intelligence Briefing

**Top Global & Tech Headlines:**
${articles.slice(0, 4).map((a, i) => `- **${a.title}** (${a.source}) — *${a.snippet.slice(0, 120)}...*`).join('\n')}

---
**💡 Today's Big Picture:**
High activity across global technology, markets, and policy developments. Keep an eye on fast-paced innovations and changing regulatory landscapes as leaders adapt.

*(Note: Connect your Gemini API Key in \`.env\` for personalized multi-tier LLM intelligence).*`,
    provider: 'Heuristic Engine',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Conversational streaming Chatbot with News Context
 */
export async function chatWithNews({ message, history = [], currentArticles = [], onToken }) {
  const model = getGeminiModel();

  const newsContext = currentArticles.slice(0, 10).map(a => `- [${a.source}] ${a.title}: ${a.snippet} (${a.pubDate})`).join('\n');

  const systemInstruction = `You are "NewsBot AI", an elite, real-time news analyst and researcher.
You provide accurate, objective, well-structured, and timely intelligence to users about current world, technology, AI, business, and science news.

CURRENT LIVE NEWS CONTEXT:
${newsContext || 'Live headlines available in the system.'}

GUIDELINES:
1. Answer questions clearly using the provided news context and your broad knowledge.
2. Structure answers with bold key points, bulleted takeaways, and clear headings where appropriate.
3. If asked about breaking news or recent events, prioritize the live news context provided above.
4. Maintain a neutral, professional, yet engaging and helpful tone.
5. If the user asks for a recommendation or opinion, offer balanced analytical perspectives.`;

  if (model) {
    try {
      // Create chat or streaming generation
      const formattedHistory = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      }));

      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: `System Context & Guidelines:\n${systemInstruction}` }] },
          { role: 'model', parts: [{ text: 'Understood. I am NewsBot AI, ready to analyze and explain the latest news and answer any inquiries with precision and insight.' }] },
          ...formattedHistory,
        ],
      });

      const result = await chat.sendMessageStream(message);

      let fullText = '';
      for await (const chunk of result.stream) {
        const textChunk = chunk.text();
        fullText += textChunk;
        if (onToken) onToken(textChunk);
      }

      return { text: fullText, provider: 'Google Gemini' };
    } catch (err) {
      console.error('[LLMService] Streaming chat error, falling back:', err.message);
    }
  }

  // Fallback simulated stream for mock/offline mode
  const fallbackResponse = generateMockChatResponse(message, currentArticles);
  const words = fallbackResponse.split(' ');
  let fullText = '';

  for (const word of words) {
    const chunk = word + ' ';
    fullText += chunk;
    if (onToken) {
      onToken(chunk);
      await new Promise(r => setTimeout(r, 20)); // simulated streaming
    }
  }

  return { text: fullText, provider: 'Heuristic Engine' };
}

/**
 * Heuristic summarizer when no LLM API key is connected
 */
function generateHeuristicSummary({ title, snippet, source, mode }) {
  const cleanSnippet = snippet || 'Recent news development reported across multiple media channels.';
  
  if (mode === 'eli5') {
    return {
      summary: `### 🎈 Simple Explanation
Think of this news like this: **"${title}"** is happening right now.
Imagine people at **${source || 'the news desk'}** noticed that something interesting changed: ${cleanSnippet}.

**What it means:**
It's an important update that everyone is talking about because it affects how things will work next!`,
      mode,
      provider: 'Heuristic Engine',
    };
  }

  if (mode === 'market_impact') {
    return {
      summary: `### 📈 Market & Industry Assessment
- **Headline**: ${title}
- **Primary Source**: ${source || 'Global Feeds'}
- **Direct Impact**: ${cleanSnippet}
- **Sectors Affected**: Technology, Consumer, Enterprise Strategy & Global Trade.
- **Investor Sentiment**: Watch for shifts in related sector indices and corporate announcements in the upcoming quarter.`,
      mode,
      provider: 'Heuristic Engine',
    };
  }

  return {
    summary: `### 📌 Executive Takeaways
- **Core Update**: ${title}
- **Context**: ${cleanSnippet}
- **Key Source**: Reported via ${source || 'Verified News Feeds'}

### 🔍 Why It Matters
This development highlights ongoing momentum and shifts across key global and technological landscapes. Analysts and industry observers will be monitoring subsequent official statements and real-world implementation.

*💡 Tip: Add your \`GEMINI_API_KEY\` to your \`.env\` file to enable real-time Gemini AI analysis.*`,
    mode,
    provider: 'Heuristic Engine',
  };
}

function generateMockChatResponse(query, articles = []) {
  const qLower = query.toLowerCase();

  // Check matching articles
  const matched = articles.filter(a =>
    qLower.split(' ').some(word => word.length > 3 && a.title.toLowerCase().includes(word))
  );

  if (matched.length > 0) {
    const top = matched[0];
    return `Based on the latest reports regarding **"${query}"**:

### 📰 Key Development
**${top.title}** *(Source: ${top.source})*
${top.snippet}

### 💡 Quick Analysis
- **Current Status**: Active coverage and developing story.
- **Implications**: Industry watchers and key stakeholders are actively monitoring the situation.
- **Read More**: You can click on the article card in the live feed for the full original piece.

*(Set \`GEMINI_API_KEY\` in your \`.env\` file for full conversational LLM reasoning).*`;
  }

  return `Here is what's happening regarding **"${query}"**:

1. **Top Context**: Several related developments have been tracking across technology and global news feeds today.
2. **Current Overview**: Key topics in focus include market dynamics, technological breakthroughs, and international policy updates.
3. **Live Search**: You can use the search bar above to filter all real-time RSS feeds for specific keywords or organizations.

*(To activate full real-time Gemini 1.5/2.5 Flash intelligence, add \`GEMINI_API_KEY\` in your \`.env\` configuration).*`;
}
