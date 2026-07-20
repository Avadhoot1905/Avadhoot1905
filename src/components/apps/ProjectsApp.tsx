"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useTheme } from "next-themes"
import {
  FaCode,
  FaGithub,
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

// Classic Apple System Colors for Xcode categories
const filterCategories = [
  {
    id: "all",
    label: "All Targets",
    icon: Layers,
    subtitle: "Project Workspace",
    color: "text-[#0A84FF]", // Apple Blue
  },
  {
    id: "Website Development",
    label: "Web Applications",
    icon: FaGlobe,
    subtitle: "Next.js & React",
    color: "text-[#64D2FF]", // Apple Sky Blue
  },
  {
    id: "App Development",
    label: "iOS & Mobile Apps",
    icon: FaMobile,
    subtitle: "Swift & React Native",
    color: "text-[#FF9F0A]", // Apple Orange
  },
  {
    id: "Machine Learning",
    label: "Machine Learning & AI",
    icon: Cpu,
    subtitle: "PyTorch & TensorFlow",
    color: "text-[#BF5AF2]", // Apple Purple
  },
  {
    id: "Blockchain",
    label: "Blockchain & Web3",
    icon: FaCube,
    subtitle: "Smart Contracts",
    color: "text-[#30D158]", // Apple Green
  },
  {
    id: "Extension Development",
    label: "Chrome Extensions",
    icon: FaCode,
    subtitle: "Browser Add-ons",
    color: "text-[#FF375F]", // Apple Pink/Rose
  },
  {
    id: "system",
    label: "System & Infrastructure",
    icon: FaLaptopCode,
    subtitle: "Arch & Systems",
    color: "text-[#5E5CE6]", // Apple Indigo
  },
]

// Apple color styling per domain
const domainAppleColors: Record<
  string,
  {
    boxDark: string
    boxLight: string
    badge: string
  }
> = {
  "Website Development": {
    boxDark: "bg-[#0A84FF]/15 border-[#0A84FF]/30 text-[#64D2FF]",
    boxLight: "bg-[#0A84FF]/10 border-[#0A84FF]/30 text-[#0066CC]",
    badge: "bg-[#0A84FF]/15 text-[#0066CC] dark:text-[#64D2FF] border border-[#0A84FF]/30",
  },
  "App Development": {
    boxDark: "bg-[#FF9F0A]/15 border-[#FF9F0A]/30 text-[#FF9F0A]",
    boxLight: "bg-[#FF9F0A]/10 border-[#FF9F0A]/30 text-[#D97706]",
    badge: "bg-[#FF9F0A]/15 text-[#B45309] dark:text-[#FF9F0A] border border-[#FF9F0A]/30",
  },
  "Machine Learning": {
    boxDark: "bg-[#BF5AF2]/15 border-[#BF5AF2]/30 text-[#BF5AF2]",
    boxLight: "bg-[#BF5AF2]/10 border-[#BF5AF2]/30 text-[#9333EA]",
    badge: "bg-[#BF5AF2]/15 text-[#7E22CE] dark:text-[#BF5AF2] border border-[#BF5AF2]/30",
  },
  Blockchain: {
    boxDark: "bg-[#30D158]/15 border-[#30D158]/30 text-[#30D158]",
    boxLight: "bg-[#30D158]/10 border-[#30D158]/30 text-[#16A34A]",
    badge: "bg-[#30D158]/15 text-[#15803D] dark:text-[#30D158] border border-[#30D158]/30",
  },
  "Extension Development": {
    boxDark: "bg-[#FF375F]/15 border-[#FF375F]/30 text-[#FF375F]",
    boxLight: "bg-[#FF375F]/10 border-[#FF375F]/30 text-[#E11D48]",
    badge: "bg-[#FF375F]/15 text-[#BE123C] dark:text-[#FF375F] border border-[#FF375F]/30",
  },
  system: {
    boxDark: "bg-[#5E5CE6]/15 border-[#5E5CE6]/30 text-[#5E5CE6]",
    boxLight: "bg-[#5E5CE6]/10 border-[#5E5CE6]/30 text-[#4F46E5]",
    badge: "bg-[#5E5CE6]/15 text-[#4338CA] dark:text-[#5E5CE6] border border-[#5E5CE6]/30",
  },
}

const defaultAppleColor = {
  boxDark: "bg-[#0A84FF]/15 border-[#0A84FF]/30 text-[#64D2FF]",
  boxLight: "bg-[#0A84FF]/10 border-[#0A84FF]/30 text-[#0066CC]",
  badge: "bg-[#0A84FF]/15 text-[#64D2FF] border border-[#0A84FF]/30",
}

const techColors: Record<string, string> = {
  "Next.js": "bg-[#64D2FF]/15 text-[#0066CC] dark:text-[#64D2FF] border border-[#64D2FF]/30",
  React: "bg-[#0A84FF]/15 text-[#0066CC] dark:text-[#64D2FF] border border-[#0A84FF]/30",
  "React.js": "bg-[#0A84FF]/15 text-[#0066CC] dark:text-[#64D2FF] border border-[#0A84FF]/30",
  TypeScript: "bg-[#0A84FF]/15 text-[#0A84FF] dark:text-[#5E9EFF] border border-[#0A84FF]/30",
  JavaScript: "bg-[#FFD60A]/15 text-[#B45309] dark:text-[#FFD60A] border border-[#FFD60A]/30",
  "Tailwind CSS": "bg-[#32ADE6]/15 text-[#0284C7] dark:text-[#32ADE6] border border-[#32ADE6]/30",
  TailwindCSS: "bg-[#32ADE6]/15 text-[#0284C7] dark:text-[#32ADE6] border border-[#32ADE6]/30",
  CSS: "bg-[#32ADE6]/15 text-[#0284C7] dark:text-[#32ADE6] border border-[#32ADE6]/30",
  Redis: "bg-[#FF3B30]/15 text-[#DC2626] dark:text-[#FF3B30] border border-[#FF3B30]/30",
  "AWS S3": "bg-[#FF9F0A]/15 text-[#D97706] dark:text-[#FF9F0A] border border-[#FF9F0A]/30",
  "AWS Lambda": "bg-[#FF9F0A]/15 text-[#D97706] dark:text-[#FF9F0A] border border-[#FF9F0A]/30",
  "AWS CloudFront": "bg-[#FF9F0A]/15 text-[#D97706] dark:text-[#FF9F0A] border border-[#FF9F0A]/30",
  "AWS API Gateway": "bg-[#FF9F0A]/15 text-[#D97706] dark:text-[#FF9F0A] border border-[#FF9F0A]/30",
  "AWS RDS": "bg-[#FF9F0A]/15 text-[#D97706] dark:text-[#FF9F0A] border border-[#FF9F0A]/30",
  "AWS EC2": "bg-[#FF9F0A]/15 text-[#D97706] dark:text-[#FF9F0A] border border-[#FF9F0A]/30",
  "Gemini API": "bg-[#BF5AF2]/15 text-[#7E22CE] dark:text-[#BF5AF2] border border-[#BF5AF2]/30",
  "Node.js": "bg-[#30D158]/15 text-[#15803D] dark:text-[#30D158] border border-[#30D158]/30",
  Express: "bg-[#30D158]/15 text-[#15803D] dark:text-[#30D158] border border-[#30D158]/30",
  "Express.js": "bg-[#30D158]/15 text-[#15803D] dark:text-[#30D158] border border-[#30D158]/30",
  FastAPI: "bg-[#30D158]/15 text-[#15803D] dark:text-[#30D158] border border-[#30D158]/30",
  Django: "bg-[#30D158]/15 text-[#15803D] dark:text-[#30D158] border border-[#30D158]/30",
  Python: "bg-[#FFD60A]/15 text-[#B45309] dark:text-[#FFD60A] border border-[#FFD60A]/30",
  Swift: "bg-[#FF9500]/15 text-[#D97706] dark:text-[#FF9500] border border-[#FF9500]/30",
  PostgreSQL: "bg-[#5E5CE6]/15 text-[#4338CA] dark:text-[#5E5CE6] border border-[#5E5CE6]/30",
  CockroachDB: "bg-[#5E5CE6]/15 text-[#4338CA] dark:text-[#5E5CE6] border border-[#5E5CE6]/30",
  MySQL: "bg-[#5E5CE6]/15 text-[#4338CA] dark:text-[#5E5CE6] border border-[#5E5CE6]/30",
  Prisma: "bg-[#AF52DE]/15 text-[#7E22CE] dark:text-[#AF52DE] border border-[#AF52DE]/30",
  "Drizzle ORM": "bg-[#AF52DE]/15 text-[#7E22CE] dark:text-[#AF52DE] border border-[#AF52DE]/30",
  MongoDB: "bg-[#34C759]/15 text-[#15803D] dark:text-[#34C759] border border-[#34C759]/30",
  Docker: "bg-[#30B0C7]/15 text-[#0284C7] dark:text-[#30B0C7] border border-[#30B0C7]/30",
  GCP: "bg-[#30B0C7]/15 text-[#0284C7] dark:text-[#30B0C7] border border-[#30B0C7]/30",
  Vercel: "bg-[#30B0C7]/15 text-[#0284C7] dark:text-[#30B0C7] border border-[#30B0C7]/30",
  Clerk: "bg-[#AF52DE]/15 text-[#7E22CE] dark:text-[#AF52DE] border border-[#AF52DE]/30",
  TensorFlow: "bg-[#FF2D55]/15 text-[#BE123C] dark:text-[#FF2D55] border border-[#FF2D55]/30",
  "Torch-Vision": "bg-[#FF2D55]/15 text-[#BE123C] dark:text-[#FF2D55] border border-[#FF2D55]/30",
  CoreML: "bg-[#BF5AF2]/15 text-[#7E22CE] dark:text-[#BF5AF2] border border-[#BF5AF2]/30",
  CNN: "bg-[#FF375F]/15 text-[#BE123C] dark:text-[#FF375F] border border-[#FF375F]/30",
  SLM: "bg-[#BF5AF2]/15 text-[#7E22CE] dark:text-[#BF5AF2] border border-[#BF5AF2]/30",
  Ethereum: "bg-[#00C7BE]/15 text-[#0D9488] dark:text-[#00C7BE] border border-[#00C7BE]/30",
  "Arch Linux": "bg-[#64D2FF]/15 text-[#0066CC] dark:text-[#64D2FF] border border-[#64D2FF]/30",
  Razorpay: "bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30",
}

const appleBadgePalette = [
  "bg-[#0A84FF]/15 text-[#0066CC] dark:text-[#5E9EFF] border border-[#0A84FF]/30",
  "bg-[#30D158]/15 text-[#15803D] dark:text-[#30D158] border border-[#30D158]/30",
  "bg-[#FF9F0A]/15 text-[#B45309] dark:text-[#FF9F0A] border border-[#FF9F0A]/30",
  "bg-[#BF5AF2]/15 text-[#7E22CE] dark:text-[#BF5AF2] border border-[#BF5AF2]/30",
  "bg-[#64D2FF]/15 text-[#0284C7] dark:text-[#64D2FF] border border-[#64D2FF]/30",
  "bg-[#FF375F]/15 text-[#BE123C] dark:text-[#FF375F] border border-[#FF375F]/30",
  "bg-[#5E5CE6]/15 text-[#4338CA] dark:text-[#5E5CE6] border border-[#5E5CE6]/30",
  "bg-[#FFD60A]/15 text-[#B45309] dark:text-[#FFD60A] border border-[#FFD60A]/30",
  "bg-[#30B0C7]/15 text-[#0284C7] dark:text-[#30B0C7] border border-[#30B0C7]/30",
]

function getTechBadgeStyle(tech: string) {
  if (techColors[tech]) return techColors[tech]
  let hash = 0
  for (let i = 0; i < tech.length; i++) {
    hash = tech.charCodeAt(i) + ((hash << 5) - hash)
  }
  return appleBadgePalette[Math.abs(hash) % appleBadgePalette.length]
}

type ProjectCardProps = {
  project: Project
  isDark: boolean
  isSelected: boolean
  onSelect: (id: number) => void
}

function ProjectCard({
  project,
  isDark,
  isSelected,
  onSelect,
}: ProjectCardProps) {
  const DomainIcon = domainIcons[project.domain] || FaCode
  const displayDomains = project.domains || [project.domain]
  const appleTheme = domainAppleColors[project.domain] || defaultAppleColor

  return (
    <div
      onClick={() => onSelect(project.id)}
      className={`group relative rounded-xl border p-4 transition-all cursor-pointer ${
        isSelected
          ? isDark
            ? "bg-[#252830] border-[#0A84FF] ring-1 ring-[#0A84FF]/50"
            : "bg-blue-50/60 border-[#0A84FF] ring-1 ring-[#0A84FF]/50"
          : isDark
          ? "bg-[#222224] border-[#303033] hover:border-[#45454A]"
          : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left & Center: Target Icon + Details */}
        <div className="flex items-start space-x-3.5 flex-1 min-w-0">
          {/* Target Icon Box styled with Apple System Color */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-lg shadow-inner transition-transform duration-200 group-hover:scale-105 ${
              isDark ? appleTheme.boxDark : appleTheme.boxLight
            }`}
          >
            <DomainIcon />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title Row */}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                {project.name}
              </h3>
              <span className="inline-flex items-center rounded-full bg-[#30D158]/15 px-2 py-0.5 text-[10px] font-semibold text-[#30D158]">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-[#30D158]" />
                Compiled
              </span>

              {/* Domain Badges */}
              <div className="flex flex-wrap gap-1">
                {displayDomains.map((d, idx) => {
                  const badgeStyle = (domainAppleColors[d] || defaultAppleColor).badge
                  return (
                    <span
                      key={idx}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${badgeStyle}`}
                    >
                      {d}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Project Description */}
            <p
              className={`mt-1.5 text-xs leading-relaxed ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {project.description}
            </p>

            {/* Technology Stack Tags */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {project.techStack.map((tech, index) => {
                const badgeColor = getTechBadgeStyle(tech)
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
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-end w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-200 dark:border-gray-800">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`flex-1 sm:flex-initial w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-md px-3 py-2 sm:py-1.5 text-xs font-medium transition border ${
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
              className="flex-1 sm:flex-initial w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-md bg-[#0A84FF] hover:bg-blue-500 text-white px-3 py-2 sm:py-1.5 text-xs font-medium shadow-sm transition"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Run Target</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
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

  const nonHobbyProjects = useMemo(() => {
    return filteredProjects
      .filter((p) => !p.hobby)
      .sort((a, b) => a.id - b.id)
  }, [filteredProjects])

  const hobbyProjects = useMemo(() => {
    return filteredProjects
      .filter((p) => p.hobby)
      .sort((a, b) => a.id - b.id)
  }, [filteredProjects])

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
      {/* Xcode Top Toolbar (Responsive for Phone & Desktop) */}
      <div
        className={`flex flex-col md:flex-row h-auto md:h-12 shrink-0 md:items-center justify-between border-b px-3 py-2 md:py-0 gap-2 ${
          isDark
            ? "border-[#2D2D2D] bg-[#252526]"
            : "border-[#E5E5E5] bg-[#E8E8ED]"
        }`}
      >
        {/* Top Row on Phone / Left on Desktop: Build Controls & Scheme */}
        <div className="flex items-center justify-between md:justify-start space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                className="flex h-6 w-8 items-center justify-center rounded bg-[#0A84FF] text-white hover:bg-blue-500 transition-colors shadow-sm"
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
              className={`flex items-center space-x-1.5 rounded px-2 py-1 text-xs font-medium border truncate ${
                isDark
                  ? "bg-[#1E1E1E] border-[#383838] text-gray-200"
                  : "bg-white border-gray-300 text-gray-800"
              }`}
            >
              <FolderGit2 className="h-3.5 w-3.5 text-[#0A84FF] shrink-0" />
              <span className="truncate">AvadhootProjects.xcodeproj</span>
              <span className="text-gray-400 shrink-0">&gt;</span>
              <span className="text-[#30D158] flex items-center font-semibold shrink-0">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Succeeded
              </span>
            </div>
          </div>

          {/* View Toggles on phone (shown right aligned on phone top row) */}
          <div
            className={`md:hidden flex items-center rounded border p-0.5 shrink-0 ${
              isDark ? "border-[#383838] bg-[#1A1A1A]" : "border-gray-300 bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode("targets")}
              className={`p-1 rounded text-xs ${
                viewMode === "targets"
                  ? "bg-[#0A84FF] text-white"
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
                  ? "bg-[#0A84FF] text-white"
                  : "text-gray-400 hover:text-foreground"
              }`}
              title="Compact Table View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Search Input & View Toggles (Desktop right side / Phone 2nd row) */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full md:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter targets or frameworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-md pl-8 pr-3 py-1 text-xs transition focus:outline-none focus:ring-1 focus:ring-[#0A84FF] border ${
                isDark
                  ? "bg-[#1A1A1A] border-[#383838] text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          {/* View Toggles (Desktop only) */}
          <div
            className={`hidden md:flex items-center rounded border p-0.5 ${
              isDark ? "border-[#383838] bg-[#1A1A1A]" : "border-gray-300 bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode("targets")}
              className={`p-1 rounded text-xs ${
                viewMode === "targets"
                  ? "bg-[#0A84FF] text-white"
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
                  ? "bg-[#0A84FF] text-white"
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
        {/* Left Xcode Navigator Sidebar (Visible on md+, hidden on phone) */}
        <div
          className={`hidden md:flex w-56 shrink-0 border-r flex-col justify-between ${
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
                        className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                          isSelected ? "text-white" : category.color
                        }`}
                      />
                      <div className="truncate">
                        <div className="text-xs truncate">{category.label}</div>
                        <div
                          className={`text-[10px] truncate ${
                            isSelected ? "text-blue-100" : "text-gray-400"
                          }`}
                        >
                          {category.subtitle}
                        </div>
                      </div>
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
              <GitBranch className="h-3.5 w-3.5 text-[#0A84FF]" />
              <span>branch: main / dev</span>
            </div>
          </div>
        </div>

        {/* Center Workspace Content Area */}
        <div className="flex-1 w-full overflow-y-auto p-3 sm:p-6">
          {/* Mobile Category Filter Bar (visible only on phone < md) */}
          <div className="md:hidden mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex overflow-x-auto gap-1.5 pb-1 no-scrollbar">
              {filterCategories.map((category) => {
                const Icon = category.icon
                const isSelected = filter === category.id
                const count = countsByCategory[category.id] ?? 0

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setFilter(category.id)}
                    className={`group shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-[#0A84FF] text-white shadow-sm"
                        : isDark
                        ? "bg-[#252526] text-gray-300 border border-[#383838] hover:border-gray-600"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                        isSelected ? "text-white" : category.color
                      }`}
                    />
                    <span>{category.label}</span>
                    <span
                      className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : isDark
                          ? "bg-[#333333] text-gray-400"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section Banner Header */}
          <div className="mb-4 sm:mb-5 flex items-center justify-between">
            <div>
              <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {filterCategories.find((c) => c.id === filter)?.label || "Projects"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Showing {filteredProjects.length} compiled target
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

          {/* Non-Hobby Projects Grid / List */}
          {nonHobbyProjects.length > 0 && (
            <div
              className={
                viewMode === "targets"
                  ? "grid grid-cols-1 gap-4"
                  : "space-y-2.5"
              }
            >
              {nonHobbyProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isDark={isDark}
                  isSelected={selectedProjectId === project.id}
                  onSelect={setSelectedProjectId}
                />
              ))}
            </div>
          )}

          {/* Distinction Line for Hobby Projects */}
          {hobbyProjects.length > 0 && (
            <div
              className={`my-6 flex items-center gap-3 ${
                nonHobbyProjects.length === 0 ? "mt-1 mb-4" : ""
              }`}
            >
              <div
                className={`h-px flex-1 ${
                  isDark ? "bg-[#383838]" : "bg-gray-300"
                }`}
              />
              <div className="flex items-center space-x-2 text-center px-2">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border shadow-sm shrink-0 ${
                    isDark
                      ? "text-gray-200 bg-[#252526] border-[#383838]"
                      : "text-gray-800 bg-gray-100 border-gray-300"
                  }`}
                >
                  Hobby Projects
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  (Projects from here are hobby projects)
                </span>
              </div>
              <div
                className={`h-px flex-1 ${
                  isDark ? "bg-[#383838]" : "bg-gray-300"
                }`}
              />
            </div>
          )}

          {/* Hobby Projects Grid / List */}
          {hobbyProjects.length > 0 && (
            <div
              className={
                viewMode === "targets"
                  ? "grid grid-cols-1 gap-4"
                  : "space-y-2.5"
              }
            >
              {hobbyProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isDark={isDark}
                  isSelected={selectedProjectId === project.id}
                  onSelect={setSelectedProjectId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
