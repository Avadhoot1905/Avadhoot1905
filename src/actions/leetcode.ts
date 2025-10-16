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
        } catch {
          console.error('Failed to parse LeetCode stats:', statsText)
          throw new Error('Invalid JSON from LeetCode stats API')
        }

        // Fetch recent submissions - try multiple APIs
        let recentProblems = []
        
        try {
          // Try alfa-leetcode API first
          console.log('Fetching submissions from alfa-leetcode-api...')
          const submissionsResponse = await fetch(
            `https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/submission?limit=10`,
            { 
              next: { revalidate: CACHE_TTL },
              headers: { 'Content-Type': 'application/json' }
            }
          )
          
          if (submissionsResponse.ok) {
            const submissionsData = await submissionsResponse.json()
            console.log('Submissions response:', submissionsData)
            
            // Handle different response formats
            const submissions = submissionsData.submission || submissionsData.data?.recentSubmissions || []
            
            // Filter for accepted submissions only
            recentProblems = submissions
              .filter((sub: { statusDisplay: string }) => sub.statusDisplay === "Accepted")
              .slice(0, 5)
            
            console.log(`Found ${recentProblems.length} recent accepted submissions`)
          } else {
            console.warn('Alfa API failed, trying alternative...')
            // Try alternative endpoint
            const altResponse = await fetch(
              `https://leetcode-stats-api.herokuapp.com/${LEETCODE_USERNAME}/submission`,
              { next: { revalidate: CACHE_TTL } }
            )
            
            if (altResponse.ok) {
              const altData = await altResponse.json()
              recentProblems = (altData.recentSubmissions || [])
                .filter((sub: { statusDisplay: string }) => sub.statusDisplay === "Accepted")
                .slice(0, 5)
            }
          }
        } catch (error) {
          console.error('Failed to fetch recent submissions:', error)
          // Continue without recent problems
        }

        return {
          stats,
          recentProblems,
        }
      }
    )

    return { success: true, data }
  } catch (error) {
    console.error('LeetCode API error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch LeetCode data'
    return { success: false, error: message }
  }
}
