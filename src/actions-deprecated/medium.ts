// ===================================================
// ⚠️ DEPRECATED - DO NOT USE IN STATIC BUILD
// ===================================================
// This file is DEPRECATED for static export builds.
// Use: import mediumData from '@/../public/data/medium.json'
// 
// Data is now fetched at BUILD TIME by:
// scripts/fetch-build-data.ts
// 
// This file remains for backwards compatibility only.
// It will NOT work in static export mode (output: 'export')
// ===================================================

'use server'

// ===================================================
// STATIC DATA FETCHER - No Redis, No Dynamic APIs
// Uses Next.js ISR (Incremental Static Regeneration)
// Safe for static export and S3 deployment
// ===================================================

import Parser from 'rss-parser'

const MEDIUM_USERNAME = '@arcsmo19'
// Note: RSS parser doesn't support Next.js fetch cache
// For true static export, consider fetching at build time
// and storing in a static JSON file

const parser = new Parser()

/**
 * @deprecated Use static data from public/data/medium.json instead
 * This function will NOT work in static export mode
 */
export async function getMediumData() {
  try {
    console.log('Fetching Medium data (static-friendly)')
    
    const feed = await parser.parseURL(
      `https://medium.com/feed/${MEDIUM_USERNAME}`
    )

    const data = {
      items: feed.items.slice(0, 5).map((item: { title?: string; link?: string; pubDate?: string; 'content:encodedSnippet'?: string; contentSnippet?: string; content?: string }) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: item['content:encodedSnippet'] || item.contentSnippet || item.content || 'No description available',
      })),
    }

    return { success: true, data }
  } catch (error) {
    console.error('Medium RSS error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch Medium posts'
    return { success: false, error: message }
  }
}
