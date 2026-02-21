// ===================================================
// ⚠️ DEPRECATED - DO NOT USE IN STATIC BUILD
// ===================================================
// This file is DEPRECATED for static export builds.
// Use: import githubData from '@/../public/data/github.json'
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

const GITHUB_USERNAME = 'Avadhoot1905'
const REVALIDATE_SECONDS = 3600 // 1 hour - ISR revalidation period

/**
 * @deprecated Use static data from public/data/github.json instead
 * This function will NOT work in static export mode
 */
export async function getGithubData() {
  try {
    console.log('Fetching GitHub data (static-friendly)')
    
    const [userResponse, reposResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
        next: { revalidate: REVALIDATE_SECONDS } // Next.js ISR caching
      }),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
        next: { revalidate: REVALIDATE_SECONDS } // Next.js ISR caching
      }),
    ])

    if (!userResponse.ok || !reposResponse.ok) {
      throw new Error('GitHub API request failed')
    }

    const user = await userResponse.json()
    const repos = await reposResponse.json()
    const data = { user, repos }

    return { success: true, data }
  } catch (error) {
    console.error('GitHub API error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch GitHub data'
    return { success: false, error: message }
  }
}
