"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useTheme } from "next-themes"
import {
  FaCode,
  FaGithub,
  FaExternalLinkAlt,
  FaGlobe,
  FaMobile,
  FaLaptopCode,
  FaCube,
  FaMicrochip,
} from "react-icons/fa"
import {
  Play,
  Square,
  Search,
  FolderGit2,
  Terminal,
  Layers,
  CheckCircle2,
  LayoutGrid,
  List,
  GitBranch,
  Cpu,
} from "lucide-react"
import { projects as projectsData, type Project } from "@/data/projects"

type ProjectsAppProps = {
  initialFilter?: string
}

const domainIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Website Development": FaGlobe,
  "App Development": FaMobile,
  system: FaLaptopCode,
  Blockchain: FaCube,
  IoT: FaMicrochip,
  "Extension Development": FaCode,
  "Data Science": FaCode,
  "Machine Learning": Cpu,
}

const filterCategories = [
  { id: "all", label: "All Targets", icon: Layers, subtitle: "Project Workspace" },
  { id: "Website Development", label: "Web Applications", icon: FaGlobe, subtitle: "Next.js & React" },
  { id: "App Development", label: "iOS & Mobile Apps", icon: FaMobile, subtitle: "Swift & React Native" },
  { id: "Machine Learning", label: "Machine Learning & AI", icon: Cpu, subtitle: "PyTorch & TensorFlow" },
  { id: "Blockchain", label: "Blockchain & Web3", icon: FaCube, subtitle: "Smart Contracts" },
  { id: "Extension Development", label: "Chrome Extensions", icon: FaCode, subtitle: "Browser Add-ons" },
  { id: "system", label: "System & Infrastructure", icon: FaLaptopCode, subtitle: "Arch & Systems" },
]

const techColors: Record<string, string> = {
  "Next.js": "bg-[#252525] text-white border border-gray-700",
  React: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  "React.js": "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  TypeScript: "bg-blue-600/15 text-blue-400 border border-blue-500/30",
  "Tailwind CSS": "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
  TailwindCSS: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
  "Node.js": "bg-green-500/15 text-green-400 border border-green-500/30",
  Python: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  Swift: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  PostgreSQL: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
  MongoDB: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  Docker: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
  FastAPI: "bg-teal-500/15 text-teal-400 border border-teal-500/30",
  TensorFlow: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  "Torch-Vision": "bg-red-500/15 text-red-400 border border-red-500/30",
  CoreML: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
}

export function ProjectsApp({ initialFilter = "all" }: ProjectsAppProps = {}) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [filter, setFilter] = useState<string>(initialFilter)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(1)
  const [viewMode, setViewMode] = useState<"targets" | "compact">("targets")

  useEffect(() => {
    if (initialFilter) {
      setFilter(initialFilter)
    }
  }, [initialFilter])

  const projects = projectsData

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // 1. Filter by domain category
      let matchesFilter = true
      if (filter !== "all") {
        if (p.domains && p.domains.length > 0) {
          matchesFilter = p.domains.some((d) => d === filter)
        } else {
          matchesFilter = p.domain === filter
        }
      }
      // 2. Filter by search query
      let matchesSearch = true
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchName = p.name.toLowerCase().includes(query)
        const matchDesc = p.description.toLowerCase().includes(query)
        const matchTech = p.techStack.some((t) => t.toLowerCase().includes(query))
        matchesSearch = matchName || matchDesc || matchTech
      }
      return matchesFilter && matchesSearch
    })
  }, [projects, filter, searchQuery])

  // Count projects per category
  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length }
    filterCategories.forEach((cat) => {
      if (cat.id !== "all") {
        counts[cat.id] = projects.filter((p) => {
          if (p.domains && p.domains.length > 0) {
            return p.domains.some((d) => d === cat.id)
          }
          return p.domain === cat.id
        }).length
      }
    })
    return counts
  }, [projects])

  return (
    <div
      className={`flex h-full flex-col select-none font-sans ${
        isDark ? "bg-[#1E1E1E] text-[#D4D4D4]" : "bg-[#F5F5F7] text-[#1D1D1F]"
      }`}
    >
      {/* Xcode Top Toolbar */}
      <div
        className={`flex h-12 shrink-0 items-center justify-between border-b px-4 ${
          isDark
            ? "border-[#2D2D2D] bg-[#252526]"
            : "border-[#E5E5E5] bg-[#E8E8ED]"
        }`}
      >
        {/* Left: Xcode Build / Run Controls & Scheme */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              className="flex h-6 w-8 items-center justify-center rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm"
              title="Build Target"
            >
              <Play className="h-3 w-3 fill-current" />
            </button>
            <button
              type="button"
              className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                isDark
                  ? "bg-[#333333] text-gray-400 hover:text-white"
                  : "bg-gray-300 text-gray-600 hover:text-black"
              }`}
              title="Stop Build"
            >
              <Square className="h-2.5 w-2.5 fill-current" />
            </button>
          </div>

          {/* Scheme / Target Selector */}
          <div
            className={`flex items-center space-x-2 rounded px-2.5 py-1 text-xs font-medium border ${
              isDark
                ? "bg-[#1E1E1E] border-[#383838] text-gray-200"
                : "bg-white border-gray-300 text-gray-800"
            }`}
          >
            <FolderGit2 className="h-3.5 w-3.5 text-blue-500" />
            <span>AvadhootProjects.xcodeproj</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-emerald-500 flex items-center font-semibold">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Build Succeeded
            </span>
          </div>
        </div>

        {/* Center/Right: Search & View Toggle */}
        <div className="flex items-center space-x-3">
          {/* Search Input */}
          <div className="relative w-52 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter targets or frameworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-md pl-8 pr-3 py-1 text-xs transition focus:outline-none focus:ring-1 focus:ring-blue-500 border ${
                isDark
                  ? "bg-[#1A1A1A] border-[#383838] text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          {/* View Toggles */}
          <div
            className={`flex items-center rounded border p-0.5 ${
              isDark ? "border-[#383838] bg-[#1A1A1A]" : "border-gray-300 bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode("targets")}
              className={`p-1 rounded text-xs ${
                viewMode === "targets"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-foreground"
              }`}
              title="Target Card View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compact")}
              className={`p-1 rounded text-xs ${
                viewMode === "compact"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-foreground"
              }`}
              title="Compact Table View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Xcode Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Xcode Navigator Sidebar */}
        <div
          className={`w-56 shrink-0 border-r flex flex-col justify-between ${
            isDark
              ? "border-[#2D2D2D] bg-[#1A1A1A]"
              : "border-[#E5E5E5] bg-[#EBEBED]"
          }`}
        >
          <div>
            {/* Sidebar Header */}
            <div className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span>Project Navigator</span>
              <span>Targets ({projects.length})</span>
            </div>

            {/* Filter Navigation List */}
            <nav className="space-y-0.5 px-2">
              {filterCategories.map((category) => {
                const Icon = category.icon
                const isSelected = filter === category.id
                const count = countsByCategory[category.id] ?? 0

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setFilter(category.id)}
                    className={`w-full flex items-center justify-between rounded-md px-2.5 py-2 text-left transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white font-medium shadow-sm"
                        : isDark
                        ? "text-gray-300 hover:bg-white/5"
                        : "text-gray-700 hover:bg-black/5"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isSelected ? "text-white" : "text-blue-500"
                        }`}
                      />
                      <div className="truncate">
                        <div className="text-xs truncate">{category.label}</div>
                        <div
                          className={`text-[10px] truncate ${
                            isSelected ? "text-blue-200" : "text-gray-400"
                          }`}
                        >
                          {category.subtitle}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isSelected
                          ? "bg-white/20 text-white"
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
            </nav>
          </div>

          {/* Sidebar Footer Info */}
          <div
            className={`border-t p-3 text-[11px] ${
              isDark
                ? "border-[#2D2D2D] text-gray-400"
                : "border-[#E5E5E5] text-gray-500"
            }`}
          >
            <div className="flex items-center space-x-1.5 font-medium">
              <GitBranch className="h-3.5 w-3.5 text-blue-500" />
              <span>branch: main / dev</span>
            </div>
          </div>
        </div>

        {/* Center Workspace Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Section Banner Header */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">
                {filterCategories.find((c) => c.id === filter)?.label || "Projects"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Showing {filteredProjects.length} built target
                {filteredProjects.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Empty state if search yields no results */}
          {filteredProjects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Terminal className="h-10 w-10 text-gray-500 mb-3" />
              <div className="text-sm font-semibold">No Targets Found</div>
              <p className="text-xs text-gray-400 mt-1">
                Try modifying your filter query or selecting a different category.
              </p>
            </div>
          )}

          {/* Project Target Cards Grid / List */}
          <div
            className={
              viewMode === "targets"
                ? "grid grid-cols-1 gap-4"
                : "space-y-2.5"
            }
          >
            {filteredProjects.map((project) => {
              const DomainIcon = domainIcons[project.domain] || FaCode
              const displayDomains = project.domains || [project.domain]
              const isSelected = selectedProjectId === project.id

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`group relative rounded-xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? isDark
                        ? "bg-[#252830] border-blue-500 ring-1 ring-blue-500/50"
                        : "bg-blue-50/50 border-blue-500 ring-1 ring-blue-500/50"
                      : isDark
                      ? "bg-[#222224] border-[#303033] hover:border-[#45454A]"
                      : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left & Center: Target Icon + Details */}
                    <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                      {/* Target Icon Box */}
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-lg shadow-inner ${
                          isDark
                            ? "bg-[#18181A] border-[#333333] text-blue-400"
                            : "bg-gray-50 border-gray-200 text-blue-600"
                        }`}
                      >
                        <DomainIcon />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Title Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground truncate">
                            {project.name}
                          </h3>
                          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Compiled
                          </span>

                          {/* Domain Badges */}
                          <div className="flex flex-wrap gap-1">
                            {displayDomains.map((d, idx) => (
                              <span
                                key={idx}
                                className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                  isDark
                                    ? "bg-[#2D2D30] text-gray-300"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Project Description */}
                        <p
                          className={`mt-1.5 text-xs leading-relaxed ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {project.description}
                        </p>

                        {/* Technology Stack Tags */}
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {project.techStack.map((tech, index) => {
                            const badgeColor =
                              techColors[tech] ||
                              (isDark
                                ? "bg-[#2A2A2D] text-gray-300 border border-gray-700"
                                : "bg-gray-100 text-gray-700 border border-gray-200")
                            return (
                              <span
                                key={index}
                                className={`px-2 py-0.5 text-[11px] rounded font-mono font-medium ${badgeColor}`}
                              >
                                {tech}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Oriented Actions (Xcode Build Output / Links) */}
                    <div className="flex sm:flex-col items-end justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-200 dark:border-gray-800">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition border ${
                            isDark
                              ? "bg-[#2D2D30] border-[#3E3E42] text-gray-200 hover:bg-[#38383C]"
                              : "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          <FaGithub className="text-xs" />
                          <span>Source Code</span>
                        </a>
                      )}
                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs font-medium shadow-sm transition"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Run Target</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
