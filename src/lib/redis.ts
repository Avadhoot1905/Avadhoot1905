import { Redis } from '@upstash/redis'

// Check if Redis credentials are available
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('⚠️  Redis credentials not found in .env file!')
  console.warn('   Caching will be disabled and API calls will be made directly.')
  console.warn('   Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env')
}

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

export default redis

/**
 * Cache wrapper function with Redis
 * @param key - Cache key
 * @param ttlSeconds - Time to live in seconds
 * @param fetchFn - Function to fetch data if not in cache
 */
export async function getCachedData<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Check if Redis is configured
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.log(`⚠️  Redis not configured, fetching directly for key: ${key}`)
    return await fetchFn()
  }

  try {
    // Try to get from cache
    const cached = await redis.get<T>(key)
    if (cached) {
      console.log(`✅ Cache HIT for key: ${key}`)
      return cached
    }

    console.log(`❌ Cache MISS for key: ${key} - Fetching fresh data...`)
    // Fetch fresh data
    const freshData = await fetchFn()

    // Store in cache with TTL
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(freshData))
      console.log(`💾 Cached data for key: ${key} (TTL: ${ttlSeconds}s)`)
    } catch (cacheError) {
      console.error(`Failed to cache data for key ${key}:`, cacheError)
      // Continue anyway, we have the fresh data
    }

    return freshData
  } catch (error) {
    console.error(`❌ Redis error for key ${key}:`, error)
    console.log(`⚠️  Falling back to direct fetch for key: ${key}`)
    // Fallback to direct fetch if Redis fails
    return await fetchFn()
  }
}
