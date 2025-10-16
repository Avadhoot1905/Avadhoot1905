'use client'

import { useState } from 'react'
import Link from 'next/link'
import { verifyAdminPassword, getDatabaseStats, getAllSessionsWithMessages, clearAllData, deleteSessionAdmin } from '@/actions/admin'
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

type DatabaseStats = {
  success: boolean
  stats?: {
    totalSessions: number
    totalMessages: number
    averageMessagesPerSession: string | number
  }
  sessionStats?: Array<{
    sessionId: string
    messageCount: number
    createdAt: Date
    updatedAt: Date
  }>
  error?: string
}

type SessionData = {
  success: boolean
  data: Array<{
    id: string
    sessionId: string
    createdAt: Date
    updatedAt: Date
    messageCount: number
    messages: Array<{
      id: string
      role: string
      content: string
      timestamp: Date
    }>
  }>
  error?: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Test results state
  const [testResults, setTestResults] = useState<TestResults>({})
  const [testLoading, setTestLoading] = useState(false)
  
  // Database state
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [sessions, setSessions] = useState<SessionData | null>(null)
  const [dbLoading, setDbLoading] = useState(false)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAuthError('')

    try {
      const isValid = await verifyAdminPassword(password)
      if (isValid) {
        setIsAuthenticated(true)
        loadDatabaseData()
      } else {
        setAuthError('Invalid password')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setAuthError('Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const loadDatabaseData = async () => {
    setDbLoading(true)
    try {
      const [stats, sessionsData] = await Promise.all([
        getDatabaseStats(),
        getAllSessionsWithMessages(),
      ])
      setDbStats(stats)
      setSessions(sessionsData)
    } catch (error) {
      console.error('Error loading database data:', error)
    } finally {
      setDbLoading(false)
    }
  }

  const runTests = async () => {
    setTestLoading(true)
    console.log('🧪 Starting server actions test...')
    const results: TestResults = {}

    try {
      console.log('Testing Redis connection...')
      const redis = await testRedisConnection()
      results.redis = redis
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      results.redis = { success: false, error: message }
    }

    try {
      console.log('Testing GitHub...')
      const github = await getGithubData()
      results.github = github
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      results.github = { success: false, error: message }
    }

    try {
      console.log('Testing LeetCode...')
      const leetcode = await getLeetcodeData()
      results.leetcode = leetcode
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      results.leetcode = { success: false, error: message }
    }

    try {
      console.log('Testing Medium...')
      const medium = await getMediumData()
      results.medium = medium
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      results.medium = { success: false, error: message }
    }

    setTestResults(results)
    setTestLoading(false)
  }

  const handleClearAllData = async () => {
    if (!confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
      return
    }
    
    setDbLoading(true)
    try {
      const result = await clearAllData()
      if (result.success) {
        alert('All data cleared successfully')
        loadDatabaseData()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Clear data error:', error)
      alert('Failed to clear data')
    } finally {
      setDbLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm(`Delete session ${sessionId}?`)) {
      return
    }
    
    setDbLoading(true)
    try {
      const result = await deleteSessionAdmin(sessionId)
      if (result.success) {
        alert(result.message)
        loadDatabaseData()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Delete session error:', error)
      alert('Failed to delete session')
    } finally {
      setDbLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">🔒 Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="Enter admin password"
                required
              />
            </div>
            {authError && (
              <p className="text-red-600 dark:text-red-400 text-sm">{authError}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
          <Link
            href="/"
            className="block text-center mt-4 text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            ← Back to Portfolio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">🔐 Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Database management and system testing
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
          >
            ← Back to Portfolio
          </Link>
        </div>

        {/* Database Statistics */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">📊 Database Overview</h2>
            <div className="flex gap-2">
              <button
                onClick={loadDatabaseData}
                disabled={dbLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50"
              >
                🔄 Refresh
              </button>
              <button
                onClick={handleClearAllData}
                disabled={dbLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-50"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>

          {dbLoading ? (
            <div className="flex items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {dbStats?.stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Total Sessions
                    </h3>
                    <p className="text-3xl font-bold">{dbStats.stats.totalSessions}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Total Messages
                    </h3>
                    <p className="text-3xl font-bold">{dbStats.stats.totalMessages}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Avg Messages/Session
                    </h3>
                    <p className="text-3xl font-bold">{dbStats.stats.averageMessagesPerSession}</p>
                  </div>
                </div>
              )}

              {sessions?.data && sessions.data.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Chat Sessions</h3>
                  {sessions.data.map((session) => (
                    <div
                      key={session.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg mb-2">
                              Session: {session.sessionId}
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p>Messages: {session.messageCount}</p>
                              <p>Created: {new Date(session.createdAt).toLocaleString()}</p>
                              <p>Updated: {new Date(session.updatedAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setExpandedSession(
                                  expandedSession === session.sessionId ? null : session.sessionId
                                )
                              }
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                            >
                              {expandedSession === session.sessionId ? '▲ Hide' : '▼ Show'}
                            </button>
                            <button
                              onClick={() => handleDeleteSession(session.sessionId)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {expandedSession === session.sessionId && (
                        <div className="p-4 space-y-3">
                          {session.messages.map((msg, idx) => (
                            <div
                              key={msg.id}
                              className={`p-3 rounded ${
                                msg.role === 'user'
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                  : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-sm">
                                  {msg.role === 'user' ? '👤 User' : '🤖 Assistant'} (#{idx + 1})
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(msg.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No sessions found</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Server Actions Testing */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">🧪 Server Actions Testing</h2>
            <button
              onClick={runTests}
              disabled={testLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {testLoading ? '⏳ Running Tests...' : '▶️ Run Tests'}
            </button>
          </div>

          {testLoading && (
            <div className="flex items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-lg">Running tests...</span>
            </div>
          )}

          {!testLoading && Object.keys(testResults).length > 0 && (
            <div className="space-y-6">
              {/* Redis Test */}
              {testResults.redis && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-3 flex items-center">
                    {testResults.redis.success ? '✅' : '❌'} Redis Connection
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
                    {JSON.stringify(testResults.redis, null, 2)}
                  </pre>
                </div>
              )}

              {/* GitHub Test */}
              {testResults.github && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-3 flex items-center">
                    {testResults.github.success ? '✅' : '❌'} GitHub Data
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
                    {JSON.stringify(testResults.github, null, 2)}
                  </pre>
                  {testResults.github.data?.user && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Preview:</h4>
                      <p>User: {testResults.github.data.user.name} (@{testResults.github.data.user.login})</p>
                      <p>Repos loaded: {testResults.github.data.repos?.length || 0}</p>
                    </div>
                  )}
                </div>
              )}

              {/* LeetCode Test */}
              {testResults.leetcode && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-3 flex items-center">
                    {testResults.leetcode.success ? '✅' : '❌'} LeetCode Data
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
                    {JSON.stringify(testResults.leetcode, null, 2)}
                  </pre>
                  {testResults.leetcode.data?.stats && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Preview:</h4>
                      <p>Total Solved: {testResults.leetcode.data.stats.totalSolved}</p>
                      <p>Easy: {testResults.leetcode.data.stats.easySolved}</p>
                      <p>Medium: {testResults.leetcode.data.stats.mediumSolved}</p>
                      <p>Hard: {testResults.leetcode.data.stats.hardSolved}</p>
                      <p>Recent Problems: {testResults.leetcode.data.recentProblems?.length || 0}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Medium Test */}
              {testResults.medium && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-3 flex items-center">
                    {testResults.medium.success ? '✅' : '❌'} Medium Data
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
                    {JSON.stringify(testResults.medium, null, 2)}
                  </pre>
                  {testResults.medium.data?.items && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Preview:</h4>
                      <p>Articles loaded: {testResults.medium.data.items.length}</p>
                      {testResults.medium.data.items[0] && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Latest: {testResults.medium.data.items[0].title}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Test Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">📊 Test Summary</h3>
                <ul className="space-y-2">
                  <li>Redis: {testResults.redis?.success ? '✅ Connected' : '❌ Failed'}</li>
                  <li>GitHub: {testResults.github?.success ? '✅ Working' : '❌ Failed'}</li>
                  <li>LeetCode: {testResults.leetcode?.success ? '✅ Working' : '❌ Failed'}</li>
                  <li>Medium: {testResults.medium?.success ? '✅ Working' : '❌ Failed'}</li>
                </ul>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Check browser console for detailed logs
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
