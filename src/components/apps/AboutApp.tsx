"use client"

import { useEffect } from "react"
import { FaUser, FaCommentDots, FaTerminal } from "react-icons/fa"
import { useTheme } from "next-themes"

type AboutAppProps = {
  onOpenApp?: (appId: string, params?: { filter?: string; command?: string }) => void
}

export function AboutApp({ onOpenApp }: AboutAppProps = {}) {
  const { theme } = useTheme()

  useEffect(() => {
    console.log('✅ AboutApp mounted/updated')
    console.log('  onOpenApp type:', typeof onOpenApp)
    console.log('  onOpenApp exists?', !!onOpenApp)
    console.log('  onOpenApp value:', onOpenApp)
  }, [onOpenApp])

  const handleMessagesClick = () => {
    console.log('Messages button clicked!')
    console.log('onOpenApp exists?', !!onOpenApp)
    console.log('onOpenApp value:', onOpenApp)
    if (onOpenApp) {
      console.log('Calling onOpenApp("messages")')
      onOpenApp("messages")
    } else {
      console.error('onOpenApp is undefined!')
    }
  }

  const handleContactClick = () => {
    console.log('Contact button clicked!')
    console.log('onOpenApp exists?', !!onOpenApp)
    console.log('onOpenApp value:', onOpenApp)
    if (onOpenApp) {
      console.log('Calling onOpenApp("terminal", { command: "contact" })')
      onOpenApp("terminal", { command: "contact" })
    } else {
      console.error('onOpenApp is undefined!')
    }
  }

  return (
    <div className="p-6 overflow-y-auto">
      <div className="flex items-center mb-6">
        <img 
          src="/favicon.ico" 
          alt="Profile" 
          className="w-24 h-24 rounded-full mr-6 object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold mb-2">Avadhoot Ganesh Mahadik</h1>
          <p className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Systems Architect
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          I&apos;m a Computer Science student passionate about backend engineering and system architecture. I&apos;m fascinated by how well-designed systems scale, evolve, and remain maintainable over time. I enjoy working on the invisible parts of software — APIs, data models, infrastructure decisions, and the architectural tradeoffs that make or break a system.
        </p>
        <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          I&apos;m especially curious about serverless systems, distributed components, and designing clean interfaces between services. Beyond writing code, I focus on understanding why solutions work — from database behavior and ORM abstractions to deployment pipelines and cloud networking. I find the most interesting problems lie in balancing simplicity with scalability.
        </p>
        <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          Currently, I&apos;m strengthening my backend fundamentals, deepening my understanding of production systems, and building projects that prioritize clarity, reliability, and thoughtful design. I&apos;m open to collaborating on backend systems, architecture discussions, and implementations that go beyond surface-level functionality.
        </p>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleMessagesClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              theme === "dark"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            } shadow-md hover:shadow-lg transform hover:scale-105`}
          >
            <FaCommentDots className="text-lg" />
            Talk to me (AI)
          </button>
          
          <button
            onClick={handleContactClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            } shadow-md hover:shadow-lg transform hover:scale-105`}
          >
            <FaTerminal className="text-lg" />
            Contact
          </button>
        </div>
      </div>
    </div>
  )
}
