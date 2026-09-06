# 🚀 AI NewsBot — Public Hosting & Deployment Guide

This guide explains step-by-step how to host and deploy your **AI NewsBot (React + TypeScript + Node.js)** online with a public URL so anyone on the web can access and use it.

---

## 🌟 Prerequisites
1. **GitHub Account**: To host your code repository.
2. **Google Gemini API Key (Free Tier Available)**:
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Click **"Get API key"** and create a key.

---

## ⚡ Option 1: Deploy on Render.com (Recommended — 100% Free & Easy)

Render provides free hosting for fullstack web services with automatic HTTPS and Git CI/CD.

### Steps:
1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: AI NewsBot with React + TS frontend & Express backend"
   git remote add origin https://github.com/YOUR_USERNAME/NewsBot.git
   git branch -M main
   git push -u origin main
   ```

2. **Create a Free Web Service on Render**:
   - Go to [render.com](https://render.com) and log in.
   - Click **New +** → **Web Service**.
   - Connect your GitHub account and select your `NewsBot` repository.

3. **Configure the Service**:
   - **Name**: `ai-newsbot`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. **Set Environment Variables**:
   Under the **Environment Variables** tab:
   - `GEMINI_API_KEY` = `your_gemini_api_key_here`
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (or leave default, Render automatically injects `PORT`)

5. **Deploy**:
   - Click **Create Web Service**.
   - Render will build the React + TypeScript frontend, bundle it into `dist/`, and launch the Express backend.
   - You will get a live public URL like: `https://ai-newsbot.onrender.com`

---

## 🚂 Option 2: Deploy on Railway.app

Railway auto-detects the multi-stage Dockerfile or Node.js project.

### Steps:
1. Go to [railway.app](https://railway.app) and sign up with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your `NewsBot` repository.
4. Go to **Variables** and add:
   - `GEMINI_API_KEY`: `your_gemini_api_key_here`
5. Go to **Settings** → **Networking** → Click **Generate Domain**.
6. Your bot will be live at `https://your-project.up.railway.app`!

---

## 🐳 Option 3: Deploy with Docker (Any VPS / Fly.io / DigitalOcean / AWS)

A production-ready multi-stage `Dockerfile` is included in the root directory.

### Build and run locally with Docker:
```bash
docker build -t ai-newsbot .
docker run -p 3000:3000 -e GEMINI_API_KEY="your_api_key" ai-newsbot
```
