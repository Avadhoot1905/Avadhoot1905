# Hybrid Architecture Deployment Guide

## 📋 Architecture Overview

This Next.js 14 App Router project uses a **hybrid static/dynamic architecture**:

### ✅ Static Parts (S3-Compatible)
- **GitHub Profile & Repos** - ISR revalidation every 60 minutes
- **LeetCode Stats & Submissions** - ISR revalidation every 30 minutes  
- **Medium Blog Posts** - ISR revalidation every 2 hours

**Characteristics:**
- ✅ No Redis caching (uses Next.js fetch cache)
- ✅ No dynamic APIs (`cookies()`, `headers()`)
- ✅ Uses `fetch()` with `next: { revalidate: XXX }`
- ✅ Can be pre-rendered at build time
- ✅ Deployable to S3/CloudFront

### 🔥 Dynamic Parts (Lambda-Required)
- **Gemini AI Chat** - Real-time AI conversation
- **Message Persistence** - Store chat history in Neon (Postgres)
- **Session Management** - Redis-based session caching

**Characteristics:**
- ✅ Marked with `export const dynamic = 'force-dynamic'`
- ✅ Uses Redis (Upstash) for session caching
- ✅ Uses Neon (Postgres) for message persistence
- ✅ Requires Node.js runtime
- ✅ MUST be deployed to AWS Lambda or similar

---

## 🚀 Deployment Options

### Option 1: ISR with CloudFront + Lambda (Recommended)

**Best for:** Production deployments with dynamic chat

```bash
# 1. Build the project
npm run build

# 2. Deploy static assets to S3
# Upload contents of .next/static/ to S3 bucket
aws s3 sync .next/static/ s3://your-bucket/_next/static/ --cache-control "public,max-age=31536000,immutable"

# 3. Deploy server functions to Lambda
# Package .next/standalone/ and deploy to AWS Lambda
# Use adapter like @vercel/aws-lambda or Serverless Framework

# 4. Configure CloudFront
# - S3 origin for /_next/static/*, /assets/*
# - Lambda@Edge or CloudFront Functions for API routes
# - Cache behaviors based on path patterns
```

**Benefits:**
- ✅ Static assets served from S3/CloudFront (fast, cheap)
- ✅ Dynamic chat works seamlessly
- ✅ ISR provides automatic revalidation
- ✅ No code changes needed

**Drawbacks:**
- ❌ Requires Lambda for server actions
- ❌ More complex deployment setup

---

### Option 2: Full Static Export (S3 Only)

**Best for:** Portfolio showcase without chat functionality

**⚠️ Requires Code Changes:**
1. Convert server actions to API routes or client-side fetch
2. Pre-fetch all data at build time
3. Store in static JSON files

```bash
# 1. Uncomment in next.config.ts
# output: 'export'

# 2. Convert server actions (github.ts, leetcode.ts, medium.ts)
# From: 'use server' functions
# To: Static JSON generation or client-side fetch

# 3. Build static site
npm run build

# 4. Deploy /out folder to S3
aws s3 sync out/ s3://your-bucket/ --delete

# 5. Deploy chat separately (if needed)
# Create standalone API for Gemini chat
# Deploy to AWS Lambda + API Gateway
```

**Benefits:**
- ✅ Entire site on S3 (extremely cheap)
- ✅ No server required for static pages
- ✅ Simple deployment

**Drawbacks:**
- ❌ Requires refactoring server actions
- ❌ Chat needs separate deployment
- ❌ No ISR (must rebuild to update)

---

## 🏗️ Current File Structure

### Static Data Fetchers (S3-Ready)
```
src/actions/
├── github.ts      ✅ No Redis, uses Next.js revalidation
├── leetcode.ts    ✅ No Redis, uses Next.js revalidation
└── medium.ts      ✅ No Redis, uses Next.js revalidation
```

### Dynamic Server Actions (Require Lambda)
```
src/actions/
├── gemini.ts      🔥 Dynamic - Redis + Gemini API
└── messages.ts    🔥 Dynamic - Neon (Postgres)
```

### Redis Usage Map
```
lib/redis.ts         🔥 Only used by chat (gemini.ts)
actions/gemini.ts    🔥 Uses Redis for chat sessions
actions/messages.ts  🔥 Uses Neon for persistence
actions/github.ts    ✅ No Redis - static-friendly
actions/leetcode.ts  ✅ No Redis - static-friendly  
actions/medium.ts    ✅ No Redis - static-friendly
```

---

## 🧪 Testing Static Generation

### Test ISR Locally
```bash
# Build the project
npm run build

# Start production server
npm start

# Check generated pages
ls -la .next/server/app/

# Monitor revalidation in logs
tail -f .next/trace
```

### Test Static Export (After Refactoring)
```bash
# 1. Update next.config.ts
# Uncomment: output: 'export'

# 2. Build
npm run build

# 3. Check output
ls -la out/

# 4. Test locally
npx serve out
```

---

## 📊 Performance Characteristics

### Static Pages (GitHub/LeetCode/Medium)
- **First Load:** 0-500ms (CDN cached)
- **Subsequent Loads:** <100ms (Browser cached)
- **Revalidation:** Background, no user impact
- **Cost:** ~$1-5/month (S3 + CloudFront)

### Dynamic Chat (Gemini)
- **Response Time:** 1-3 seconds (Gemini API)
- **Cold Start:** 500-1000ms (Lambda)
- **Warm Start:** 100-200ms (Lambda)
- **Cost:** ~$5-20/month (Lambda + Redis + Neon)

---

## 🔐 Environment Variables

### Required for Static Pages
```env
# None! Static pages use public APIs
```

### Required for Dynamic Chat
```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Neon (Postgres)
DATABASE_URL=your_postgres_url
```

---

## 🎯 Next Steps

### For ISR Deployment (Current)
1. ✅ Code is ready - no changes needed
2. Set up AWS S3 bucket for static assets
3. Set up AWS Lambda for server functions
4. Configure CloudFront distribution
5. Deploy and test

### For Static Export (Future)
1. Convert server actions to static generation:
   ```typescript
   // At build time, fetch and save to JSON
   // In component, import from JSON
   ```
2. Create separate API for chat (Express/Fastify)
3. Deploy API to Lambda + API Gateway
4. Update client to call API directly
5. Enable `output: 'export'` in next.config.ts

---

## 📚 Additional Resources

- [Next.js ISR Documentation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [AWS Lambda for Next.js](https://github.com/serverless-nextjs/serverless-next.js)
- [CloudFront + S3 Setup](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/getting-started-secure-static-website-cloudformation-template.html)

---

## ❓ FAQ

### Q: Can I use `output: 'export'` right now?
**A:** No, not yet. You need to convert server actions to API routes or static JSON first.

### Q: Will the chat work with static export?
**A:** Not directly. You need to deploy the chat API separately and call it from the client.

### Q: How much will this cost on AWS?
**A:** 
- S3 + CloudFront: ~$1-5/month for static assets
- Lambda: ~$5-10/month for chat (depending on usage)
- Redis (Upstash): Free tier available
- Neon (Postgres): Free tier available
- **Total:** ~$5-20/month

### Q: Can I deploy to Vercel instead?
**A:** Yes! Vercel handles ISR and serverless functions automatically. Just `git push` and deploy.

### Q: What if I don't need the chat?
**A:** Remove `actions/gemini.ts`, `actions/messages.ts`, and `components/apps/MessagesApp.tsx`. Then enable `output: 'export'` and deploy /out to S3.

---

**Last Updated:** 2026-02-21
**Architecture Version:** v1.0 (ISR-ready)
