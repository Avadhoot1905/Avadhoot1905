"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  FaChevronLeft,
  FaChevronRight,
  FaLock,
  FaRedoAlt,
  FaShareSquare,
  FaPlus,
  FaExternalLinkAlt,
  FaCompass,
  FaCheck,
} from "react-icons/fa"
import { SiGithub, SiLinkedin, SiLeetcode, SiMedium } from "react-icons/si"
import { DinoGame } from "./DinoGame"
import { GithubProfile } from "./safari/GithubProfile"
import { LinkedinProfile } from "./safari/LinkedinProfile"
import { MediumProfile } from "./safari/MediumProfile"
import { LeetcodeProfile } from "./safari/LeetcodeProfile"

// ===================================================
// STATIC DATA IMPORTS
// Data is fetched at BUILD TIME, not runtime
// See: scripts/fetch-build-data.ts
// ===================================================
import githubData from '@/../public/data/github.json'
import leetcodeData from '@/../public/data/leetcode.json'
import mediumData from '@/../public/data/medium.json'

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

  // Load GitHub data from static JSON (fetched at build time)
  useEffect(() => {
    if (activeSafariTab === "github" && !githubUser) {
      setLoading(true)
      setError(null)

      try {
        const data = githubData as unknown as {
          success: boolean
          user?: GitHubUser
          repos?: GitHubRepo[]
          error?: string
        }

        if (data.success && data.user && data.repos) {
          setGithubUser(data.user)
          setGithubRepos(data.repos)
        } else {
          setError(data.error || 'No GitHub data available')
        }
      } catch (err) {
        console.error("GitHub data error:", err)
        setError('Failed to load GitHub data')
      } finally {
        setLoading(false)
      }
    }
  }, [activeSafariTab, githubUser])

  // Load LeetCode data from static JSON (fetched at build time)
  useEffect(() => {
    if (activeSafariTab === "leetcode" && !leetcodeStats) {
      setLoading(true)
      setError(null)

      try {
        const data = leetcodeData as unknown as {
          success: boolean
          stats?: LeetCodeStats
          recentProblems?: LeetCodeSubmission[]
          error?: string
        }

        if (data.success && data.stats) {
          const stats = data.stats
          setLeetcodeStats({
            totalSolved: stats.totalSolved || 0,
            easySolved: stats.easySolved || 0,
            mediumSolved: stats.mediumSolved || 0,
            hardSolved: stats.hardSolved || 0,
            ranking: stats.ranking || 0,
            contributionPoints: stats.contributionPoints || 0
          })

          // Set recent problems if available
          if (data.recentProblems && data.recentProblems.length > 0) {
            const recentSolved = data.recentProblems
              .slice(0, 5)
              .map((sub: LeetCodeSubmission) => ({
                title: sub.title || sub.titleSlug || 'Unknown Problem',
                titleSlug: sub.titleSlug || '',
                timestamp: sub.timestamp || Date.now().toString(),
                statusDisplay: sub.statusDisplay || 'Accepted',
                lang: sub.lang || 'N/A'
              }))
            setLeetcodeSubmissions(recentSolved)
          } else {
            setLeetcodeSubmissions([])
          }
        } else {
          setError(data.error || 'No LeetCode data available')
          setLeetcodeStats({
            totalSolved: 0,
            easySolved: 0,
            mediumSolved: 0,
            hardSolved: 0,
            ranking: 0
          })
        }
      } catch (err) {
        console.error("LeetCode data error:", err)
        setError('Failed to load LeetCode data')
        setLeetcodeStats({
          totalSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          ranking: 0
        })
      } finally {
        setLoading(false)
      }
    }
  }, [activeSafariTab, leetcodeStats])

  // Load Medium data from static JSON (fetched at build time)
  useEffect(() => {
    if (activeSafariTab === "medium" && mediumArticles.length === 0) {
      setLoading(true)
      setError(null)

      try {
        const data = mediumData as unknown as {
          success: boolean
          items?: MediumArticle[]
          error?: string
        }

        if (data.success && data.items) {
          const articles = data.items.map((item: MediumArticle) => ({
            title: item.title || '',
            link: item.link || '',
            pubDate: item.pubDate || '',
            content: item.content || ""
          }))
          setMediumArticles(articles)
        } else {
          setError((mediumData as { error?: string }).error || 'No Medium data available')
        }
      } catch (err) {
        console.error("Medium data error:", err)
        setError('Failed to load Medium data')
      } finally {
        setLoading(false)
      }
    }
  }, [activeSafariTab, mediumArticles.length])

  const [copiedUrl, setCopiedUrl] = useState(false)
  const [isReloading, setIsReloading] = useState(false)

  const currentTabInfo = {
    github: {
      domain: "github.com",
      path: "/Avadhoot1905",
      url: "https://github.com/Avadhoot1905",
      label: "GitHub Profile",
      icon: SiGithub,
      iconColor: theme === "dark" ? "text-white" : "text-gray-800",
    },
    linkedin: {
      domain: "linkedin.com",
      path: "/in/avadhoot-mahadik/",
      url: "https://www.linkedin.com/in/avadhoot-mahadik/",
      label: "LinkedIn",
      icon: SiLinkedin,
      iconColor: "text-[#0A84FF]",
    },
    leetcode: {
      domain: "leetcode.com",
      path: "/u/arcsmo19/",
      url: "https://leetcode.com/u/arcsmo19/",
      label: "LeetCode",
      icon: SiLeetcode,
      iconColor: "text-[#FF9F0A]",
    },
    medium: {
      domain: "medium.com",
      path: "/@arcsmo19",
      url: "https://medium.com/@arcsmo19",
      label: "Medium Articles",
      icon: SiMedium,
      iconColor: theme === "dark" ? "text-white" : "text-gray-800",
    },
  }[activeSafariTab]

  const handleReload = () => {
    setIsReloading(true)
    setTimeout(() => setIsReloading(false), 600)
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentTabInfo.url)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    }
  }

  const handleOpenExternal = () => {
    window.open(currentTabInfo.url, "_blank", "noopener,noreferrer")
  }

  const isDark = theme === "dark"

  return (
    <div
      className={`flex h-full flex-col select-none font-sans overflow-hidden ${isDark ? "bg-[#1E1E1E] text-[#D4D4D4]" : "bg-[#F5F5F7] text-[#1D1D1F]"
        }`}
    >
      {/* Authentic macOS Safari Window Toolbar & Smart Search Bar */}
      <div
        className={`flex h-13 shrink-0 items-center justify-between border-b px-3 py-2 gap-2 ${isDark
          ? "border-[#2D2D2E] bg-[#323233]"
          : "border-[#D1D1D6] bg-[#F6F6F6]"
          }`}
      >
        {/* Left Controls: Sidebar & History Chevrons */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            type="button"
            className={`p-1.5 rounded-md transition ${isDark
              ? "hover:bg-white/10 text-gray-300"
              : "hover:bg-black/10 text-gray-600"
              }`}
            title="Show Sidebar"
          >
            <FaCompass className="h-4 w-4" />
          </button>

          {/* Navigation Back/Forward Group */}
          <div
            className={`flex items-center rounded-md border p-0.5 ${isDark
              ? "border-white/15 bg-[#252526]"
              : "border-black/15 bg-white/70"
              }`}
          >
            <button
              type="button"
              className={`px-2 py-1 text-xs transition rounded-l ${isDark
                ? "hover:bg-white/10 text-gray-300"
                : "hover:bg-black/5 text-gray-600"
                }`}
              title="Back"
            >
              <FaChevronLeft className="h-3 w-3" />
            </button>
            <div className={`h-3 w-[1px] ${isDark ? "bg-white/10" : "bg-black/10"}`} />
            <button
              type="button"
              className={`px-2 py-1 text-xs transition rounded-r ${isDark
                ? "hover:bg-white/10 text-gray-300"
                : "hover:bg-black/5 text-gray-600"
                }`}
              title="Forward"
            >
              <FaChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Center: macOS Safari Smart Search URL Bar */}
        <div
          className={`flex items-center justify-between max-w-xl w-full h-8 rounded-lg border px-3 transition-all shadow-inner ${isDark
            ? "bg-[#1C1C1E] border-white/15 text-gray-200"
            : "bg-white border-black/15 text-gray-800"
            }`}
        >
          {/* SSL Lock + Domain & Path */}
          <div className="flex items-center space-x-2 min-w-0 flex-1 truncate">
            <FaLock className="h-3 w-3 text-emerald-500 shrink-0" />
            <div className="truncate text-xs sm:text-sm">
              <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {currentTabInfo.domain}
              </span>
              <span className={`truncate ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                {currentTabInfo.path}
              </span>
            </div>
          </div>

          {/* Reload Button inside URL Bar */}
          <button
            type="button"
            onClick={handleReload}
            className={`ml-2 p-1 rounded-full transition ${isDark
              ? "hover:bg-white/10 text-gray-400 hover:text-white"
              : "hover:bg-black/10 text-gray-500 hover:text-black"
              }`}
            title="Reload Page"
          >
            <FaRedoAlt
              className={`h-3 w-3 transition-transform duration-500 ${isReloading ? "animate-spin text-blue-500" : ""
                }`}
            />
          </button>
        </div>

        {/* Right Controls: Share, External Open, New Tab */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className={`p-1.5 rounded-md transition relative ${copiedUrl
              ? "text-emerald-500"
              : isDark
                ? "hover:bg-white/10 text-gray-300"
                : "hover:bg-black/10 text-gray-600"
              }`}
            title={copiedUrl ? "Copied URL!" : "Share URL"}
          >
            {copiedUrl ? <FaCheck className="h-4 w-4" /> : <FaShareSquare className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={handleOpenExternal}
            className={`p-1.5 rounded-md transition ${isDark
              ? "hover:bg-white/10 text-blue-400"
              : "hover:bg-black/10 text-blue-600"
              }`}
            title="Open Live URL in Browser"
          >
            <FaExternalLinkAlt className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            className={`p-1.5 rounded-md transition ${isDark
              ? "hover:bg-white/10 text-gray-300"
              : "hover:bg-black/10 text-gray-600"
              }`}
            title="New Safari Tab"
          >
            <FaPlus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* macOS Safari Favorites / Tab Strip */}
      <div
        className={`flex items-center h-9 shrink-0 border-b px-2 gap-1.5 overflow-x-auto no-scrollbar ${isDark
          ? "border-[#2D2D2E] bg-[#252526]"
          : "border-[#D1D1D6] bg-[#EBEBED]"
          }`}
      >
        {(["github", "linkedin", "leetcode", "medium"] as const).map((tabId) => {
          const isActive = activeSafariTab === tabId
          const tabConfig = {
            github: { label: "GitHub Profile", icon: SiGithub, color: isDark ? "text-white" : "text-gray-800" },
            linkedin: { label: "LinkedIn", icon: SiLinkedin, color: "text-[#0A84FF]" },
            leetcode: { label: "LeetCode", icon: SiLeetcode, color: isDark ? "text-[#FF9F0A]" : "text-amber-600" },
            medium: { label: "Medium Articles", icon: SiMedium, color: isDark ? "text-white" : "text-gray-800" },
          }[tabId]
          const TabIcon = tabConfig.icon

          return (
            <button
              key={tabId}
              type="button"
              onClick={() => setActiveSafariTab(tabId)}
              className={`group shrink-0 flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${isActive
                ? isDark
                  ? "bg-[#3A3A3C] text-white shadow-sm border border-white/10"
                  : "bg-white text-gray-900 shadow-sm border border-black/10"
                : isDark
                  ? "hover:bg-white/5 text-gray-400 hover:text-gray-200"
                  : "hover:bg-black/5 text-gray-600 hover:text-gray-900"
                }`}
            >
              <TabIcon
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover:scale-110 ${tabConfig.color}`}
              />
              <span>{tabConfig.label}</span>
              {isActive && (
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[#0A84FF]" />
              )}
            </button>
          )
        })}
      </div>

      {/* Web Page Viewport Content Area */}
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
          <div className="w-full h-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : githubUser ? (
              <GithubProfile user={githubUser} repos={githubRepos} isDark={isDark} />
            ) : null}
          </div>
        )}

        {/* LinkedIn Tab */}
        {activeSafariTab === "linkedin" && (
          <div className="w-full h-full">
            <LinkedinProfile isDark={isDark} />
          </div>
        )}

        {/* LeetCode Tab */}
        {activeSafariTab === "leetcode" && !error && (
          <div className="w-full h-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : leetcodeStats ? (
              <LeetcodeProfile stats={leetcodeStats} submissions={leetcodeSubmissions} isDark={isDark} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-gray-400">Unable to load LeetCode stats. Please try again later.</p>
              </div>
            )}
          </div>
        )}

        {/* Medium Tab */}
        {activeSafariTab === "medium" && !error && (
          <div className="w-full h-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme === "dark" ? "border-white" : "border-black"}`}></div>
              </div>
            ) : mediumArticles.length > 0 ? (
              <MediumProfile articles={mediumArticles} isDark={isDark} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-gray-400">No articles found. Check back later!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
