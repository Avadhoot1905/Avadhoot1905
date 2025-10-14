"use client"

import { FaCode, FaGithub, FaExternalLinkAlt, FaGlobe, FaMobile, FaLaptopCode } from "react-icons/fa"
import { useTheme } from "next-themes"
import { useState } from "react"
import { projects as projectsData, type Project } from "@/data/projects"

const domainIcons = {
  web: FaGlobe,
  app: FaMobile,
  system: FaLaptopCode,
}

const domainColors = {
  web: "text-blue-500",
  app: "text-green-500",
  system: "text-purple-500",
}

const techColors: { [key: string]: string } = {
  "Next.js": "bg-black text-white",
  "React": "bg-blue-600 text-white",
  "TypeScript": "bg-blue-700 text-white",
  "Tailwind CSS": "bg-cyan-500 text-white",
  "Node.js": "bg-green-600 text-white",
  "Express": "bg-gray-700 text-white",
  "MongoDB": "bg-green-500 text-white",
  "Docker": "bg-blue-500 text-white",
  "Python": "bg-yellow-600 text-white",
  "Firebase": "bg-orange-500 text-white",
  "PostgreSQL": "bg-blue-800 text-white",
  "Redis": "bg-red-600 text-white",
}

export function ProjectsApp() {
  const { theme } = useTheme()
  const [filter, setFilter] = useState<"all" | "web" | "app" | "system">("all")
  const projects = projectsData

  const filteredProjects = filter === "all" 
    ? projects 
    : projects.filter(p => p.domain === filter)

  return (
    <div className="p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-2">My Projects</h1>
        <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          {projects.length} projects • {filteredProjects.length} showing
        </p>
        
        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("web")}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === "web"
                ? "bg-blue-600 text-white"
                : theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🌐 Web
          </button>
          <button
            onClick={() => setFilter("app")}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === "app"
                ? "bg-blue-600 text-white"
                : theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📱 App
          </button>
          <button
            onClick={() => setFilter("system")}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === "system"
                ? "bg-blue-600 text-white"
                : theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            💻 System
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProjects.map((project) => {
          const DomainIcon = domainIcons[project.domain]
          return (
            <div
              key={project.id}
              className={`p-4 rounded-lg transition hover:scale-[1.02] ${
                theme === "dark" ? "bg-gray-800 hover:bg-gray-750" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DomainIcon className={`${domainColors[project.domain]} text-lg`} />
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                </div>
                <div className="flex gap-2">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded transition ${
                        theme === "dark"
                          ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                          : "hover:bg-gray-300 text-gray-600 hover:text-black"
                      }`}
                      title="View on GitHub"
                    >
                      <FaGithub className="text-sm" />
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded transition ${
                        theme === "dark"
                          ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                          : "hover:bg-gray-300 text-gray-600 hover:text-black"
                      }`}
                      title="View Live"
                    >
                      <FaExternalLinkAlt className="text-sm" />
                    </a>
                  )}
                </div>
              </div>
              
              <p className={`mb-3 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-xs rounded font-medium ${
                      techColors[tech] || "bg-gray-600 text-white"
                    }`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
