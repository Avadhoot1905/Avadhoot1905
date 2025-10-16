"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { FaChevronLeft, FaChevronRight, FaStar, FaCodeBranch, FaBook } from "react-icons/fa"
import { SiGithub, SiLinkedin, SiLeetcode, SiMedium } from "react-icons/si"
import { getGithubData } from "@/actions/github"
import { getLeetcodeData } from "@/actions/leetcode"
import { getMediumData } from "@/actions/medium"

interface GitHubRepo {
  id: number
  name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
}

interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  bio: string
  public_repos: number
  followers: number
  following: number
  location: string
  company: string
}

interface LeetCodeStats {
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  ranking: number
  contributionPoints?: number
}

interface LeetCodeSubmission {
  title: string
  titleSlug: string
  timestamp: string
  statusDisplay: string
  lang: string
}

interface MediumArticle {
  title: string
  link: string
  pubDate: string
  content: string
}

export function SafariApp() {
  const [activeSafariTab, setActiveSafariTab] = useState<"github" | "linkedin" | "leetcode" | "medium">("github")
  const { theme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)
  
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null)
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [leetcodeStats, setLeetcodeStats] = useState<LeetCodeStats | null>(null)
  const [leetcodeSubmissions, setLeetcodeSubmissions] = useState<LeetCodeSubmission[]>([])
  const [mediumArticles, setMediumArticles] = useState<MediumArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch GitHub data using server action (with Redis caching)
  useEffect(() => {
    if (activeSafariTab === "github" && !githubUser) {
      setLoading(true)
      setError(null)
      console.log('Fetching GitHub data...')
      getGithubData()
        .then(result => {
          console.log('GitHub result:', result)
          if (result.success && result.data) {
            setGithubUser(result.data.user)
            setGithubRepos(result.data.repos)
          } else {
            const errorMsg = result.error || 'Failed to fetch GitHub data'
            console.error("GitHub API error:", errorMsg)
            setError(errorMsg)
          }
        })
        .catch(error => {
          console.error("GitHub API error:", error)
          setError(error.message || 'Unknown error')
        })
        .finally(() => setLoading(false))
    }
  }, [activeSafariTab, githubUser])

  // Fetch LeetCode data using server action (with Redis caching)
  useEffect(() => {
    if (activeSafariTab === "leetcode" && !leetcodeStats) {
      setLoading(true)
      setError(null)
      console.log('Fetching LeetCode data...')
      getLeetcodeData()
        .then(result => {
          console.log('LeetCode result:', result)
          if (result.success && result.data) {
            const stats = result.data.stats
            setLeetcodeStats({
              totalSolved: stats.totalSolved || 0,
              easySolved: stats.easySolved || 0,
              mediumSolved: stats.mediumSolved || 0,
              hardSolved: stats.hardSolved || 0,
              ranking: stats.ranking || 0,
              contributionPoints: stats.contributionPoints || 0
            })
            
            // Set recent problems if available
            console.log('Recent problems data:', result.data.recentProblems)
            if (result.data.recentProblems && result.data.recentProblems.length > 0) {
              const recentSolved = result.data.recentProblems
                .slice(0, 5)
                .map((sub: { title?: string; titleSlug?: string; timestamp?: string; statusDisplay?: string; lang?: string; language?: string }) => ({
                  title: sub.title || sub.titleSlug || 'Unknown Problem',
                  titleSlug: sub.titleSlug || '',
                  timestamp: sub.timestamp || Date.now().toString(),
                  statusDisplay: sub.statusDisplay || 'Accepted',
                  lang: sub.lang || sub.language || 'N/A'
                }))
              console.log('Setting submissions:', recentSolved)
              setLeetcodeSubmissions(recentSolved)
            } else {
              console.log('No recent problems found in response')
              setLeetcodeSubmissions([])
            }
          } else {
            const errorMsg = result.error || 'Failed to fetch LeetCode data'
            console.error("LeetCode API error:", errorMsg)
            setError(errorMsg)
            // Set empty stats so the UI still renders
            setLeetcodeStats({
              totalSolved: 0,
              easySolved: 0,
              mediumSolved: 0,
              hardSolved: 0,
              ranking: 0
            })
          }
        })
        .catch(error => {
          console.error("LeetCode API error:", error)
          setError(error.message || 'Unknown error')
          setLeetcodeStats({
            totalSolved: 0,
            easySolved: 0,
            mediumSolved: 0,
            hardSolved: 0,
            ranking: 0
          })
        })
        .finally(() => setLoading(false))
    }
  }, [activeSafariTab, leetcodeStats])

  // Fetch Medium data using server action (with Redis caching)
  useEffect(() => {
    if (activeSafariTab === "medium" && mediumArticles.length === 0) {
      setLoading(true)
      setError(null)
      console.log('Fetching Medium data...')
      getMediumData()
        .then(result => {
          console.log('Medium result:', result)
          if (result.success && result.data && result.data.items) {
            const articles = result.data.items.map((item: { title?: string; link?: string; pubDate?: string; contentSnippet?: string }) => ({
              title: item.title || '',
              link: item.link || '',
              pubDate: item.pubDate || '',
              content: item.contentSnippet || ""
            }))
            setMediumArticles(articles)
          } else {
            const errorMsg = result.error || 'Failed to fetch Medium posts'
            console.error("Medium API error:", errorMsg)
            setError(errorMsg)
          }
        })
        .catch(error => {
          console.error("Medium API error:", error)
          setError(error.message || 'Unknown error')
        })
        .finally(() => setLoading(false))
    }
  }, [activeSafariTab, mediumArticles.length])

  return (
    <div className="flex h-full flex-col">
      {/* Tab Bar - Always visible with scrolling on mobile */}
      <div className={`flex items-center border-b flex-shrink-0 ${theme === "dark" ? "border-gray-700 bg-gray-800" : "bg-gray-100"}`}>
        <div className={`flex ${isMobile ? 'overflow-x-auto space-x-0.5 p-1 scrollbar-hide' : 'space-x-1 p-2'} w-full`}>
          <button
            onClick={() => setActiveSafariTab("github")}
            className={`flex items-center rounded-t whitespace-nowrap ${
              isMobile ? 'space-x-1 px-2 py-1.5 text-xs flex-shrink-0' : 'space-x-2 px-3 py-1.5 text-sm'
            } ${
              activeSafariTab === "github"
                ? theme === "dark"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-black"
                : theme === "dark"
                ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <SiGithub className={`${theme === "dark" ? "text-white" : "text-gray-800"} ${isMobile ? 'text-sm' : ''}`} />
            <span>GitHub</span>
          </button>
          <button
            onClick={() => setActiveSafariTab("linkedin")}
            className={`flex items-center rounded-t whitespace-nowrap ${
              isMobile ? 'space-x-1 px-2 py-1.5 text-xs flex-shrink-0' : 'space-x-2 px-3 py-1.5 text-sm'
            } ${
              activeSafariTab === "linkedin"
                ? theme === "dark"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-black"
                : theme === "dark"
                ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <SiLinkedin className={`text-blue-500 ${isMobile ? 'text-sm' : ''}`} />
            <span>LinkedIn</span>
          </button>
          <button
            onClick={() => setActiveSafariTab("leetcode")}
            className={`flex items-center rounded-t whitespace-nowrap ${
              isMobile ? 'space-x-1 px-2 py-1.5 text-xs flex-shrink-0' : 'space-x-2 px-3 py-1.5 text-sm'
            } ${
              activeSafariTab === "leetcode"
                ? theme === "dark"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-black"
                : theme === "dark"
                ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <SiLeetcode className={`text-orange-500 ${isMobile ? 'text-sm' : ''}`} />
            <span>LeetCode</span>
          </button>
          <button
            onClick={() => setActiveSafariTab("medium")}
            className={`flex items-center rounded-t whitespace-nowrap ${
              isMobile ? 'space-x-1 px-2 py-1.5 text-xs flex-shrink-0' : 'space-x-2 px-3 py-1.5 text-sm'
            } ${
              activeSafariTab === "medium"
                ? theme === "dark"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-black"
                : theme === "dark"
                ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <SiMedium className={`${theme === "dark" ? "text-white" : "text-gray-800"} ${isMobile ? 'text-sm' : ''}`} />
            <span>Medium</span>
          </button>
        </div>
      </div>

      {/* Address Bar */}
      <div className={`flex items-center border-b p-2 flex-shrink-0 ${theme === "dark" ? "border-gray-700 bg-gray-800" : "bg-gray-100"}`}>
        <div
          className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
        >
          <FaChevronLeft className={theme === "dark" ? "text-gray-300" : "text-gray-500"} />
        </div>
        <div
          className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
        >
          <FaChevronRight className={theme === "dark" ? "text-gray-300" : "text-gray-500"} />
        </div>
        <div
          className={`flex-1 rounded-full px-4 py-1 text-sm ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
        >
          {activeSafariTab === "github" && (
            <a
              href="https://github.com/Avadhoot1905"
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:underline ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
            >
              https://github.com/Avadhoot1905
            </a>
          )}
          {activeSafariTab === "linkedin" && (
            <a
              href="https://www.linkedin.com/in/avadhoot-mahadik-125362295/"
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:underline ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
            >
              https://www.linkedin.com/in/avadhoot-mahadik-125362295/
            </a>
          )}
          {activeSafariTab === "leetcode" && (
            <a
              href="https://leetcode.com/u/arcsmo19/"
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:underline ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
            >
              https://leetcode.com/u/arcsmo19/
            </a>
          )}
          {activeSafariTab === "medium" && (
            <a
              href="https://medium.com/@arcsmo19"
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:underline ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
            >
              https://medium.com/@arcsmo19
            </a>
          )}
        </div>
      </div>

      {/* Content Area - API-based displays */}
      <div className="flex-1 overflow-y-auto">
        {/* Error Display */}
        {error && !loading && (
          <div className="p-6">
            <div className={`p-4 rounded-lg border ${theme === "dark" ? "bg-red-900/20 border-red-700 text-red-400" : "bg-red-50 border-red-300 text-red-700"}`}>
              <p className="font-semibold mb-2">⚠️ Error Loading Data</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  setGithubUser(null)
                  setLeetcodeStats(null)
                  setMediumArticles([])
                }}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* GitHub Tab */}
        {activeSafariTab === "github" && !error && (
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : githubUser ? (
              <>
                {/* Profile Header */}
                <div className="flex items-start space-x-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={githubUser.avatar_url} 
                    alt={githubUser.name}
                    className="w-32 h-32 rounded-full border-4 border-gray-200 dark:border-gray-700"
                  />
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{githubUser.name}</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-3">@{githubUser.login}</p>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">{githubUser.bio}</p>
                    <div className="flex items-center space-x-6 text-sm">
                      <div>
                        <span className="font-semibold">{githubUser.public_repos}</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">repositories</span>
                      </div>
                      <div>
                        <span className="font-semibold">{githubUser.followers}</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">followers</span>
                      </div>
                      <div>
                        <span className="font-semibold">{githubUser.following}</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">following</span>
                      </div>
                    </div>
                    {(githubUser.location || githubUser.company) && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        {githubUser.company && <span>{githubUser.company}</span>}
                        {githubUser.location && <span className="ml-3">📍 {githubUser.location}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Repositories */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Popular Repositories</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {githubRepos.map(repo => (
                      <a
                        key={repo.id}
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-4 rounded-lg border hover:shadow-lg transition-all ${
                          theme === "dark" 
                            ? "bg-gray-800 border-gray-700 hover:border-gray-600" 
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center">
                            <FaBook className="mr-2" />
                            {repo.name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {repo.description || "No description available"}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                          {repo.language && (
                            <span className="flex items-center">
                              <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center">
                            <FaStar className="mr-1" />
                            {repo.stargazers_count}
                          </span>
                          <span className="flex items-center">
                            <FaCodeBranch className="mr-1" />
                            {repo.forks_count}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* View Full Profile Button */}
                <div className="text-center pt-4">
                  <a
                    href="https://github.com/Avadhoot1905"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
                  >
                    <SiGithub />
                    <span>View Full Profile on GitHub</span>
                  </a>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* LinkedIn Tab - Fallback UI */}
        {activeSafariTab === "linkedin" && (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className={`max-w-md text-center space-y-6 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              <div className="w-24 h-24 mx-auto rounded-full bg-blue-600 flex items-center justify-center">
                <SiLinkedin className="text-5xl text-white" />
              </div>
              <h2 className="text-2xl font-bold">LinkedIn Profile</h2>
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                Connect with me on LinkedIn to see my professional experience,
                skills, endorsements, and network.
              </p>
              <a
                href="https://www.linkedin.com/in/avadhoot-mahadik-125362295/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                <SiLinkedin />
                <span>View LinkedIn Profile</span>
              </a>
            </div>
          </div>
        )}

        {/* LeetCode Tab */}
        {activeSafariTab === "leetcode" && !error && (
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : leetcodeStats ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-24 h-24 mx-auto rounded-full bg-orange-500 flex items-center justify-center mb-4">
                    <SiLeetcode className="text-5xl text-white" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">LeetCode Stats</h1>
                  <p className="text-gray-600 dark:text-gray-400">@arcsmo19</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className={`p-6 rounded-lg text-center ${theme === "dark" ? "bg-gray-800" : "bg-white border border-gray-200"}`}>
                    <div className="text-3xl font-bold text-orange-500 mb-2">{leetcodeStats.totalSolved}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Solved</div>
                  </div>
                  <div className={`p-6 rounded-lg text-center ${theme === "dark" ? "bg-gray-800" : "bg-white border border-gray-200"}`}>
                    <div className="text-3xl font-bold text-green-500 mb-2">{leetcodeStats.easySolved}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Easy</div>
                  </div>
                  <div className={`p-6 rounded-lg text-center ${theme === "dark" ? "bg-gray-800" : "bg-white border border-gray-200"}`}>
                    <div className="text-3xl font-bold text-yellow-500 mb-2">{leetcodeStats.mediumSolved}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Medium</div>
                  </div>
                  <div className={`p-6 rounded-lg text-center ${theme === "dark" ? "bg-gray-800" : "bg-white border border-gray-200"}`}>
                    <div className="text-3xl font-bold text-red-500 mb-2">{leetcodeStats.hardSolved}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Hard</div>
                  </div>
                </div>

                {/* Ranking */}
                {leetcodeStats.ranking > 0 && (
                  <div className={`p-6 rounded-lg text-center ${theme === "dark" ? "bg-gray-800" : "bg-white border border-gray-200"}`}>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Global Ranking</div>
                    <div className="text-4xl font-bold text-orange-500">#{leetcodeStats.ranking.toLocaleString()}</div>
                  </div>
                )}

                {/* Recent Submissions */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Recently Solved Problems</h2>
                  {leetcodeSubmissions.length > 0 ? (
                    <div className="space-y-3">
                      {leetcodeSubmissions.map((submission, index) => (
                        <a
                          key={index}
                          href={`https://leetcode.com/problems/${submission.titleSlug}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-4 rounded-lg border hover:shadow-lg transition-all ${
                            theme === "dark" 
                              ? "bg-gray-800 border-gray-700 hover:border-gray-600" 
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1 hover:text-orange-500">
                                {submission.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center text-green-500">
                                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                  {submission.statusDisplay}
                                </span>
                                <span>{submission.lang}</span>
                                <span>
                                  {new Date(parseInt(submission.timestamp) * 1000).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-6 rounded-lg text-center ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                      <p className="text-gray-600 dark:text-gray-400">
                        No recent submissions found. Check back later or view full profile on LeetCode.
                      </p>
                    </div>
                  )}
                </div>

                {/* View Full Profile Button */}
                <div className="text-center pt-4">
                  <a
                    href="https://leetcode.com/u/arcsmo19/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
                  >
                    <SiLeetcode />
                    <span>View Full Profile on LeetCode</span>
                  </a>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">Unable to load LeetCode stats. Please try again later.</p>
              </div>
            )}
          </div>
        )}

        {/* Medium Tab */}
        {activeSafariTab === "medium" && !error && (
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme === "dark" ? "border-white" : "border-black"}`}></div>
              </div>
            ) : mediumArticles.length > 0 ? (
              <>
                <div className="text-center mb-8">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${theme === "dark" ? "bg-white" : "bg-black"}`}>
                    <SiMedium className={`text-5xl ${theme === "dark" ? "text-black" : "text-white"}`} />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Latest Articles</h1>
                  <p className="text-gray-600 dark:text-gray-400">@arcsmo19</p>
                </div>

                {/* Articles List */}
                <div className="space-y-4">
                  {mediumArticles.map((article, index) => (
                    <a
                      key={index}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block p-6 rounded-lg border hover:shadow-lg transition-all ${
                        theme === "dark" 
                          ? "bg-gray-800 border-gray-700 hover:border-gray-600" 
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                        {new Date(article.pubDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <div 
                        className="text-gray-600 dark:text-gray-400 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: article.content.substring(0, 200) + '...' }}
                      />
                    </a>
                  ))}
                </div>

                {/* View Full Blog Button */}
                <div className="text-center pt-4">
                  <a
                    href="https://medium.com/@arcsmo19"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors font-medium text-white ${
                      theme === "dark" 
                        ? "bg-black hover:bg-gray-200 text-black" 
                        : "bg-black hover:bg-gray-800"
                    }`}
                  >
                    <SiMedium />
                    <span>View All Articles on Medium</span>
                  </a>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">No articles found. Check back later!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
