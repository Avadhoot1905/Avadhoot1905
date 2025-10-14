# Redis Caching Setup

This project uses **Upstash Redis** for server-side caching to prevent API rate limiting issues.

## Why Redis Caching?

- **Shared cache across all users**: One API call serves all visitors
- **Respects API rate limits**: Only refreshes when cache expires
- **Fast response times**: Redis is extremely fast
- **Easy to manage**: Configurable TTL (Time To Live) for each data type

## Setup Instructions

### 1. Create an Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/redis)
2. Sign up or log in
3. Click "Create Database"
4. Choose:
   - **Name**: Any name (e.g., "portfolio-cache")
   - **Type**: Regional (Free tier available)
   - **Region**: Choose closest to your deployment
5. Click "Create"

### 2. Get Your Redis Credentials

After creating the database:
1. Click on your database name
2. Scroll down to "REST API" section
3. Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 3. Add Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Then add your credentials:

```env
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### 4. Restart Development Server

```bash
npm run dev
```

## Cache Configuration

Current TTL (Time To Live) settings:

- **GitHub**: 1 hour (3600 seconds)
- **LeetCode**: 30 minutes (1800 seconds)
- **Medium**: 2 hours (7200 seconds)

You can adjust these in the respective API route files:
- `/src/app/api/github/route.ts`
- `/src/app/api/leetcode/route.ts`
- `/src/app/api/medium/route.ts`

## How It Works

1. User visits your portfolio
2. Safari app requests data from `/api/github`, `/api/leetcode`, or `/api/medium`
3. Backend checks Redis cache:
   - **Cache hit**: Returns cached data instantly
   - **Cache miss**: Fetches from external API, caches it, then returns
4. Cache automatically expires after TTL
5. Next request after expiration fetches fresh data

## Benefits

✅ **No more rate limiting** - Multiple users don't trigger multiple API calls  
✅ **Faster page loads** - Cached data returns in milliseconds  
✅ **Reliable** - Fallback to direct API if Redis fails  
✅ **Free tier** - Upstash offers generous free tier (10K requests/day)  
✅ **Easy monitoring** - View cache stats in Upstash console

## Troubleshooting

### Error: "Redis connection failed"
- Check that environment variables are set correctly
- Verify Redis URL and token in Upstash console
- Make sure `.env.local` file exists

### Data not updating
- Wait for TTL to expire (check cache times above)
- Or manually clear cache in Upstash console
- Or restart dev server

### API still rate limited
- Check if Redis is connected (check console logs)
- Verify cache is being used (should see "Cache hit" logs)
- Consider increasing TTL values

## Production Deployment

When deploying to Vercel/Netlify/etc:

1. Add environment variables in your hosting platform's dashboard
2. Use the same `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Deploy!

That's it! Your portfolio now has enterprise-grade caching. 🚀
