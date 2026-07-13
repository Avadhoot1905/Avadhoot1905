"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useTheme } from "next-themes"
import {
  FaFilePdf,
  FaThLarge,
  FaList,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaFolder,
  FaImage,
  FaTimes,
  FaExternalLinkAlt,
} from "react-icons/fa"
import {
  SiGmail,
  SiGithub,
  SiLinkedin,
  SiLeetcode,
  SiMedium,
} from "react-icons/si"
import { albumImages, type PhotoItem } from "@/components/apps/PhotosApp"

interface FinderAppProps {
  onOpenApp?: (appId: string) => void
  initialTab?: FinderTab
}

type FinderTab = "applications" | "documents" | "photos" | "downloads"
type ViewMode = "grid" | "list"

interface AppItem {
  id: string
  name: string
  kind: string
  icon: React.ReactNode
  url?: string
}

const RESUME_DRIVE_URL =
  "https://drive.google.com/file/d/167McD9-TBCpfFsy8p4Iv-8T1dOKvGkO_/view?usp=drive_link"

export function FinderApp({ onOpenApp, initialTab = "documents" }: FinderAppProps) {
  const { theme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState<FinderTab>(initialTab)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [history, setHistory] = useState<FinderTab[]>([initialTab])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const navigateTab = (tab: FinderTab) => {
    if (tab === activeTab) return
    const nextHistory = history.slice(0, historyIndex + 1)
    nextHistory.push(tab)
    setHistory(nextHistory)
    setHistoryIndex(nextHistory.length - 1)
    setActiveTab(tab)
    setSearchQuery("")
    setSelectedItemId(null)
  }

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setActiveTab(history[historyIndex - 1])
      setSearchQuery("")
      setSelectedItemId(null)
    }
  }

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setActiveTab(history[historyIndex + 1])
      setSearchQuery("")
      setSelectedItemId(null)
    }
  }

  // All Applications defined with authentic macOS icons
  const applications: AppItem[] = useMemo(
    () => [
      {
        id: "finder",
        name: "Finder",
        kind: "Application",
        icon: (
          <img
            src="/assets/macos/finder-svgrepo-com.svg"
            alt="Finder"
            className="h-12 w-12 object-contain drop-shadow-sm"
            draggable={false}
          />
        ),
      },
      {
        id: "safari",
        name: "Safari",
        kind: "Application",
        icon: (
          <img
            src="/assets/macos/safari-svgrepo-com.svg"
            alt="Safari"
            className="h-12 w-12 object-contain drop-shadow-sm"
            draggable={false}
          />
        ),
      },
      {
        id: "messages",
        name: "Messages",
        kind: "Application",
        icon: (
          <img
            src="/assets/macos/messages-svgrepo-com.svg"
            alt="Messages"
            className="h-12 w-12 object-contain drop-shadow-sm"
            draggable={false}
          />
        ),
      },
      {
        id: "photos",
        name: "Photos",
        kind: "Application",
        icon: (
          <img
            src="/assets/macos/apple-photos.svg"
            alt="Photos"
            className="h-12 w-12 object-contain drop-shadow-sm"
            draggable={false}
          />
        ),
      },
      {
        id: "about",
        name: "About Me",
        kind: "Application",
        icon: (
          <img
            src="/assets/macos/contacts.svg"
            alt="About Me"
            className="h-11 w-11 object-contain drop-shadow-sm"
            draggable={false}
          />
        ),
      },
      {
        id: "projects",
        name: "Projects",
        kind: "Application",
        icon: (
          <img
            src="/assets/macos/Xcode.svg"
            alt="Projects"
            className="h-12 w-12 object-contain scale-110 drop-shadow-sm"
            draggable={false}
          />
        ),
      },
      {
        id: "achievements",
        name: "Achievements",
        kind: "Application",
        icon: (
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_Notes_icon.svg"
            alt="Achievements"
            className="h-11 w-11 object-contain drop-shadow-sm"
            draggable={false}
          />
        ),
      },
      {
        id: "education",
        name: "Education",
        kind: "Application",
        icon: (
          <img
            src="/assets/macos/notion-svgrepo-com.svg"
            alt="Education"
            className="h-11 w-11 object-contain drop-shadow-sm"
            draggable={false}
          />
        ),
      },
      {
        id: "experience",
        name: "Experience",
        kind: "Application",
        icon: (
          <img
            src="/assets/macos/mail.svg"
            alt="Experience"
            className="h-11 w-11 object-contain drop-shadow-sm"
            draggable={false}
          />
        ),
      },
      {
        id: "tictactoe",
        name: "Tic Tac Toe",
        kind: "Game",
        icon: (
          <img
            src="/assets/macos/tic-tac-toe.svg"
            alt="Tic Tac Toe"
            className="h-11 w-11 object-contain drop-shadow-sm"
            draggable={false}
          />
        ),
      },
      {
        id: "2048",
        name: "2048",
        kind: "Game",
        icon: (
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/1/18/2048_logo.svg"
            alt="2048"
            className="h-11 w-11 object-contain drop-shadow-sm"
            draggable={false}
          />
        ),
      },
      {
        id: "flappybird",
        name: "Flappy Bird",
        kind: "Game",
        icon: (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#f8d040] to-[#e07020] p-1.5 shadow-sm">
            <img
              src="/assets/macos/Video-Game-Flappy-Bird--Streamline-Ultimate.svg"
              alt="Flappy Bird"
              className="h-full w-full object-contain drop-shadow-sm"
              draggable={false}
            />
          </div>
        ),
      },
      {
        id: "terminal",
        name: "Terminal",
        kind: "Utility",
        icon: (
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Terminalicon2.png"
            alt="Terminal"
            className="h-12 w-12 object-contain drop-shadow-sm"
            draggable={false}
          />
        ),
      },
      {
        id: "gmail",
        name: "Gmail",
        kind: "Web Link",
        icon: (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm border border-black/10">
            <SiGmail className="h-6 w-6 text-[#EA4335]" />
          </div>
        ),
        url: "mailto:arcsmo19@gmail.com",
      },
      {
        id: "github",
        name: "GitHub",
        kind: "Web Link",
        icon: (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#181717] shadow-sm border border-white/10">
            <SiGithub className="h-6 w-6 text-white" />
          </div>
        ),
        url: "https://github.com/Avadhoot1905",
      },
      {
        id: "linkedin",
        name: "LinkedIn",
        kind: "Web Link",
        icon: (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A66C2] shadow-sm">
            <SiLinkedin className="h-6 w-6 text-white" />
          </div>
        ),
        url: "https://www.linkedin.com/in/avadhoot-mahadik/",
      },
      {
        id: "leetcode",
        name: "LeetCode",
        kind: "Web Link",
        icon: (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#282828] shadow-sm">
            <SiLeetcode className="h-6 w-6 text-[#FFA116]" />
          </div>
        ),
        url: "https://leetcode.com/u/arcsmo19/",
      },
      {
        id: "medium",
        name: "Medium",
        kind: "Web Link",
        icon: (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black shadow-sm border border-white/10">
            <SiMedium className="h-6 w-6 text-white" />
          </div>
        ),
        url: "https://medium.com/@arcsmo19",
      },
    ],
    []
  )

  const allPhotos: PhotoItem[] = useMemo(
    () => Object.values(albumImages).flat(),
    []
  )

  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications
    const q = searchQuery.toLowerCase()
    return applications.filter(
      (app) =>
        app.name.toLowerCase().includes(q) || app.kind.toLowerCase().includes(q)
    )
  }, [applications, searchQuery])

  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return allPhotos
    const q = searchQuery.toLowerCase()
    return allPhotos.filter((photo) => photo.alt.toLowerCase().includes(q))
  }, [allPhotos, searchQuery])

  const handleAppClick = (app: AppItem) => {
    if (onOpenApp) {
      onOpenApp(app.id)
    } else if (app.url) {
      window.open(app.url, "_blank")
    }
  }

  const handleResumeClick = () => {
    window.open(RESUME_DRIVE_URL, "_blank")
  }

  const renderSidebarItem = (
    id: FinderTab,
    label: string,
    icon: React.ReactNode
  ) => {
    const isActive = activeTab === id
    return (
      <button
        type="button"
        onClick={() => navigateTab(id)}
        className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
          isActive
            ? "bg-blue-500 text-white shadow-sm"
            : theme === "dark"
              ? "text-gray-300 hover:bg-white/10"
              : "text-gray-700 hover:bg-black/5"
        }`}
      >
        <span className="mr-2.5 text-sm">{icon}</span>
        <span>{label}</span>
      </button>
    )
  }

  const currentCount =
    activeTab === "applications"
      ? filteredApplications.length
      : activeTab === "photos"
        ? filteredPhotos.length
        : 1 // Documents or Downloads

  return (
    <div
      className={`flex h-full flex-col select-none ${
        theme === "dark" ? "bg-[#1E1E1E] text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Top Toolbar */}
      <div
        className={`flex items-center justify-between border-b px-4 py-2 ${
          theme === "dark"
            ? "border-gray-700/80 bg-[#2A2A2A]"
            : "border-gray-200 bg-[#F5F5F7]"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={goBack}
              disabled={historyIndex <= 0}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                historyIndex <= 0
                  ? "opacity-30 cursor-not-allowed"
                  : theme === "dark"
                    ? "hover:bg-white/10"
                    : "hover:bg-black/5"
              }`}
              title="Back"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <button
              type="button"
              onClick={goForward}
              disabled={historyIndex >= history.length - 1}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                historyIndex >= history.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : theme === "dark"
                    ? "hover:bg-white/10"
                    : "hover:bg-black/5"
              }`}
              title="Forward"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>

          <div className="text-sm font-semibold capitalize tracking-tight">
            {activeTab}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div
            className={`flex items-center rounded-md border p-0.5 ${
              theme === "dark"
                ? "border-gray-700 bg-[#1A1A1A]"
                : "border-gray-300 bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                viewMode === "grid"
                  ? theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Icon View"
            >
              <FaThLarge />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                viewMode === "list"
                  ? theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="List View"
            >
              <FaList />
            </button>
          </div>

          {/* Search Bar */}
          <div
            className={`flex items-center rounded-md border px-2.5 py-1 text-xs ${
              theme === "dark"
                ? "border-gray-700 bg-[#1A1A1A] text-white"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          >
            <FaSearch className="mr-2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-28 bg-transparent focus:w-36 focus:outline-none transition-all duration-200 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Mobile Tabs Header */}
      {isMobile && (
        <div
          className={`flex border-b overflow-x-auto px-2 py-1.5 space-x-1 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800/80"
              : "border-gray-200 bg-gray-100"
          }`}
        >
          {renderSidebarItem(
            "applications",
            "Applications",
            <FaThLarge className="text-blue-500" />
          )}
          {renderSidebarItem(
            "documents",
            "Documents",
            <FaFolder className="text-blue-500" />
          )}
          {renderSidebarItem(
            "photos",
            "Photos",
            <FaImage className="text-blue-500" />
          )}
          {renderSidebarItem(
            "downloads",
            "Downloads",
            <FaDownload className="text-blue-500" />
          )}
        </div>
      )}

      {/* Main Finder Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Desktop) */}
        {!isMobile && (
          <div
            className={`w-48 shrink-0 border-r p-3 flex flex-col justify-between ${
              theme === "dark"
                ? "bg-[#252526] border-gray-700/80"
                : "bg-[#F3F4F6] border-gray-200"
            }`}
          >
            <div>
              <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Favorites
              </div>
              <div className="space-y-1">
                {renderSidebarItem(
                  "applications",
                  "Applications",
                  <FaThLarge className="text-blue-500" />
                )}
                {renderSidebarItem(
                  "documents",
                  "Documents",
                  <FaFolder className="text-blue-500" />
                )}
                {renderSidebarItem(
                  "photos",
                  "Photos",
                  <FaImage className="text-blue-500" />
                )}
                {renderSidebarItem(
                  "downloads",
                  "Downloads",
                  <FaDownload className="text-blue-500" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content View Area */}
        <div
          className="flex-1 overflow-y-auto p-4"
          onClick={() => setSelectedItemId(null)}
        >
          {/* Applications Tab Content */}
          {activeTab === "applications" && (
            <>
              {viewMode === "grid" ? (
                <div
                  className={`grid gap-5 ${
                    isMobile
                      ? "grid-cols-3"
                      : "grid-cols-4 sm:grid-cols-5 md:grid-cols-6"
                  }`}
                >
                  {filteredApplications.map((app) => {
                    const isSelected = selectedItemId === app.id
                    return (
                      <div
                        key={app.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedItemId(app.id)
                          if (isMobile) {
                            handleAppClick(app)
                          }
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          handleAppClick(app)
                        }}
                        className={`group flex flex-col items-center justify-start rounded-xl p-2.5 cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "bg-blue-500/20 border border-blue-500/50 shadow-sm"
                            : theme === "dark"
                              ? "border border-transparent hover:bg-white/10"
                              : "border border-transparent hover:bg-black/5"
                        }`}
                      >
                        <div className="flex h-14 w-14 items-center justify-center transition-transform duration-200 group-hover:scale-105">
                          {app.icon}
                        </div>
                        <div
                          className={`mt-2 text-center text-xs font-medium leading-tight line-clamp-1 rounded px-1.5 py-0.5 ${
                            isSelected
                              ? "bg-blue-500 text-white"
                              : ""
                          }`}
                        >
                          {app.name}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="w-full">
                  <div
                    className={`grid grid-cols-12 border-b pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 ${
                      theme === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="col-span-6">Name</div>
                    <div className="col-span-4">Kind</div>
                    <div className="col-span-2 text-right">Action</div>
                  </div>
                  <div className="divide-y divide-gray-200/20">
                    {filteredApplications.map((app) => {
                      const isSelected = selectedItemId === app.id
                      return (
                        <div
                          key={app.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedItemId(app.id)
                            if (isMobile) {
                              handleAppClick(app)
                            }
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation()
                            handleAppClick(app)
                          }}
                          className={`grid grid-cols-12 items-center py-2 px-1.5 rounded-md cursor-pointer text-xs transition-colors ${
                            isSelected
                              ? "bg-blue-500 text-white"
                              : theme === "dark"
                                ? "hover:bg-white/10"
                                : "hover:bg-black/5"
                          }`}
                        >
                          <div className="col-span-6 flex items-center space-x-3">
                            <div className="h-6 w-6 flex items-center justify-center shrink-0">
                              {app.icon}
                            </div>
                            <span className="font-medium">{app.name}</span>
                          </div>
                          <div
                            className={`col-span-4 ${
                              isSelected ? "text-blue-100" : "text-gray-400"
                            }`}
                          >
                            {app.kind}
                          </div>
                          <div className="col-span-2 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAppClick(app)
                              }}
                              className={`text-[11px] hover:underline font-medium ${
                                isSelected ? "text-white" : "text-blue-500"
                              }`}
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Documents Tab Content - Strictly Resume.pdf */}
          {activeTab === "documents" && (
            <>
              {viewMode === "grid" ? (
                <div
                  className={`grid gap-4 ${
                    isMobile ? "grid-cols-3" : "grid-cols-5"
                  }`}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedItemId("resume-doc")
                      if (isMobile) {
                        handleResumeClick()
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      handleResumeClick()
                    }}
                    className={`group flex flex-col items-center rounded-xl p-3 cursor-pointer transition-all ${
                      selectedItemId === "resume-doc"
                        ? "bg-blue-500/20 border border-blue-500/50 shadow-sm"
                        : theme === "dark"
                          ? "border border-transparent hover:bg-white/10"
                          : "border border-transparent hover:bg-black/5"
                    }`}
                  >
                    <div className="h-16 w-16 rounded-xl flex items-center justify-center bg-red-500/10 transition-transform duration-200 group-hover:scale-105">
                      <FaFilePdf className="text-4xl text-red-500" />
                    </div>
                    <div
                      className={`mt-2 text-xs font-medium rounded px-1.5 py-0.5 ${
                        selectedItemId === "resume-doc"
                          ? "bg-blue-500 text-white"
                          : ""
                      }`}
                    >
                      Resume.pdf
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div
                    className={`grid grid-cols-12 border-b pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 ${
                      theme === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="col-span-6">Name</div>
                    <div className="col-span-4">Kind</div>
                    <div className="col-span-2 text-right">Size</div>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedItemId("resume-doc")
                      if (isMobile) {
                        handleResumeClick()
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      handleResumeClick()
                    }}
                    className={`grid grid-cols-12 items-center py-2.5 px-2 rounded-md cursor-pointer text-xs transition-colors ${
                      selectedItemId === "resume-doc"
                        ? "bg-blue-500 text-white"
                        : theme === "dark"
                          ? "hover:bg-white/10"
                          : "hover:bg-black/5"
                    }`}
                  >
                    <div className="col-span-6 flex items-center space-x-3">
                      <FaFilePdf className="text-lg text-red-500 shrink-0" />
                      <span className="font-medium">Resume.pdf</span>
                    </div>
                    <div
                      className={`col-span-4 ${
                        selectedItemId === "resume-doc"
                          ? "text-blue-100"
                          : "text-gray-400"
                      }`}
                    >
                      PDF Document
                    </div>
                    <div
                      className={`col-span-2 text-right ${
                        selectedItemId === "resume-doc"
                          ? "text-blue-100"
                          : "text-gray-400"
                      }`}
                    >
                      2.4 MB
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Photos Tab Content - All photos from PhotosApp */}
          {activeTab === "photos" && (
            <div>
              <div
                className={`grid gap-4 ${
                  isMobile
                    ? "grid-cols-2"
                    : "grid-cols-3 sm:grid-cols-4 md:grid-cols-5"
                }`}
              >
                {filteredPhotos.map((photo, index) => {
                  const isSelected = selectedItemId === photo.src
                  return (
                    <div
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedItemId(photo.src)
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        setSelectedPhoto(photo)
                      }}
                      className={`group flex flex-col rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-500 shadow-md bg-blue-500/10"
                          : theme === "dark"
                            ? "border-gray-700/70 bg-[#252526] hover:border-blue-500/50"
                            : "border-gray-200 bg-white hover:border-blue-500/50"
                      }`}
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-gray-900/10">
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div
                        className={`p-2 text-center text-xs font-medium truncate ${
                          isSelected ? "bg-blue-500 text-white" : ""
                        }`}
                      >
                        {photo.alt}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Downloads Tab Content */}
          {activeTab === "downloads" && (
            <>
              {viewMode === "grid" ? (
                <div
                  className={`grid gap-4 ${
                    isMobile ? "grid-cols-3" : "grid-cols-5"
                  }`}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedItemId("resume-dl")
                      if (isMobile) {
                        handleResumeClick()
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      handleResumeClick()
                    }}
                    className={`group flex flex-col items-center rounded-xl p-3 cursor-pointer transition-all ${
                      selectedItemId === "resume-dl"
                        ? "bg-blue-500/20 border border-blue-500/50 shadow-sm"
                        : theme === "dark"
                          ? "border border-transparent hover:bg-white/10"
                          : "border border-transparent hover:bg-black/5"
                    }`}
                  >
                    <div className="h-16 w-16 rounded-xl flex items-center justify-center bg-red-500/10 transition-transform duration-200 group-hover:scale-105">
                      <FaFilePdf className="text-4xl text-red-500" />
                    </div>
                    <div
                      className={`mt-2 text-xs font-medium rounded px-1.5 py-0.5 ${
                        selectedItemId === "resume-dl"
                          ? "bg-blue-500 text-white"
                          : ""
                      }`}
                    >
                      Resume.pdf
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div
                    className={`grid grid-cols-12 border-b pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 ${
                      theme === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="col-span-6">Name</div>
                    <div className="col-span-4">Kind</div>
                    <div className="col-span-2 text-right">Size</div>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedItemId("resume-dl")
                      if (isMobile) {
                        handleResumeClick()
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      handleResumeClick()
                    }}
                    className={`grid grid-cols-12 items-center py-2.5 px-2 rounded-md cursor-pointer text-xs transition-colors ${
                      selectedItemId === "resume-dl"
                        ? "bg-blue-500 text-white"
                        : theme === "dark"
                          ? "hover:bg-white/10"
                          : "hover:bg-black/5"
                    }`}
                  >
                    <div className="col-span-6 flex items-center space-x-3">
                      <FaFilePdf className="text-lg text-red-500 shrink-0" />
                      <span className="font-medium">Resume.pdf</span>
                    </div>
                    <div
                      className={`col-span-4 ${
                        selectedItemId === "resume-dl"
                          ? "text-blue-100"
                          : "text-gray-400"
                      }`}
                    >
                      PDF Document
                    </div>
                    <div
                      className={`col-span-2 text-right ${
                        selectedItemId === "resume-dl"
                          ? "text-blue-100"
                          : "text-gray-400"
                      }`}
                    >
                      2.4 MB
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div
        className={`flex items-center justify-between border-t px-4 py-1 text-[11px] ${
          theme === "dark"
            ? "border-gray-700/80 bg-[#252526] text-gray-400"
            : "border-gray-200 bg-[#F5F5F7] text-gray-500"
        }`}
      >
        <div>
          {currentCount} {currentCount === 1 ? "item" : "items"}
        </div>
        <div className="capitalize">{activeTab}</div>
      </div>

      {/* Lightbox Modal for Photo inspection inside Finder */}
      {selectedPhoto && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-h-[90%] max-w-[90%] overflow-hidden rounded-xl bg-black border border-white/10 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <FaTimes />
            </button>
            <div className="flex-1 overflow-hidden flex items-center justify-center">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
            <div className="bg-black/90 px-4 py-2 text-center text-xs text-gray-300 border-t border-white/10">
              {selectedPhoto.alt}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
