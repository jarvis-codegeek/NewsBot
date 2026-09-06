# 🌐 AI NewsBot — React + TypeScript & Node.js Intelligence Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF.svg)](https://vitejs.dev)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](https://nodejs.org)
[![LLM](https://img.shields.io/badge/LLM-Google%20Gemini-orange.svg)](https://aistudio.google.com/)

A real-time AI news radar and conversational intelligence platform built with **React 18, TypeScript, Vite, Node.js, and Express**. Ingests live global news across 8 categories without requiring paid news APIs, generates multi-mode AI intelligence summaries (TL;DR, Deep Dive, ELI5, Market Impact, Timeline), and offers conversational streaming Q&A with text-to-speech audio playback.

---

## ✨ Features

- **⚛️ React + TypeScript + Vite**: Modular component architecture with strict type safety, custom hooks (`useNews`, `useChat`, `useAudio`), and fast Vite HMR.
- **🔴 Real-Time Multi-Source Ingestion**: Aggregates top breaking news across AI, Technology, Business, World Geopolitics, Science & Space, Health, and Entertainment.
- **🧠 Advanced LLM Intelligence**:
  - **3-Bullet TL;DR**: Fast executive takeaways and sentiment rating.
  - **Deep-Dive Analysis**: In-depth breakdown with key stakeholders and outlook.
  - **ELI5**: Simple analogies explaining complex news.
  - **Market & Financial Impact**: Analyzes sectors, corporate reactions, and risks.
  - **Timeline**: Chronological sequencing of developments.
- **💬 Conversational NewsBot**: Chat directly with an AI assistant grounded in today's live breaking news context with real-time Server-Sent Events (SSE) token streaming.
- **🎙️ Web Speech Audio Briefings**: Listen to daily briefings or story analyses hands-free with built-in Text-To-Speech audio player.
- **✨ High-End Modern UI**: Glassmorphism dark/light design system with live animated breaking news ticker, instant search, and responsive layout.
- **🚀 1-Click Public Deployment**: Ready to deploy for free on Render, Railway, or Docker.

---

## 🛠️ Quick Start (Local Setup)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/YOUR_USERNAME/NewsBot.git
cd NewsBot

# Install backend dependencies
npm install

# Install client dependencies & build
npm run build
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your free Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```
> *Get a free API key at [Google AI Studio](https://aistudio.google.com/). If omitted, NewsBot automatically operates in heuristic offline mode.*

### 3. Start Development or Production Server

- **Fullstack Dev Mode (React HMR on 5173 + Express on 3000)**:
  ```bash
  npm run dev
  ```
- **Production Mode (Express serving compiled React bundle)**:
  ```bash
  npm start
  ```
Open **`http://localhost:3000`** in your browser!

---

## 🚀 Public Hosting Guide

Follow the step-by-step instructions in [DEPLOYMENT.md](file:///Users/shashankjoshi/Desktop/NewsBot/DEPLOYMENT.md) to deploy your app online for free on [Render.com](https://render.com) or [Railway.app](https://railway.app).

---

## 📁 Project Architecture

```
NewsBot/
├── client/                     # React 18 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/         # Header, Ticker, NewsGrid, NewsCard, Modals, ChatDrawer
│   │   ├── hooks/              # useNews, useChat, useAudio
│   │   ├── types/              # Article, Category, ChatMessage types
│   │   ├── styles/             # Glassmorphism design system (index.css)
│   │   ├── App.tsx             # Main App Component
│   │   └── main.tsx            # Entrypoint
│   ├── vite.config.ts          # Vite config with backend proxy
│   └── tsconfig.json
├── server/                     # Node.js + Express Backend
│   ├── index.js                # API server & static SPA routing
│   ├── services/
│   │   ├── newsService.js      # Multi-feed RSS ingestion & categorization
│   │   ├── llmService.js       # Google Gemini API & analytical prompt chains
│   │   └── cacheService.js     # In-memory TTL cache
│   └── routes/
│       ├── news.js             # /api/news, /api/news/search, /api/news/trending
│       └── ai.js               # /api/ai/summarize, /api/ai/briefing, /api/ai/chat
├── Dockerfile                  # Multi-stage container configuration
├── DEPLOYMENT.md               # Public hosting instructions
└── package.json                # Unified scripts & dependencies
```
