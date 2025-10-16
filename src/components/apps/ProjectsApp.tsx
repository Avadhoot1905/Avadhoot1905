"use client"

import { FaCode, FaGithub, FaExternalLinkAlt, FaGlobe, FaMobile, FaLaptopCode } from "react-icons/fa"
import { useTheme } from "next-themes"
import { useState } from "react"
import { projects as projectsData, type Project } from "@/data/projects"

const domainIcons: { [key: string]: any } = {
  "Website Development": FaGlobe,
  "App Development": FaMobile,
  "system": FaLaptopCode,
  "Extension Development": FaCode,
  "Data Science": FaCode,
  "Machine Learning": FaCode,
}

const domainColors: { [key: string]: string } = {
  "Website Development": "text-blue-500",
  "App Development": "text-green-500",
  "system": "text-purple-500",
  "Extension Development": "text-orange-500",
  "Data Science": "text-red-500",
  "Machine Learning": "text-pink-500",
}

const techColors: { [key: string]: string } = {
  "Next.js": "bg-black text-white",
  "React": "bg-blue-600 text-white",
  "React.js": "bg-blue-600 text-white",
  "TypeScript": "bg-blue-700 text-white",
  "Tailwind CSS": "bg-cyan-500 text-white",
  "TailwindCSS": "bg-cyan-500 text-white",
  "Node.js": "bg-green-600 text-white",
  "Express": "bg-gray-700 text-white",
  "Express.js": "bg-gray-700 text-white",
  "MongoDB": "bg-green-500 text-white",
  "Docker": "bg-blue-500 text-white",
  "Python": "bg-yellow-600 text-white",
  "Firebase": "bg-orange-500 text-white",
  "PostgreSQL": "bg-blue-800 text-white",
  "CockroachDB": "bg-blue-900 text-white",
  "Redis": "bg-red-600 text-white",
  "JavaScript": "bg-yellow-500 text-black",
  "Swift": "bg-orange-600 text-white",
  "Bash": "bg-gray-800 text-white",
  "CSS": "bg-blue-400 text-white",
  "Prisma": "bg-indigo-600 text-white",
  "FastAPI": "bg-teal-600 text-white",
  "GCP": "bg-blue-600 text-white",
  "Vue.js": "bg-green-500 text-white",
  "Drizzle ORM": "bg-green-700 text-white",
  "Clerk": "bg-purple-600 text-white",
  "Gemini API": "bg-blue-500 text-white",
  "Chrome Website Development Extensions": "bg-red-500 text-white",
  "Razorpay": "bg-blue-700 text-white",
  "Fuse.js": "bg-orange-400 text-white",
  "React Icons": "bg-cyan-600 text-white",
  "beautifulsoup4": "bg-yellow-700 text-white",
  "requests": "bg-green-600 text-white",
  "pandas": "bg-indigo-500 text-white",
  "Torch-Vision": "bg-red-700 text-white",
  "TensorFlow": "bg-orange-500 text-white",
  "CoreML": "bg-gray-700 text-white",
  "Arch Linux": "bg-blue-600 text-white",
  "rsync": "bg-gray-600 text-white",
  "Threading": "bg-purple-500 text-white",
  "Syncthing": "bg-blue-500 text-white",
}

export function ProjectsApp() {
  const { theme } = useTheme()
  const [filter, setFilter] = useState<string>("all")
  const projects = projectsData

  const filteredProjects = filter === "all" 
    ? projects 
    : projects.filter(p => {
        // Check if project has multiple domains
        if (p.domains && p.domains.length > 0) {
          return p.domains.includes(filter as any)
        }
        // Fall back to single domain check
        return p.domain === filter
      })

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
            onClick={() => setFilter("Website Development")}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === "Website Development"
                ? "bg-blue-600 text-white"
                : theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🌐 Web
          </button>
          <button
            onClick={() => setFilter("App Development")}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === "App Development"
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
          <button
            onClick={() => setFilter("Extension Development")}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === "Extension Development"
                ? "bg-blue-600 text-white"
                : theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🧩 Extension
          </button>
          <button
            onClick={() => setFilter("Data Science")}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === "Data Science"
                ? "bg-blue-600 text-white"
                : theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📊 Data Science
          </button>
          <button
            onClick={() => setFilter("Machine Learning")}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === "Machine Learning"
                ? "bg-blue-600 text-white"
                : theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🤖 ML
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProjects.map((project) => {
          const DomainIcon = domainIcons[project.domain]
          const displayDomains = project.domains || [project.domain]
          return (
            <div
              key={project.id}
              className={`p-4 rounded-lg transition hover:scale-[1.02] ${
                theme === "dark" ? "bg-gray-800 hover:bg-gray-750" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <DomainIcon className={`${domainColors[project.domain]} text-lg`} />
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                  </div>
                  {displayDomains.length > 1 && (
                    <div className="flex gap-1">
                      {displayDomains.map((d, idx) => {
                        const Icon = domainIcons[d]
                        return (
                          <span 
                            key={idx}
                            className={`text-xs px-2 py-0.5 rounded ${
                              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                            }`}
                            title={d}
                          >
                            <Icon className={`${domainColors[d]} inline-block`} />
                          </span>
                        )
                      })}
                    </div>
                  )}
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
