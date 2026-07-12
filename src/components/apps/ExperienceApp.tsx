"use client"

import { useState, useMemo } from "react"
import { useTheme } from "next-themes"
import { experiences, Experience } from "@/data/experience"
import {
  FaInbox,
  FaStar,
  FaReply,
  FaPaperclip,
  FaSearch,
  FaCheck,
  FaBuilding,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRedoAlt,
  FaChevronLeft,
  FaEnvelope,
  FaUserCheck,
  FaFileAlt,
} from "react-icons/fa"

interface EnrichedExperience extends Experience {
  senderName: string
  senderEmail: string
  folder: "all" | "industry" | "virtual" | "leadership"
  avatarColor: string
  flagged?: boolean
}

// Map each experience ID to authentic Mail metadata
const getEnrichedExperience = (exp: Experience): EnrichedExperience => {
  switch (exp.id) {
    case 1: // QNu Labs
      return {
        ...exp,
        senderName: "QNu Labs Engineering",
        senderEmail: "talent@qnulabs.com",
        folder: "industry",
        avatarColor: "bg-[#0A84FF] text-white",
        flagged: true,
      }
    case 2: // Kathuria Gun House
      return {
        ...exp,
        senderName: "Kathuria Gun House Tech",
        senderEmail: "engineering@kathuriagunhouse.com",
        folder: "industry",
        avatarColor: "bg-[#FF9F0A] text-white",
      }
    case 3: // JP Morgan Chase
      return {
        ...exp,
        senderName: "JPMorgan Chase Talent",
        senderEmail: "software.programs@jpmorganchase.com",
        folder: "virtual",
        avatarColor: "bg-[#5E5CE6] text-white",
      }
    case 4: // ACM-VIT
      return {
        ...exp,
        senderName: "ACM-VIT Core Board",
        senderEmail: "chapter@acmvit.in",
        folder: "leadership",
        avatarColor: "bg-[#30D158] text-white",
        flagged: true,
      }
    default:
      return {
        ...exp,
        senderName: exp.organization,
        senderEmail: `contact@${exp.organization.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        folder: "industry",
        avatarColor: "bg-[#BF5AF2] text-white",
      }
  }
}

const enrichedExperiences: EnrichedExperience[] = experiences.map(getEnrichedExperience)

export function ExperienceApp() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [selectedFolder, setSelectedFolder] = useState<string>("all")
  const [selectedId, setSelectedId] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterMode, setFilterMode] = useState<"all" | "flagged">("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedReply, setCopiedReply] = useState(false)
  const [mobileView, setMobileView] = useState<"list" | "detail">("list")

  // Filter experiences based on folder, search query, and flagged toggle
  const filteredExperiences = useMemo(() => {
    return enrichedExperiences.filter((exp) => {
      const matchFolder =
        selectedFolder === "all" || exp.folder === selectedFolder
      const matchFlagged = filterMode === "all" || exp.flagged
      const matchSearch =
        searchQuery.trim() === "" ||
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.techStack.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        )

      return matchFolder && matchFlagged && matchSearch
    })
  }, [selectedFolder, filterMode, searchQuery])

  const selectedExperience = useMemo(() => {
    return (
      enrichedExperiences.find((e) => e.id === selectedId) ||
      filteredExperiences[0] ||
      enrichedExperiences[0]
    )
  }, [selectedId, filteredExperiences])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleReplyContact = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText("arcsmo19@gmail.com")
      setCopiedReply(true)
      setTimeout(() => setCopiedReply(false), 2000)
    }
  }

  const handleSelectExperience = (id: number) => {
    setSelectedId(id)
    setMobileView("detail")
  }

  const countByFolder = (folder: string) => {
    if (folder === "all") return enrichedExperiences.length
    return enrichedExperiences.filter((e) => e.folder === folder).length
  }

  return (
    <div
      className={`flex h-full flex-col select-none font-sans overflow-hidden ${
        isDark ? "bg-[#1E1E1E] text-[#D4D4D4]" : "bg-[#F5F5F7] text-[#1D1D1F]"
      }`}
    >
      {/* Top macOS Mail Window Toolbar */}
      <div
        className={`flex h-12 shrink-0 items-center justify-between border-b px-3 sm:px-4 ${
          isDark
            ? "border-[#2D2D2D] bg-[#252526]"
            : "border-[#E5E5E5] bg-[#E8E8ED]"
        }`}
      >
        {/* Left Toolbar Controls */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleRefresh}
            className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              isDark
                ? "bg-[#333333] text-gray-200 hover:bg-[#3E3E3E]"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
            title="Check for New Experiences"
          >
            <FaRedoAlt
              className={`h-3 w-3 ${isRefreshing ? "animate-spin text-[#0A84FF]" : ""}`}
            />
            <span className="hidden sm:inline">Get Mail</span>
          </button>

          <div
            className={`hidden sm:flex items-center space-x-1 rounded-md px-2 py-1 text-xs font-medium ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <FaInbox className="h-3.5 w-3.5 text-[#0A84FF]" />
            <span>macOS Mailbox • Avadhoot Mahadik</span>
          </div>
        </div>

        {/* Center Search Input */}
        <div className="relative w-48 sm:w-64 md:w-72">
          <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search experiences, roles, tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-md pl-8 pr-3 py-1 text-xs transition focus:outline-none focus:ring-1 focus:ring-[#0A84FF] border ${
              isDark
                ? "bg-[#1A1A1A] border-[#383838] text-white placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={handleReplyContact}
            className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              copiedReply
                ? "bg-emerald-600 text-white"
                : "bg-[#0A84FF] text-white hover:bg-blue-600 shadow-sm"
            }`}
            title="Copy Email Address to Reply"
          >
            {copiedReply ? <FaCheck className="h-3 w-3" /> : <FaReply className="h-3 w-3" />}
            <span>{copiedReply ? "Copied Email" : "Reply"}</span>
          </button>
        </div>
      </div>

      {/* Main 3-Pane macOS Mail Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Pane: macOS Mailboxes Sidebar (Visible on Desktop lg+) */}
        <div
          className={`hidden lg:flex w-52 shrink-0 border-r flex-col justify-between ${
            isDark
              ? "border-[#2D2D2D] bg-[#1A1A1A]"
              : "border-[#E5E5E5] bg-[#EBEBED]"
          }`}
        >
          <div>
            {/* Sidebar Title */}
            <div className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span>Mailboxes</span>
              <span>{enrichedExperiences.length} total</span>
            </div>

            {/* Folder Navigation */}
            <nav className="space-y-0.5 px-2">
              {[
                { id: "all", label: "All Inboxes", icon: FaInbox, color: "text-[#0A84FF]" },
                { id: "industry", label: "Industry & Internships", icon: FaBuilding, color: "text-[#FF9F0A]" },
                { id: "virtual", label: "Virtual Experience", icon: FaFileAlt, color: "text-[#5E5CE6]" },
                { id: "leadership", label: "Leadership & Chapter", icon: FaUserCheck, color: "text-[#30D158]" },
              ].map((folder) => {
                const Icon = folder.icon
                const isSelected = selectedFolder === folder.id && filterMode === "all"
                const count = countByFolder(folder.id)

                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => {
                      setSelectedFolder(folder.id)
                      setFilterMode("all")
                    }}
                    className={`group w-full flex items-center justify-between rounded-md px-2.5 py-2 text-left transition-all ${
                      isSelected
                        ? "bg-[#0A84FF] text-white font-medium shadow-sm"
                        : isDark
                        ? "text-gray-300 hover:bg-white/5"
                        : "text-gray-700 hover:bg-black/5"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isSelected ? "text-white" : folder.color
                        }`}
                      />
                      <span className="text-xs truncate">{folder.label}</span>
                    </div>
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : isDark
                          ? "bg-[#2A2A2A] text-gray-400"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}

              {/* Flagged Section Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setFilterMode(filterMode === "flagged" ? "all" : "flagged")}
                  className={`w-full flex items-center justify-between rounded-md px-2.5 py-2 text-left transition-all ${
                    filterMode === "flagged"
                      ? "bg-[#0A84FF] text-white font-medium shadow-sm"
                      : isDark
                      ? "text-gray-300 hover:bg-white/5"
                      : "text-gray-700 hover:bg-black/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <FaStar className={`h-3.5 w-3.5 ${filterMode === "flagged" ? "text-white" : "text-amber-400"}`} />
                    <span className="text-xs">Starred / Highlights</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      filterMode === "flagged"
                        ? "bg-white/25 text-white"
                        : isDark
                        ? "bg-[#2A2A2A] text-gray-400"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {enrichedExperiences.filter((e) => e.flagged).length}
                  </span>
                </button>
              </div>
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div
            className={`border-t p-3 text-[11px] ${
              isDark
                ? "border-[#2D2D2D] text-gray-400"
                : "border-[#E5E5E5] text-gray-500"
            }`}
          >
            <div className="flex items-center justify-between font-medium">
              <span>Updated Today</span>
              <span className="text-[#0A84FF]">Verified</span>
            </div>
          </div>
        </div>

        {/* Middle Pane: Message List (Inbox Feed) */}
        <div
          className={`w-full lg:w-80 shrink-0 border-r flex flex-col ${
            isDark ? "border-[#2D2D2D] bg-[#1E1E1E]" : "border-[#E5E5E5] bg-white"
          } ${mobileView === "detail" ? "hidden lg:flex" : "flex"}`}
        >
          {/* Mobile Folder Category Bar (< lg) */}
          <div className="lg:hidden p-2 border-b border-gray-200 dark:border-gray-800 flex overflow-x-auto gap-1.5 no-scrollbar">
            {[
              { id: "all", label: "All Inboxes" },
              { id: "industry", label: "Industry" },
              { id: "virtual", label: "Virtual Experience" },
              { id: "leadership", label: "Leadership" },
            ].map((folder) => {
              const isSelected = selectedFolder === folder.id && filterMode === "all"
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => {
                    setSelectedFolder(folder.id)
                    setFilterMode("all")
                  }}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition ${
                    isSelected
                      ? "bg-[#0A84FF] text-white shadow-sm"
                      : isDark
                      ? "bg-[#252526] text-gray-300 border border-[#383838]"
                      : "bg-gray-100 text-gray-700 border border-gray-300"
                  }`}
                >
                  {folder.label}
                </button>
              )
            })}
          </div>

          {/* Message List Header & Filter Segments */}
          <div
            className={`flex items-center justify-between px-3 py-2 border-b ${
              isDark ? "border-[#2D2D2D] bg-[#252526]/50" : "border-[#E5E5E5] bg-gray-50"
            }`}
          >
            <span className="text-xs font-bold text-foreground">
              Inbox ({filteredExperiences.length})
            </span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  filterMode === "all"
                    ? "bg-[#0A84FF] text-white"
                    : "text-gray-400 hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("flagged")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  filterMode === "flagged"
                    ? "bg-[#0A84FF] text-white"
                    : "text-gray-400 hover:text-foreground"
                }`}
              >
                Flagged
              </button>
            </div>
          </div>

          {/* Experience Message List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-[#2D2D2D]">
            {filteredExperiences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <FaEnvelope className="h-8 w-8 text-gray-400 mb-2" />
                <div className="text-xs font-semibold">No experiences match your search</div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Try clearing the search filter or selecting All Inboxes.
                </p>
              </div>
            ) : (
              filteredExperiences.map((exp) => {
                const isSelected = selectedExperience?.id === exp.id
                return (
                  <div
                    key={exp.id}
                    onClick={() => handleSelectExperience(exp.id)}
                    className={`p-3.5 cursor-pointer transition-colors relative ${
                      isSelected
                        ? isDark
                          ? "bg-[#0A84FF]/20 border-l-4 border-[#0A84FF]"
                          : "bg-[#0A84FF]/10 border-l-4 border-[#0A84FF]"
                        : isDark
                        ? "hover:bg-white/5"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Top Row: Sender & Timestamp */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-[#0A84FF] shrink-0" />
                        <span className="text-xs font-bold truncate text-foreground">
                          {exp.senderName}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                        {exp.duration.split("–")[0]?.trim() || exp.duration}
                      </span>
                    </div>

                    {/* Subject / Role Title */}
                    <div className="text-xs font-semibold truncate text-foreground mb-1">
                      {exp.role} — {exp.organization}
                    </div>

                    {/* Snippet Preview */}
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {exp.description}
                    </p>

                    {/* Attachment & Flag Bottom Row */}
                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex items-center space-x-1.5 text-[10px] text-gray-400">
                        <FaPaperclip className="h-2.5 w-2.5" />
                        <span>{exp.techStack.length} attachments</span>
                      </div>
                      {exp.flagged && (
                        <FaStar className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Pane: Message Reader / Email Viewer */}
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            isDark ? "bg-[#1E1E1E]" : "bg-white"
          } ${mobileView === "list" ? "hidden lg:flex" : "flex"}`}
        >
          {selectedExperience ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Mobile Back Button (< lg) */}
              <div className="lg:hidden shrink-0 flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="flex items-center space-x-1 text-xs font-medium text-[#0A84FF]"
                >
                  <FaChevronLeft className="h-3 w-3" />
                  <span>Mailboxes</span>
                </button>
                <span className="text-xs font-semibold truncate max-w-[200px]">
                  {selectedExperience.organization}
                </span>
              </div>

              {/* Single unified scrollable document container */}
              <div className="flex-1 overflow-y-auto">
                {/* Email Header Block (scrolls with content) */}
                <div
                  className={`p-4 sm:p-6 border-b ${
                    isDark ? "border-[#2D2D2D] bg-[#222224]" : "border-gray-200 bg-gray-50/70"
                  }`}
                >
                  {/* Subject Line */}
                  <h2 className="text-base sm:text-xl font-bold text-foreground leading-snug mb-4">
                    {selectedExperience.title}
                  </h2>

                  {/* Sender Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      {/* Organization Avatar */}
                      <div
                        className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-base shadow-sm shrink-0 ${selectedExperience.avatarColor}`}
                      >
                        {selectedExperience.organization.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-foreground">
                            {selectedExperience.senderName}
                          </span>
                          <span className="text-xs text-gray-400">
                            &lt;{selectedExperience.senderEmail}&gt;
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          To: Avadhoot Mahadik &lt;arcsmo19@gmail.com&gt;
                        </div>
                      </div>
                    </div>

                    {/* Date & Location Pill */}
                    <div className="flex flex-col sm:items-end text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1.5 font-medium">
                        <FaCalendarAlt className="h-3 w-3 text-[#0A84FF]" />
                        <span>{selectedExperience.duration}</span>
                      </div>
                      {selectedExperience.location && (
                        <div className="flex items-center space-x-1.5 mt-1">
                          <FaMapMarkerAlt className="h-3 w-3 text-red-500" />
                          <span>{selectedExperience.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email Body Letter Content (scrolls seamlessly below header) */}
                <div className="p-4 sm:p-6 md:p-8 space-y-6">
                  {/* Greeting & Executive Memo */}
                  <div className="space-y-3">
                    <p className="text-xs font-mono uppercase tracking-wider text-gray-400">
                      — CERTIFIED RECORD OF EXPERIENCE & TECHNICAL SCOPE —
                    </p>
                    <div
                      className={`p-4 rounded-xl border leading-relaxed text-xs sm:text-sm ${
                        isDark
                          ? "bg-[#252526] border-[#383838] text-gray-200"
                          : "bg-blue-50/40 border-blue-200/60 text-gray-800"
                      }`}
                    >
                      <div className="font-semibold text-[#0A84FF] mb-1">
                        Role Overview — {selectedExperience.role}
                      </div>
                      {selectedExperience.description}
                    </div>
                  </div>

                  {/* Key Deliverables & Contributions (Bullets) */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                      Key Contributions & Engineering Impact
                    </h3>
                    <div className="space-y-2.5">
                      {selectedExperience.bullets.map((bullet, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start space-x-3 p-3.5 rounded-lg border text-xs sm:text-sm leading-relaxed transition ${
                            isDark
                              ? "bg-[#222224] border-[#303033] text-gray-200"
                              : "bg-white border-gray-200 text-gray-700 shadow-sm"
                          }`}
                        >
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#30D158]/15 text-[#30D158]">
                            <FaCheck className="h-2.5 w-2.5" />
                          </div>
                          <span className="flex-1">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attachments & Tech Stack Box (📎 macOS Mail Attachment Style) */}
                  <div className="pt-2">
                    <div className="flex items-center space-x-2 mb-3">
                      <FaPaperclip className="h-3.5 w-3.5 text-[#0A84FF]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Attachments & Tooling ({selectedExperience.techStack.length} files)
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {selectedExperience.techStack.map((tech, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-2.5 p-2.5 rounded-lg border transition ${
                            isDark
                              ? "bg-[#252526] border-[#383838] text-gray-200 hover:border-gray-500"
                              : "bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300"
                          }`}
                        >
                          <div className="h-7 w-7 rounded bg-[#0A84FF]/15 flex items-center justify-center text-[#0A84FF] font-bold text-xs shrink-0">
                            📎
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold truncate">
                              {tech}
                            </div>
                            <div className="text-[10px] text-gray-400 truncate">
                              Skill Attachment
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Signature Block */}
                  <div className="pt-6 mt-6 border-t border-gray-200 dark:border-[#2D2D2D] text-xs text-gray-500 dark:text-gray-400">
                    <p>Best regards,</p>
                    <p className="font-bold text-foreground mt-1">
                      {selectedExperience.senderName}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {selectedExperience.organization} • Verified Employment Record
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
