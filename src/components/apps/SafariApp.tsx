"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { SiGithub, SiLinkedin, SiLeetcode, SiMedium } from "react-icons/si"

export function SafariApp() {
  const [activeSafariTab, setActiveSafariTab] = useState<"github" | "linkedin" | "leetcode" | "medium">("github")
  const { theme } = useTheme()

  return (
    <div className="flex h-full flex-col">
      {/* Tab Bar */}
      <div className={`flex items-center border-b ${theme === "dark" ? "border-gray-700 bg-gray-800" : "bg-gray-100"}`}>
        <div className="flex space-x-1 p-2">
          <button
            onClick={() => setActiveSafariTab("github")}
            className={`flex items-center space-x-2 rounded-t px-3 py-1.5 text-sm ${
              activeSafariTab === "github"
                ? theme === "dark"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-black"
                : theme === "dark"
                ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <SiGithub />
            <span>GitHub</span>
          </button>
          <button
            onClick={() => setActiveSafariTab("linkedin")}
            className={`flex items-center space-x-2 rounded-t px-3 py-1.5 text-sm ${
              activeSafariTab === "linkedin"
                ? theme === "dark"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-black"
                : theme === "dark"
                ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <SiLinkedin className="text-blue-500" />
            <span>LinkedIn</span>
          </button>
          <button
            onClick={() => setActiveSafariTab("leetcode")}
            className={`flex items-center space-x-2 rounded-t px-3 py-1.5 text-sm ${
              activeSafariTab === "leetcode"
                ? theme === "dark"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-black"
                : theme === "dark"
                ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <SiLeetcode className="text-orange-500" />
            <span>LeetCode</span>
          </button>
          <button
            onClick={() => setActiveSafariTab("medium")}
            className={`flex items-center space-x-2 rounded-t px-3 py-1.5 text-sm ${
              activeSafariTab === "medium"
                ? theme === "dark"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-black"
                : theme === "dark"
                ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <SiMedium />
            <span>Medium</span>
          </button>
        </div>
      </div>

      {/* Address Bar */}
      <div className={`flex items-center border-b p-2 ${theme === "dark" ? "border-gray-700" : ""}`}>
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

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeSafariTab === "github" && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                <SiGithub className="text-4xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Avadhoot1905</h1>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Software Developer
                </p>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                Welcome to my GitHub profile! Here you'll find my open source projects,
                contributions, and various experiments with different technologies.
              </p>
            </div>

            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <h2 className="text-xl font-semibold mb-3">Visit My Profile</h2>
              <a
                href="https://github.com/Avadhoot1905"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
              >
                <SiGithub />
                <span>View on GitHub</span>
              </a>
            </div>
          </div>
        )}

        {activeSafariTab === "linkedin" && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center">
                <SiLinkedin className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Avadhoot Mahadik</h1>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Professional Network
                </p>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <h2 className="text-xl font-semibold mb-3">Professional Profile</h2>
              <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                Connect with me on LinkedIn to see my professional experience,
                skills, endorsements, and network. Let's connect and grow together!
              </p>
            </div>

            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <h2 className="text-xl font-semibold mb-3">Connect With Me</h2>
              <a
                href="https://www.linkedin.com/in/avadhoot-mahadik-125362295/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <SiLinkedin />
                <span>View on LinkedIn</span>
              </a>
            </div>
          </div>
        )}

        {activeSafariTab === "leetcode" && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center">
                <SiLeetcode className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">arcsmo19</h1>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Coding Practice & Challenges
                </p>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <h2 className="text-xl font-semibold mb-3">About My Practice</h2>
              <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                Check out my LeetCode profile to see my problem-solving journey,
                solved challenges, and coding statistics. Continuous learning and improvement!
              </p>
            </div>

            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <h2 className="text-xl font-semibold mb-3">View My Solutions</h2>
              <a
                href="https://leetcode.com/u/arcsmo19/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                <SiLeetcode />
                <span>View on LeetCode</span>
              </a>
            </div>
          </div>
        )}

        {activeSafariTab === "medium" && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-white" : "bg-black"}`}>
                <SiMedium className={`text-4xl ${theme === "dark" ? "text-black" : "text-white"}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">arcsmo19</h1>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Writer & Blogger
                </p>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <h2 className="text-xl font-semibold mb-3">My Blog</h2>
              <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                Follow my Medium blog for insightful articles on technology, programming,
                web development, and my journey as a developer. Sharing knowledge and experiences!
              </p>
            </div>

            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <h2 className="text-xl font-semibold mb-3">Read My Articles</h2>
              <a
                href="https://medium.com/@arcsmo19"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-white ${
                  theme === "dark" 
                    ? "bg-black hover:bg-gray-200 text-black" 
                    : "bg-black hover:bg-gray-800"
                }`}
              >
                <SiMedium />
                <span>View on Medium</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
