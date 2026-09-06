# Multi-stage Dockerfile for React + TS + Express
FROM node:20-alpine AS builder

WORKDIR /app

# Install client dependencies & build React SPA
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
RUN cd client && npm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install server dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy server code and built React dist
COPY server/ ./server/
COPY --from=builder /app/dist ./dist

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server/index.js"]
