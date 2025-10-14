"use client"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"

type CommandHistory = {
  command: string
  output: string[]
}

export function TerminalApp() {
  const { theme } = useTheme()
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([])
  const [currentCommand, setCurrentCommand] = useState("")
  const [mounted, setMounted] = useState(false)
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    // Display welcome message and skills on mount
    setCommandHistory([
      {
        command: "",
        output: [
          "Welcome to Avadhoot's Terminal",
          "========================================",
          "",
          "💻 Technical Skills:",
          "-------------------",
          "• Languages: Python, JavaScript, TypeScript, Java, C++, SQL",
          "• Frontend: React, Next.js, HTML5, CSS3, Tailwind CSS",
          "• Backend: Node.js, Express, Django, Flask",
          "• Databases: MongoDB, PostgreSQL, MySQL, Firebase",
          "• Tools & Tech: Git, Docker, AWS, REST APIs, GraphQL",
          "• AI/ML: TensorFlow, PyTorch, Scikit-learn, NLP",
          "",
          "Type 'help' for available commands",
          ""
        ]
      }
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [commandHistory])

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentCommand.trim()) return

    const cmd = currentCommand.trim().toLowerCase()
    let output: string[] = []

    switch (cmd) {
      case "help":
        output = [
          "Available commands:",
          "  help       - Show this help message",
          "  skills     - Display technical skills",
          "  about      - About Avadhoot",
          "  contact    - Contact information",
          "  projects   - List of projects",
          "  education  - Educational background",
          "  experience - Work experience",
          "  clear      - Clear the terminal",
          "  whoami     - Display current user",
          "  date       - Display current date and time",
          ""
        ]
        break
      case "skills":
        output = [
          "Technical Skills:",
          "-------------------",
          "• Languages: Python, JavaScript, TypeScript, Java, C++, SQL",
          "• Frontend: React, Next.js, HTML5, CSS3, Tailwind CSS",
          "• Backend: Node.js, Express, Django, Flask",
          "• Databases: MongoDB, PostgreSQL, MySQL, Firebase",
          "• Tools & Tech: Git, Docker, AWS, REST APIs, GraphQL",
          "• AI/ML: TensorFlow, PyTorch, Scikit-learn, NLP",
          ""
        ]
        break
      case "about":
        output = [
          "About Avadhoot Ganesh Mahadik",
          "==============================",
          "Passionate Full-Stack Developer and AI Enthusiast",
          "Building innovative solutions with modern technologies",
          "Always learning, always growing 🚀",
          ""
        ]
        break
      case "contact":
        output = [
          "Contact Information:",
          "-------------------",
          "• GitHub: github.com/Avadhoot1905",
          "• LinkedIn: linkedin.com/in/avadhoot-mahadik-125362295/",
          "• LeetCode: leetcode.com/u/arcsmo19/",
          "• Medium: medium.com/@arcsmo19",
          ""
        ]
        break
      case "projects":
        output = [
          "Notable Projects:",
          "----------------",
          "Open the Projects app to see detailed information",
          "about my work and contributions.",
          ""
        ]
        break
      case "education":
        output = [
          "Education:",
          "---------",
          "Open the Education app for detailed information",
          "about my academic background.",
          ""
        ]
        break
      case "experience":
        output = [
          "Work Experience:",
          "---------------",
          "Open the Experience app for detailed information",
          "about my professional journey.",
          ""
        ]
        break
      case "clear":
        setCommandHistory([])
        setCurrentCommand("")
        return
      case "whoami":
        output = ["avadhoot@portfolio:~$", "Avadhoot Ganesh Mahadik", ""]
        break
      case "date":
        output = [new Date().toString(), ""]
        break
      case "ls":
        output = [
          "About.app       Experience.app  Photos.app",
          "Education.app   Finder.app      Projects.app",
          "Messages.app    Safari.app      Terminal.app",
          ""
        ]
        break
      case "pwd":
        output = ["/Users/avadhoot/portfolio", ""]
        break
      default:
        output = [`command not found: ${currentCommand}`, "Type 'help' for available commands", ""]
    }

    setCommandHistory([...commandHistory, { command: currentCommand, output }])
    setCurrentCommand("")
  }

  const handleTerminalClick = () => {
    inputRef.current?.focus()
  }

  if (!mounted) return null

  return (
    <div
      className="h-full w-full bg-black text-green-400 font-mono text-sm overflow-hidden flex flex-col cursor-text"
      onClick={handleTerminalClick}
      style={{ fontFamily: "'Courier New', Courier, monospace" }}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {commandHistory.map((entry, index) => (
          <div key={index}>
            {entry.command && (
              <div className="flex items-center space-x-2">
                <span className="text-green-500">avadhoot@portfolio:~$</span>
                <span className="text-green-300">{entry.command}</span>
              </div>
            )}
            {entry.output.map((line, lineIndex) => (
              <div key={lineIndex} className="text-green-400 pl-0">
                {line}
              </div>
            ))}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      <form onSubmit={handleCommand} className="border-t border-green-900 p-4">
        <div className="flex items-center space-x-2">
          <span className="text-green-500">avadhoot@portfolio:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            className="flex-1 bg-transparent text-green-300 outline-none border-none caret-green-400"
            autoFocus
            spellCheck={false}
          />
        </div>
      </form>
    </div>
  )
}
