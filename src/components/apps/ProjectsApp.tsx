"use client"

import { FaCode } from "react-icons/fa"
import { useTheme } from "next-themes"

export function ProjectsApp() {
  const { theme } = useTheme()

  return (
    <div className="p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">My Projects</h1>
      <div className="grid gap-6">
        <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
          <div className="flex items-center mb-3">
            <FaCode className="text-green-500 mr-2" />
            <h3 className="text-lg font-semibold">Portfolio Website</h3>
          </div>
          <p className={`mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            A responsive portfolio website built with Next.js and Tailwind CSS
          </p>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">Next.js</span>
            <span className="px-2 py-1 bg-cyan-500 text-white text-xs rounded">Tailwind</span>
          </div>
        </div>
        <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
          <div className="flex items-center mb-3">
            <FaCode className="text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold">E-commerce Platform</h3>
          </div>
          <p className={`mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Full-stack e-commerce solution with React, Node.js, and MongoDB
          </p>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">React</span>
            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Node.js</span>
            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">MongoDB</span>
          </div>
        </div>
      </div>
    </div>
  )
}
