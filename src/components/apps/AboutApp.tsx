"use client"

import React, { useState } from "react"
import { useTheme } from "next-themes"
import {
  FaUser,
  FaCommentDots,
  FaTerminal,
  FaEnvelope,
  FaGlobe,
  FaGithub,
  FaMapMarkerAlt,
  FaShareAlt,
  FaSearch,
  FaBuilding,
  FaGraduationCap,
  FaCheck,
} from "react-icons/fa"

type AboutAppProps = {
  onOpenApp?: (appId: string, params?: { filter?: string; command?: string }) => void
}

export function AboutApp({ onOpenApp }: AboutAppProps = {}) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [selectedContact, setSelectedContact] = useState<"me" | "ai" | "terminal">("me")
  const [copiedEmail, setCopiedEmail] = useState(false)

  const handleMessagesClick = () => {
    if (onOpenApp) {
      onOpenApp("messages")
    }
  }

  const handleContactClick = () => {
    if (onOpenApp) {
      onOpenApp("terminal", { command: "contact" })
    }
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("arcsmo19@gmail.com")
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  return (
    <div
      className={`flex h-full select-none font-sans overflow-hidden ${isDark ? "bg-[#1E1E1E] text-[#D4D4D4]" : "bg-[#F5F5F7] text-[#1D1D1F]"
        }`}
    >
      {/* Left Sidebar: macOS Contacts Directory */}
      <div
        className={`w-56 shrink-0 border-r flex flex-col justify-between ${isDark
          ? "border-[#2D2D2D] bg-[#1A1A1A]"
          : "border-[#E5E5E5] bg-[#EBEBED]"
          }`}
      >
        <div>
          {/* Contacts Search Bar */}
          <div className="p-2.5 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
              <input
                type="text"
                readOnly
                value="Avadhoot Ganesh Mahadik"
                className={`w-full rounded-md pl-7 pr-2 py-1 text-xs outline-none border ${isDark
                  ? "bg-[#252526] border-[#383838] text-gray-300"
                  : "bg-white border-gray-300 text-gray-800"
                  }`}
              />
            </div>
          </div>

          {/* Directory Groups */}
          <div className="p-2 space-y-3">
            {/* My Card Section */}
            <div>
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                My Card
              </div>
              <button
                type="button"
                onClick={() => setSelectedContact("me")}
                className={`w-full flex items-center justify-between rounded-md px-2.5 py-2 text-left transition ${selectedContact === "me"
                  ? "bg-[#0A84FF] text-white font-medium shadow-sm"
                  : isDark
                    ? "hover:bg-white/5 text-gray-300"
                    : "hover:bg-black/5 text-gray-800"
                  }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <img
                    src="/favicon.ico"
                    alt="Avadhoot"
                    className="h-6 w-6 rounded-full object-cover shrink-0 border border-white/20"
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate">
                      Avadhoot G. Mahadik
                    </div>
                    <div
                      className={`text-[10px] truncate ${selectedContact === "me"
                        ? "text-blue-100"
                        : "text-gray-400"
                        }`}
                    >
                      me • Systems Architect
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Interactive Shortcuts */}
            <div>
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Contact Shortcuts
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={handleMessagesClick}
                  className={`w-full flex items-center space-x-2.5 rounded-md px-2.5 py-2 text-left transition ${isDark
                    ? "hover:bg-white/5 text-gray-300"
                    : "hover:bg-black/5 text-gray-800"
                    }`}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-white text-xs">
                    <FaCommentDots />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium truncate">
                      AI Assistant Chat
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      Talk to me (AI)
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleContactClick}
                  className={`w-full flex items-center space-x-2.5 rounded-md px-2.5 py-2 text-left transition ${isDark
                    ? "hover:bg-white/5 text-gray-300"
                    : "hover:bg-black/5 text-gray-800"
                    }`}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-700 text-white text-xs">
                    <FaTerminal />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium truncate">
                      Terminal Contact
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      CLI Contact Form
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div
          className={`border-t p-3 text-[11px] flex items-center justify-between ${isDark
            ? "border-[#2D2D2D] text-gray-400"
            : "border-[#E5E5E5] text-gray-500"
            }`}
        >
          <span>1 Card</span>
          <span className="text-blue-500 font-medium">macOS Contacts</span>
        </div>
      </div>

      {/* Right Pane: Authentic macOS Contact Card Details */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header Block */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div className="relative shrink-0">
              <img
                src="/favicon.ico"
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-white dark:border-gray-700"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                Avadhoot Ganesh Mahadik
              </h1>
              <p
                className={`text-sm font-medium mt-0.5 ${isDark ? "text-gray-300" : "text-gray-600"
                  }`}
              >
                Systems Architect • Computer Science Student
              </p>

              {/* macOS Contact Action Buttons Bar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
                {/* Message / AI button */}
                <button
                  type="button"
                  onClick={handleMessagesClick}
                  className="group flex flex-col items-center space-y-1 transition transform hover:scale-105"
                  title="Talk to me (AI Assistant)"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#30D158] text-white shadow-md group-hover:bg-green-600 transition">
                    <FaCommentDots className="text-sm" />
                  </div>
                  <span className="text-[11px] font-medium text-foreground">
                    message
                  </span>
                </button>

                {/* Terminal / Contact button */}
                <button
                  type="button"
                  onClick={handleContactClick}
                  className="group flex flex-col items-center space-y-1 transition transform hover:scale-105"
                  title="Open Terminal Contact"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A84FF] text-white shadow-md group-hover:bg-blue-600 transition">
                    <FaTerminal className="text-sm" />
                  </div>
                  <span className="text-[11px] font-medium text-foreground">
                    terminal
                  </span>
                </button>

                {/* Email Copy button */}
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="group flex flex-col items-center space-y-1 transition transform hover:scale-105"
                  title="Copy Email"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md transition ${copiedEmail
                      ? "bg-emerald-600 text-white"
                      : "bg-[#BF5AF2] text-white group-hover:bg-purple-600"
                      }`}
                  >
                    {copiedEmail ? (
                      <FaCheck className="text-sm" />
                    ) : (
                      <FaEnvelope className="text-sm" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-foreground">
                    {copiedEmail ? "copied" : "email"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Fields & Bio (macOS Address Book Rows) */}
          <div className="py-6 space-y-6">
            {/* BIO / ABOUT ME SECTION */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
              <div className="w-24 shrink-0 sm:text-right text-xs font-bold uppercase tracking-wider text-[#0A84FF] pt-1">
                about
              </div>
              <div className="flex-1 space-y-3 text-sm leading-relaxed">
                <p className={isDark ? "text-gray-200" : "text-gray-800"}>
                  I&apos;m a Computer Science student passionate about backend engineering
                  and system architecture. I&apos;m fascinated by how well-designed
                  systems scale, evolve, and remain maintainable over time. I enjoy
                  working on the invisible parts of software — APIs, data models,
                  infrastructure decisions, and the architectural tradeoffs that make or
                  break a system.
                </p>
                <p className={isDark ? "text-gray-200" : "text-gray-800"}>
                  I&apos;m especially curious about serverless systems, distributed
                  components, and designing clean interfaces between services. Beyond
                  writing code, I focus on understanding why solutions work — from
                  database behavior and ORM abstractions to deployment pipelines and
                  cloud networking. I find the most interesting problems lie in
                  balancing simplicity with scalability.
                </p>
                <p className={isDark ? "text-gray-200" : "text-gray-800"}>
                  Currently, I&apos;m strengthening my backend fundamentals, deepening
                  my understanding of production systems, and building projects that
                  prioritize clarity, reliability, and thoughtful design. I&apos;m open
                  to collaborating on backend systems, architecture discussions, and
                  implementations that go beyond surface-level functionality.
                </p>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-800" />

            {/* WORK ROW */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-start">
              <div className="w-24 shrink-0 sm:text-right text-xs font-bold uppercase tracking-wider text-[#0A84FF] pt-0.5">
                work
              </div>
              <div className="flex-1 text-sm">
                <div className="font-semibold text-foreground">
                  Systems Architect & Backend Engineering
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Computer Science Student • Scalable Systems & APIs
                </div>
              </div>
            </div>

            {/* EDUCATION / INSTITUTION ROW */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-start">
              <div className="w-24 shrink-0 sm:text-right text-xs font-bold uppercase tracking-wider text-[#0A84FF] pt-0.5">
                education
              </div>
              <div className="flex-1 text-sm">
                <div className="font-semibold text-foreground">
                  Vellore Institute of Technology (VIT)
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Computer Science & Engineering
                </div>
              </div>
            </div>

            {/* HOME PAGE / PORTFOLIO ROW */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center">
              <div className="w-24 shrink-0 sm:text-right text-xs font-bold uppercase tracking-wider text-[#0A84FF]">
                home page
              </div>
              <div className="flex-1 text-sm">
                <a
                  href="https://avadhootgm.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0A84FF] hover:underline font-medium inline-flex items-center gap-1.5"
                >
                  <span>https://avadhootgm.in</span>
                  <FaGlobe className="text-xs" />
                </a>
              </div>
            </div>

            {/* GITHUB ROW */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center">
              <div className="w-24 shrink-0 sm:text-right text-xs font-bold uppercase tracking-wider text-[#0A84FF]">
                github
              </div>
              <div className="flex-1 text-sm">
                <a
                  href="https://github.com/Avadhoot1905"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0A84FF] hover:underline font-medium inline-flex items-center gap-1.5"
                >
                  <span>https://github.com/Avadhoot1905</span>
                  <FaGithub className="text-xs" />
                </a>
              </div>
            </div>

            {/* LOCATION ROW */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-start">
              <div className="w-24 shrink-0 sm:text-right text-xs font-bold uppercase tracking-wider text-[#0A84FF] pt-0.5">
                location
              </div>
              <div className="flex-1 text-sm font-medium text-foreground">
                India (Bangalore / Vellore)
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-800" />

            {/* macOS NOTES BOX */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
              <div className="w-24 shrink-0 sm:text-right text-xs font-bold uppercase tracking-wider text-[#0A84FF] pt-1">
                notes
              </div>
              <div
                className={`flex-1 p-3.5 rounded-lg border text-xs leading-relaxed ${isDark
                  ? "bg-[#252526] border-[#383838] text-gray-300"
                  : "bg-amber-50/50 border-amber-200/60 text-gray-700"
                  }`}
              >
                Passionate about serverless architectures, distributed components, and
                designing resilient APIs. Always exploring new paradigms in backend
                scalability and systems engineering.
              </div>
            </div>
          </div>

          {/* Prominent Action Buttons Bar at bottom (preserved exact functionality) */}
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-3">
            <button
              onClick={handleMessagesClick}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm ${isDark
                ? "bg-[#30D158] hover:bg-green-600 text-white"
                : "bg-[#30D158] hover:bg-green-600 text-white"
                }`}
            >
              <FaCommentDots className="text-base" />
              <span>Talk to me (AI)</span>
            </button>

            <button
              onClick={handleContactClick}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm ${isDark
                ? "bg-[#0A84FF] hover:bg-blue-600 text-white"
                : "bg-[#0A84FF] hover:bg-blue-600 text-white"
                }`}
            >
              <FaTerminal className="text-base" />
              <span>Contact via Terminal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
