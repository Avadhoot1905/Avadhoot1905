# Rate Limiting Issue Troubleshooting Guide

## Problem: Still Getting Rate Limited?

If you're still seeing rate limiting errors after implementing Redis caching, follow these steps:

## Step 1: Verify Redis Connection

### Test the Redis Connection:

The pr### Expected Behavior After Fix

### First User Visit:
```
Browser → Server Action → Redis (miss) → GitHub API → Store in Redis → Return to browser
Time: ~500-1000ms
```

### Subsequent User Visits (within TTL):
```
Browser → Server Action → Redis (hit) → Return to browser
Time: ~50-100ms (10x faster!)
```s **Server Actions** instead of API routes, which is more efficient!

**Method 1: Check Terminal Logs**
```bash
# Start your dev server
npm run dev

# Watch the terminal output - you should see:
✅ Cache HIT for key: github-profile
# or
❌ Cache MISS for key: github-profile - Fetching fresh data...
💾 Cached data for key: github-profile (TTL: 3600s)
```

**Method 2: Test in Browser Console**

Open your portfolio, then open browser console and run:
```javascript
// Import and test the server action
import { testRedisConnection } from '@/actions/test-redis'
testRedisConnection().then(console.log)
```

**Expected Terminal Output (Success):**
```
✅ Cache HIT for key: github-profile
✅ Cache HIT for key: leetcode-profile
✅ Cache HIT for key: medium-posts
```

**Error Output (Problem):**
```
⚠️  Redis not configured, fetching directly for key: github-profile
```

## Step 2: Check Environment Variables

### Verify `.env` file exists and has correct values:

```bash
cat .env
```

Should show:
```env
GEMINI_API_KEY=...

# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL="https://moving-dassie-24276.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AV7U..."
```

### Common Issues:

❌ **Problem:** Environment variables not found
```
hasRedisUrl: false
hasRedisToken: false
```
**Solution:** 
- Make sure `.env` file exists in project root
- Restart dev server after creating/editing `.env`
- Use `npm run dev` (not just `next dev`)

❌ **Problem:** Quotes missing or wrong format
```env
# WRONG:
UPSTASH_REDIS_REST_URL=https://...  # Missing quotes
UPSTASH_REDIS_REST_URL='https://...' # Single quotes might cause issues

# CORRECT:
UPSTASH_REDIS_REST_URL="https://..."
```

## Step 3: Restart Development Server

**Important:** Environment variables are loaded at startup!

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 4: Check Server Logs

When you open Safari app, check the terminal logs:

### ✅ Good (Caching Working):
```
✅ Cache HIT for key: github-profile
✅ Cache HIT for key: leetcode-profile
✅ Cache HIT for key: medium-posts
```

### ⚠️  First Visit (Normal):
```
❌ Cache MISS for key: github-profile - Fetching fresh data...
Fetching fresh GitHub data
💾 Cached data for key: github-profile (TTL: 3600s)
```

### ❌ Problem (Redis Not Working):
```
⚠️  Redis not configured, fetching directly for key: github-profile
```
**Solution:** Check Step 2 and restart server

### ❌ Problem (Redis Connection Error):
```
❌ Redis error for key github-profile: ...
⚠️  Falling back to direct fetch for key: github-profile
```
**Solution:** Check Redis credentials in Upstash console

## Step 5: Verify Cache Behavior

### Test Cache Hit:
1. Open Safari app in your portfolio
2. Check terminal - should see "Cache MISS" and fetch data
3. Refresh the page (F5)
4. Check terminal - should now see "Cache HIT" ✅
5. If you see "Cache HIT", caching is working!

### Test Multiple Tabs:
1. Open Safari app in one browser tab
2. Open Safari app in another tab (or incognito)
3. Second tab should be instant (Cache HIT)
4. Check Upstash console - should see minimal API calls

## Step 6: Check Rate Limit Source

### Which API is Rate Limited?

Rate limits can come from different sources:

**GitHub API:**
- Limit: 60 requests/hour (unauthenticated)
- Limit: 5,000 requests/hour (authenticated)
- **Solution:** Add GitHub token (optional, not required with caching)

**LeetCode APIs:**
- `leetcode-stats-api.herokuapp.com` - Can be slow/rate limited
- `alfa-leetcode-api.onrender.com` - Free tier, can be rate limited
- **Solution:** Caching handles this (30-minute TTL)

**Medium RSS via rss2json:**
- Limit: 10,000 requests/day (free tier)
- **Solution:** Caching handles this (2-hour TTL)

### Add GitHub Token (Optional):

If you want higher GitHub limits:

1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. No scopes needed for public data
4. Add to `.env`:

```env
GITHUB_TOKEN="ghp_your_token_here"
```

5. Update `/src/app/api/github/route.ts`:

```typescript
headers: {
  'Accept': 'application/vnd.github.v3+json',
  'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`, // Add this line
},
```

## Step 7: Clear Cache and Test

If you want to force fresh data:

### Option 1: Clear Redis Cache (Upstash Console)
1. Go to https://console.upstash.com/redis
2. Click your database
3. Go to "Data Browser"
4. Delete keys: `github-profile`, `leetcode-profile`, `medium-posts`

### Option 2: Wait for TTL Expiry
- GitHub: 1 hour
- LeetCode: 30 minutes
- Medium: 2 hours

### Option 3: Change TTL for Testing

In API route files, temporarily reduce TTL:

```typescript
const CACHE_TTL = 60 // 1 minute instead of 3600
```

## Step 8: Production Deployment

When deploying to Vercel/Netlify:

1. **Add environment variables in hosting dashboard:**
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `GEMINI_API_KEY`

2. **Deploy**

3. **Test:** Visit your live site and check if caching works

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] `.env` file exists in project root
- [ ] `.env` has `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- [ ] Values have double quotes: `"https://..."`
- [ ] Restarted dev server after adding `.env`
- [ ] Terminal shows Redis connection logs (not warnings)
- [ ] Terminal shows "Cache HIT" on second visit
- [ ] Upstash console shows database is active
- [ ] No Redis connection errors in terminal

If all checked ✅, caching is working and rate limits should be resolved!

## Still Having Issues?

### Check These:

1. **Upstash Database Status:**
   - Login to https://console.upstash.com/redis
   - Check if database is active (not paused/deleted)
   - Verify URL and token match your `.env`

2. **Network/Firewall:**
   - Some corporate networks block Upstash
   - Try on different network
   - Check if VPN is interfering

3. **Package Issues:**
   ```bash
   # Reinstall Redis package
   npm uninstall @upstash/redis
   npm install @upstash/redis
   ```

4. **Check Upstash Logs:**
   - Go to your database in Upstash console
   - Check "Metrics" tab
   - Look for failed requests

## Expected Behavior After Fix

### First User Visit:
```
Browser → /api/github → Redis (miss) → GitHub API → Store in Redis → Return to browser
Time: ~500-1000ms
```

### Subsequent User Visits (within TTL):
```
Browser → /api/github → Redis (hit) → Return to browser
Time: ~50-100ms (10x faster!)
```

### Rate Limit Impact:
```
Before: 100 users = 100 API calls = Rate limited! ❌
After:  100 users = 1 API call (cached for rest) = No rate limit! ✅
```

## Success Indicators

You'll know it's working when:

✅ Terminal shows "Cache HIT" messages  
✅ Page loads instantly on refresh  
✅ Multiple users don't cause rate limits  
✅ Upstash console shows request activity  
✅ Terminal shows "Cache HIT" or "Cache MISS" logs  

🎉 Your portfolio is now production-ready with caching!
