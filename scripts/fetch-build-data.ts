#!/usr/bin/env tsx

/**
 * ===================================================
 * BUILD-TIME DATA FETCHER
 * ===================================================
 * 
 * This script runs ONLY during `npm run build` to fetch
 * external API data and save it as static JSON files.
 * 
 * Why: Next.js static export cannot use server actions or ISR.
 * Solution: Fetch data at build time and embed in static site.
 * 
 * Usage: npm run fetch-data (runs before next build)
 * Output: public/data/*.json files
 * 
 * STATIC BUILD ONLY - NO RUNTIME DEPENDENCIES
 */

import * as fs from 'fs'
import * as path from 'path'
import Parser from 'rss-parser'

const DATA_DIR = path.join(process.cwd(), 'public', 'data')
const GITHUB_USERNAME = 'Avadhoot1905'
const LEETCODE_USERNAME = 'arcsmo19'
const MEDIUM_USERNAME = '@arcsmo19'

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  console.log('✅ Created data directory:', DATA_DIR)
}

/**
 * Fetch GitHub profile and repositories
 */
async function fetchGitHubData() {
  console.log('🔍 Fetching GitHub data...')
  
  try {
    const [userResponse, reposResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      }),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      }),
    ])

    if (!userResponse.ok || !reposResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.status} / ${reposResponse.status}`)
    }

    const user = await userResponse.json()
    const repos = await reposResponse.json()

    const data = { 
      user, 
      repos,
      fetchedAt: new Date().toISOString(),
      success: true 
    }

    const filePath = path.join(DATA_DIR, 'github.json')
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    
    console.log('✅ GitHub data saved:', filePath)
    console.log(`   User: ${user.name} (${user.login})`)
    console.log(`   Repos: ${repos.length}`)
  } catch (error) {
    console.error('❌ GitHub fetch failed:', error)
    
    // Save error state so build doesn't fail
    const errorData = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fetchedAt: new Date().toISOString(),
    }
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'github.json'),
      JSON.stringify(errorData, null, 2)
    )
  }
}

/**
 * Fetch LeetCode stats and submissions
 */
async function fetchLeetCodeData() {
  console.log('🔍 Fetching LeetCode data...')
  
  try {
    // Fetch user stats
    const statsResponse = await fetch(
      `https://leetcode-stats-api.herokuapp.com/${LEETCODE_USERNAME}`
    )
    
    if (!statsResponse.ok) {
      throw new Error(`LeetCode stats API error: ${statsResponse.status}`)
    }

    const statsText = await statsResponse.text()
    let stats
    
    try {
      stats = JSON.parse(statsText)
    } catch {
      throw new Error('Invalid JSON from LeetCode stats API')
    }

    // Fetch recent submissions
    let recentProblems = []
    
    try {
      const submissionsResponse = await fetch(
        `https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/submission?limit=10`,
        { headers: { 'Content-Type': 'application/json' } }
      )
      
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        const submissions = submissionsData.submission || submissionsData.data?.recentSubmissions || []
        
        recentProblems = submissions
          .filter((sub: { statusDisplay: string }) => sub.statusDisplay === "Accepted")
          .slice(0, 5)
        
        console.log(`   Found ${recentProblems.length} recent submissions`)
      }
    } catch (error) {
      console.warn('⚠️  Could not fetch recent submissions:', error)
    }

    const data = {
      stats,
      recentProblems,
      fetchedAt: new Date().toISOString(),
      success: true,
    }

    const filePath = path.join(DATA_DIR, 'leetcode.json')
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    
    console.log('✅ LeetCode data saved:', filePath)
    console.log(`   Total Solved: ${stats.totalSolved || 'N/A'}`)
  } catch (error) {
    console.error('❌ LeetCode fetch failed:', error)
    
    const errorData = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fetchedAt: new Date().toISOString(),
    }
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'leetcode.json'),
      JSON.stringify(errorData, null, 2)
    )
  }
}

/**
 * Fetch Medium blog posts via RSS
 */
async function fetchMediumData() {
  console.log('🔍 Fetching Medium data...')
  
  try {
    const parser = new Parser()
    const feed = await parser.parseURL(
      `https://medium.com/feed/${MEDIUM_USERNAME}`
    )

    const data = {
      items: feed.items.slice(0, 5).map((item: any) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: item['content:encodedSnippet'] || item.contentSnippet || item.content || 'No description available',
      })),
      fetchedAt: new Date().toISOString(),
      success: true,
    }

    const filePath = path.join(DATA_DIR, 'medium.json')
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    
    console.log('✅ Medium data saved:', filePath)
    console.log(`   Posts: ${data.items.length}`)
  } catch (error) {
    console.error('❌ Medium fetch failed:', error)
    
    const errorData = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fetchedAt: new Date().toISOString(),
    }
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'medium.json'),
      JSON.stringify(errorData, null, 2)
    )
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting build-time data fetch...\n')
  
  const startTime = Date.now()
  
  // Fetch all data in parallel for speed
  await Promise.all([
    fetchGitHubData(),
    fetchLeetCodeData(),
    fetchMediumData(),
  ])
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  
  console.log(`\n✨ Build data fetch completed in ${duration}s`)
  console.log(`📁 Data saved to: ${DATA_DIR}`)
  console.log('\n📦 These JSON files will be bundled in the static export.')
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
}

export { fetchGitHubData, fetchLeetCodeData, fetchMediumData }
