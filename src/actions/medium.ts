'use server'

import { getCachedData } from '@/lib/redis'
import Parser from 'rss-parser'

const MEDIUM_USERNAME = '@arcsmo19'
const CACHE_TTL = 7200 // 2 hours in seconds

const parser = new Parser()

export async function getMediumData() {
  try {
    const data = await getCachedData(
      'medium-posts',
      CACHE_TTL,
      async () => {
        console.log('Fetching fresh Medium data')
        const feed = await parser.parseURL(
          `https://medium.com/feed/${MEDIUM_USERNAME}`
        )

        return {
          items: feed.items.slice(0, 5).map((item: any) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            contentSnippet: item.contentSnippet?.slice(0, 150) + '...',
          })),
        }
      }
    )

    return { success: true, data }
  } catch (error: any) {
    console.error('Medium RSS error:', error)
    return { success: false, error: error.message || 'Failed to fetch Medium posts' }
  }
}
