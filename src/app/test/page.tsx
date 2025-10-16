'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getGithubData } from '@/actions/github'
import { getLeetcodeData } from '@/actions/leetcode'
import { getMediumData } from '@/actions/medium'
import { testRedisConnection } from '@/actions/test-redis'

type TestResults = {
  redis?: { success: boolean; error?: string; [key: string]: unknown }
  github?: { 
    success: boolean
    error?: string
    data?: { 
      user: { name: string; login: string }
      repos: unknown[]
    }
  }
  leetcode?: { 
    success: boolean
    error?: string
    data?: { 
      stats: { totalSolved: number; easySolved: number; mediumSolved: number; hardSolved: number }
      recentProblems?: unknown[]
    }
  }
  medium?: { 
    success: boolean
    error?: string
    data?: { 
      items: { title?: string; link?: string; pubDate?: string; contentSnippet?: string }[]
    }
  }
}

export default function TestPage() {
  const [results, setResults] = useState<TestResults>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function test() {
      console.log('🧪 Starting server actions test...')
      const testResults: TestResults = {}

      try {
        console.log('Testing Redis connection...')
        const redis = await testRedisConnection()
        console.log('Redis result:', redis)
        testResults.redis = redis
      } catch (error) {
        console.error('Redis test error:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        testResults.redis = { success: false, error: message }
      }

      try {
        console.log('Testing GitHub...')
        const github = await getGithubData()
        console.log('GitHub result:', github)
        testResults.github = github
      } catch (error) {
        console.error('GitHub test error:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        testResults.github = { success: false, error: message }
      }

      try {
        console.log('Testing LeetCode...')
        const leetcode = await getLeetcodeData()
        console.log('LeetCode result:', leetcode)
        testResults.leetcode = leetcode
      } catch (error) {
        console.error('LeetCode test error:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        testResults.leetcode = { success: false, error: message }
      }

      try {
        console.log('Testing Medium...')
        const medium = await getMediumData()
        console.log('Medium result:', medium)
        testResults.medium = medium
      } catch (error) {
        console.error('Medium test error:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        testResults.medium = { success: false, error: message }
      }

      console.log('✅ All tests complete')
      setResults(testResults)
      setLoading(false)
    }
    test()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🧪 Server Actions Test Page</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Testing all server actions and Redis connection
        </p>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg">Running tests...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Redis Test */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-3 flex items-center">
                {results.redis?.success ? '✅' : '❌'} Redis Connection
              </h2>
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(results.redis, null, 2)}
              </pre>
            </div>

            {/* GitHub Test */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-3 flex items-center">
                {results.github?.success ? '✅' : '❌'} GitHub Data
              </h2>
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(results.github, null, 2)}
              </pre>
              {results.github?.data?.user && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Preview:</h3>
                  <p>User: {results.github.data.user.name} (@{results.github.data.user.login})</p>
                  <p>Repos loaded: {results.github.data.repos?.length || 0}</p>
                </div>
              )}
            </div>

            {/* LeetCode Test */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-3 flex items-center">
                {results.leetcode?.success ? '✅' : '❌'} LeetCode Data
              </h2>
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(results.leetcode, null, 2)}
              </pre>
              {results.leetcode?.data?.stats && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Preview:</h3>
                  <p>Total Solved: {results.leetcode.data.stats.totalSolved}</p>
                  <p>Easy: {results.leetcode.data.stats.easySolved}</p>
                  <p>Medium: {results.leetcode.data.stats.mediumSolved}</p>
                  <p>Hard: {results.leetcode.data.stats.hardSolved}</p>
                  <p>Recent Problems: {results.leetcode.data.recentProblems?.length || 0}</p>
                </div>
              )}
            </div>

            {/* Medium Test */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-3 flex items-center">
                {results.medium?.success ? '✅' : '❌'} Medium Data
              </h2>
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(results.medium, null, 2)}
              </pre>
              {results.medium?.data?.items && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Preview:</h3>
                  <p>Articles loaded: {results.medium.data.items.length}</p>
                  {results.medium.data.items[0] && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Latest: {results.medium.data.items[0].title}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-3">📊 Test Summary</h2>
              <ul className="space-y-2">
                <li>Redis: {results.redis?.success ? '✅ Connected' : '❌ Failed'}</li>
                <li>GitHub: {results.github?.success ? '✅ Working' : '❌ Failed'}</li>
                <li>LeetCode: {results.leetcode?.success ? '✅ Working' : '❌ Failed'}</li>
                <li>Medium: {results.medium?.success ? '✅ Working' : '❌ Failed'}</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Check browser console and terminal for detailed logs
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setLoading(true)
                  setResults({})
                  window.location.reload()
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                🔄 Rerun Tests
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                ← Back to Portfolio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
