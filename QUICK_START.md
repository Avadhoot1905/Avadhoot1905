# 🚀 Portfolio Project - Quick Start Guide

macOS-inspired portfolio website with AI-powered chat functionality.

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your credentials:
# - GEMINI_API_KEY
# - UPSTASH_REDIS_REST_URL
# - UPSTASH_REDIS_REST_TOKEN
# - DATABASE_URL
# - ADMIN_SECRET
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run the Project

You need to run **two servers** for full functionality:

#### Terminal 1: Chat Backend Server

```bash
npx tsx lambda/chat/index.ts
```

This starts the chat API server on `http://localhost:3001`

#### Terminal 2: Next.js Frontend

```bash
npm run dev
```

This starts the frontend on `http://localhost:3000`

### 5. Access the Portfolio

Open [http://localhost:3000](http://localhost:3000) in your browser and click the Messages app to chat with the AI!

## 📁 Project Structure

```
├── src/                    # Next.js frontend
│   ├── app/               # App router
│   ├── components/        # React components
│   └── lib/               # Utilities and API clients
├── lambda/                # Backend services
│   ├── chat/              # Chat API with Gemini AI
│   └── admin/             # Admin dashboard API
├── prisma/                # Database schema
└── public/                # Static assets
```

## 🎭 Features

- **macOS-inspired UI**: Window management, dock, menu bar
- **AI Chat**: Powered by Gemini with personality context
- **Redis Caching**: Fast session management
- **PostgreSQL**: Persistent chat history
- **Static Export**: Can be deployed to any static host
- **Theme Support**: Dark/light mode

## 📚 Documentation

- [Chat Lambda README](lambda/chat/README.md) - Detailed chat server documentation
- [Admin Lambda README](lambda/admin/README.md) - Admin API documentation
- [Lambda Overview](lambda/README.md) - General Lambda architecture

## 🔧 Development Scripts

```bash
# Frontend
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run fetch-data       # Fetch external data (GitHub, Medium, etc.)

# Chat Server
npx tsx lambda/chat/index.ts    # Start chat server

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run database migrations
npx prisma studio        # Open Prisma Studio (DB GUI)
```

## 🌐 Environment Variables

### Frontend (.env.local)
No public API URL variables are needed. Frontend requests use same-origin routes (`/api/chat`, `/api/admin/test`) via CloudFront.

### Backend (.env)
```env
GEMINI_API_KEY=your-key
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
DATABASE_URL=postgresql://user:pass@host/db
ADMIN_SECRET=your-secret
```

## 🚀 Deployment

### Frontend
Deploy to Vercel, Netlify, or any static host:
```bash
npm run build
```

### Backend
- **Option 1**: Deploy to AWS Lambda (see [lambda/chat/README.md](lambda/chat/README.md))
- **Option 2**: Deploy to any Node.js hosting platform
- **Option 3**: Containerize with Docker

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
- **Backend**: Express, Gemini AI, Prisma
- **Database**: PostgreSQL (Neon), Redis (Upstash)
- **Deployment**: Vercel (Frontend), AWS Lambda (Backend)

## 📝 License

MIT

---

Made with 💙 by Avadhoot Mahadik
