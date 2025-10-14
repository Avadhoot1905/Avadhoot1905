'use server'

import { getCachedData } from '@/lib/redis'

const LEETCODE_USERNAME = 'arcsmo19'
const CACHE_TTL = 1800 // 30 minutes in seconds

export async function getLeetcodeData() {
  try {
    const data = await getCachedData(
      'leetcode-profile',
      CACHE_TTL,
      async () => {
        console.log('Fetching fresh LeetCode data')
        
        // Fetch user stats
        const statsResponse = await fetch(
          `https://leetcode-stats-api.herokuapp.com/${LEETCODE_USERNAME}`,
          { next: { revalidate: CACHE_TTL } }
        )
        
        if (!statsResponse.ok) {
          throw new Error('LeetCode stats API request failed')
        }

        const statsText = await statsResponse.text()
        let stats
        
        try {
          stats = JSON.parse(statsText)
        } catch (parseError) {
          console.error('Failed to parse LeetCode stats:', statsText)
          throw new Error('Invalid JSON from LeetCode stats API')
        }

        // Fetch recent submissions
        const submissionsResponse = await fetch(
          `https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/acSubmission?limit=5`,
          { next: { revalidate: CACHE_TTL } }
        )
        
        let recentProblems = []
        
        if (submissionsResponse.ok) {
          try {
            const submissionsData = await submissionsResponse.json()
            recentProblems = submissionsData.submission || []
          } catch (error) {
            console.error('Failed to parse recent submissions:', error)
            // Continue without recent problems
          }
        }

        return {
          stats,
          recentProblems,
        }
      }
    )

    return { success: true, data }
  } catch (error: any) {
    console.error('LeetCode API error:', error)
    return { success: false, error: error.message || 'Failed to fetch LeetCode data' }
  }
}
