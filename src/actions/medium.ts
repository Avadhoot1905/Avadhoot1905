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
          items: feed.items.slice(0, 5).map((item: { title?: string; link?: string; pubDate?: string; 'content:encodedSnippet'?: string; contentSnippet?: string; content?: string }) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            contentSnippet: item['content:encodedSnippet'] || item.contentSnippet || item.content || 'No description available',
          })),
        }
      }
    )

    return { success: true, data }
  } catch (error) {
    console.error('Medium RSS error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch Medium posts'
    return { success: false, error: message }
  }
}
