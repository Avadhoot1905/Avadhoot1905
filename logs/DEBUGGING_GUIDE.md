# Debugging Server Actions - Quick Guide

## Issue: Nothing Visible in Safari App

If the Safari app shows nothing/blank, follow these debugging steps:

### Step 1: Check Browser Console

Open your portfolio → Safari app → Press F12 → Go to Console tab

**Look for:**
```
Fetching GitHub data...
GitHub result: {success: true, data: {...}}
```

**If you see errors:**
- Note the exact error message
- Check if it's a network error or server action error

### Step 2: Check Terminal/Server Logs

When dev server is running, you should see:

```bash
# Good signs:
✅ Cache HIT for key: github-profile
💾 Cached data for key: github-profile (TTL: 3600s)
Fetching fresh GitHub data

# Bad signs:
⚠️  Redis not configured, fetching directly for key: github-profile
❌ Redis error for key github-profile: ...
Error: Failed to fetch...
```

### Step 3: Test Server Actions Directly

Create a test page: `src/app/test/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getGithubData } from '@/actions/github'
import { getLeetcodeData } from '@/actions/leetcode'
import { getMediumData } from '@/actions/medium'

export default function TestPage() {
  const [results, setResults] = useState<any>({})

  useEffect(() => {
    async function test() {
      console.log('Testing GitHub...')
      const github = await getGithubData()
      console.log('GitHub result:', github)
      
      console.log('Testing LeetCode...')
      const leetcode = await getLeetcodeData()
      console.log('LeetCode result:', leetcode)
      
      console.log('Testing Medium...')
      const medium = await getMediumData()
      console.log('Medium result:', medium)
      
      setResults({ github, leetcode, medium })
    }
    test()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Server Actions Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  )
}
```

Visit: `http://localhost:3000/test`

### Step 4: Check Environment Variables

Verify `.env` file:

```bash
cat .env
```

Should show:
```env
UPSTASH_REDIS_REST_URL="https://moving-dassie-24276.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AV7U..."
```

**If Redis is not showing up in logs:**
```bash
# Restart dev server
# Press Ctrl+C to stop, then:
npm run dev
```

### Step 5: Common Issues & Fixes

#### Issue 1: "Nothing renders"
**Cause:** Data isn't loading or server action failing
**Fix:**
1. Check browser console for errors
2. Check terminal for server errors
3. Try the test page above

#### Issue 2: "Infinite loading spinner"
**Cause:** Server action never resolves
**Fix:**
1. Check network tab (F12 → Network)
2. Look for failed requests
3. Check if external APIs are down

#### Issue 3: "Error: fetch is not defined"
**Cause:** Server action trying to use fetch in wrong context
**Fix:** Already handled in code, but ensure you're using Next.js 13+

#### Issue 4: "Redis not configured warnings"
**Cause:** Environment variables not loaded
**Fix:**
```bash
# Make sure .env exists
ls -la .env

# Restart dev server
npm run dev
```

#### Issue 5: "CORS errors in console"
**Cause:** External APIs blocking requests
**Fix:** Server actions run on server, so CORS shouldn't be an issue. If you see CORS errors, the request is coming from client somehow.

### Step 6: Force Refresh

Clear all cached data:

```typescript
// Add this button to your Safari app temporarily
<button onClick={() => {
  setGithubUser(null)
  setLeetcodeStats(null)
  setMediumArticles([])
  setError(null)
  // Data will reload automatically
}}>
  Force Refresh
</button>
```

### Step 7: Check Network Tab

Open F12 → Network tab → Filter by "Fetch/XHR"

**You should NOT see:**
- `/api/github` requests
- `/api/leetcode` requests  
- `/api/medium` requests

**You should see:**
- Server action calls (may show as POST requests to route)
- Direct API calls from server (visible in terminal, not browser)

### Expected Behavior

#### First Visit:
1. User opens Safari app → GitHub tab
2. Browser console: "Fetching GitHub data..."
3. Terminal: "❌ Cache MISS for key: github-profile"
4. Terminal: "Fetching fresh GitHub data"
5. External API called (GitHub.com)
6. Terminal: "💾 Cached data for key: github-profile"
7. Browser console: "GitHub result: {success: true, ...}"
8. UI renders with data

#### Second Visit:
1. User refreshes or reopens
2. Browser console: "Fetching GitHub data..."
3. Terminal: "✅ Cache HIT for key: github-profile"
4. No external API call!
5. Browser console: "GitHub result: {success: true, ...}"
6. UI renders instantly (from cache)

### Quick Diagnostic

Run this in browser console:

```javascript
// Test if server actions are importable
import { getGithubData } from '@/actions/github'
getGithubData().then(console.log).catch(console.error)
```

### Still Not Working?

1. **Check Next.js version:**
   ```bash
   cat package.json | grep "next"
   ```
   Should be 13+ (you have 15.3.1 ✅)

2. **Rebuild:**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Check if actions folder exists:**
   ```bash
   ls -la src/actions/
   ```
   Should show: github.ts, leetcode.ts, medium.ts

4. **Verify 'use server' directive:**
   ```bash
   head -1 src/actions/github.ts
   ```
   Should show: `'use server'`

### Success Indicators

✅ No console errors  
✅ Terminal shows cache logs  
✅ Data visible in Safari app  
✅ Error message if API fails (not blank screen)  
✅ Loading spinner shows then disappears  

If all checks pass but still blank → Check the test page!
