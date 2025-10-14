import { NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function GET() {
  try {
    // Test Redis connection
    const testKey = 'test-connection'
    const testValue = { message: 'Redis is working!', timestamp: Date.now() }
    
    // Try to set a value
    await redis.setex(testKey, 60, JSON.stringify(testValue))
    
    // Try to get it back
    const retrieved = await redis.get(testKey)
    
    // Check all cache keys
    const githubCache = await redis.get('github-profile')
    const leetcodeCache = await redis.get('leetcode-profile')
    const mediumCache = await redis.get('medium-posts')
    
    return NextResponse.json({
      success: true,
      connection: 'Connected to Redis successfully!',
      testData: retrieved,
      existingCaches: {
        github: githubCache ? 'cached' : 'not cached',
        leetcode: leetcodeCache ? 'cached' : 'not cached',
        medium: mediumCache ? 'cached' : 'not cached',
      },
      environment: {
        hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
        hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      }
    })
  } catch (error: any) {
    console.error('Redis connection error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        environment: {
          hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
          hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
        }
      },
      { status: 500 }
    )
  }
}
