import { NextResponse } from 'next/server'
import { getCachedData } from '@/lib/redis'

const GITHUB_USERNAME = 'Avadhoot1905'
const CACHE_TTL = 3600 // 1 hour in seconds

export async function GET() {
  try {
    const data = await getCachedData(
      'github-profile',
      CACHE_TTL,
      async () => {
        console.log('Fetching fresh GitHub data')
        const [userResponse, reposResponse] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            },
          }),
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            },
          }),
        ])

        if (!userResponse.ok || !reposResponse.ok) {
          throw new Error('GitHub API request failed')
        }

        const user = await userResponse.json()
        const repos = await reposResponse.json()

        return { user, repos }
      }
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' },
      { status: 500 }
    )
  }
}
