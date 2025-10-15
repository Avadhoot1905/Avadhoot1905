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
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Display welcome message and skills on mount
    setCommandHistory([
      {
        command: "",
        output: [
          "Welcome to Avadhoot's Terminal",
          "==============================",
          "",
          "💻 Technical Skills:",
          "• Python, JavaScript, TypeScript",
          "• React, Next.js, Tailwind CSS",
          "• Node.js, Express, Django",
          "• MongoDB, PostgreSQL, MySQL",
          "• Git, Docker, AWS, REST APIs",
          "• TensorFlow, PyTorch, ML/AI",
          "",
          "Type 'help' for commands",
          ""
        ]
      }
    ])

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [commandHistory])

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Helper function to highlight command names in output
  const highlightCommands = (text: string) => {
    const commands = ['help', 'skills', 'about', 'contact', 'projects', 'education', 'experience', 'clear', 'whoami', 'date', 'ls', 'pwd']
    const parts: React.ReactNode[] = []
    let remainingText = text
    let key = 0

    while (remainingText.length > 0) {
      let foundCommand = false
      
      for (const cmd of commands) {
        const index = remainingText.toLowerCase().indexOf(cmd)
        if (index !== -1) {
          // Add text before command
          if (index > 0) {
            parts.push(<span key={key++}>{remainingText.substring(0, index)}</span>)
          }
          // Add highlighted command
          parts.push(
            <span key={key++} className="text-yellow-400">
              {remainingText.substring(index, index + cmd.length)}
            </span>
          )
          remainingText = remainingText.substring(index + cmd.length)
          foundCommand = true
          break
        }
      }
      
      if (!foundCommand) {
        parts.push(<span key={key++}>{remainingText}</span>)
        break
      }
    }
    
    return parts.length > 0 ? <>{parts}</> : <>{text}</>
  }

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Get value from ref instead of state
    const commandText = inputRef.current?.value?.trim() || ''
    
    if (!commandText) return

    const cmd = commandText.toLowerCase()
    let output: string[] = []

    switch (cmd) {
      case "help":
        output = isMobile ? [
          "Commands:",
          "• help - Show commands",
          "• skills - Tech skills",
          "• about - About me",
          "• contact - Contact info",
          "• projects - Projects",
          "• education - Education",
          "• experience - Experience",
          "• clear - Clear screen",
          "• whoami - Current user",
          "• date - Date/time",
          ""
        ] : [
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
        output = isMobile ? [
          "Technical Skills:",
          "• Python, JS, TypeScript",
          "• React, Next.js, Tailwind",
          "• Node.js, Express, Django",
          "• MongoDB, PostgreSQL",
          "• Git, Docker, AWS",
          "• TensorFlow, PyTorch",
          ""
        ] : [
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
        output = isMobile ? [
          "About Avadhoot",
          "==============",
          "Full-Stack Developer",
          "AI Enthusiast 🚀",
          "Building innovative",
          "solutions",
          ""
        ] : [
          "About Avadhoot Ganesh Mahadik",
          "==============================",
          "Passionate Full-Stack Developer and AI Enthusiast",
          "Building innovative solutions with modern technologies",
          "Always learning, always growing 🚀",
          ""
        ]
        break
      case "contact":
        output = isMobile ? [
          "Contact:",
          "• GitHub: Avadhoot1905",
          "• LinkedIn: /avadhoot-m..",
          "• LeetCode: arcsmo19",
          "• Medium: @arcsmo19",
          ""
        ] : [
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
        output = isMobile ? [
          "Projects:",
          "Open Projects app",
          "for details",
          ""
        ] : [
          "Notable Projects:",
          "----------------",
          "Open the Projects app to see detailed information",
          "about my work and contributions.",
          ""
        ]
        break
      case "education":
        output = isMobile ? [
          "Education:",
          "Open Education app",
          "for details",
          ""
        ] : [
          "Education:",
          "---------",
          "Open the Education app for detailed information",
          "about my academic background.",
          ""
        ]
        break
      case "experience":
        output = isMobile ? [
          "Experience:",
          "Open Experience app",
          "for details",
          ""
        ] : [
          "Work Experience:",
          "---------------",
          "Open the Experience app for detailed information",
          "about my professional journey.",
          ""
        ]
        break
      case "clear":
        setCommandHistory([])
        // Clear input directly
        if (inputRef.current) {
          inputRef.current.value = ''
        }
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
        output = [`command not found: ${commandText}`, "Type 'help' for available commands", ""]
    }

    setCommandHistory([...commandHistory, { command: commandText, output }])
    
    // Clear input directly
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleTerminalClick = (e: React.MouseEvent) => {
    e.preventDefault()
    inputRef.current?.focus()
  }

  if (!mounted) return null

  return (
    <div
      className={`h-full w-full bg-black text-green-400 font-mono overflow-hidden flex flex-col cursor-text ${
        isMobile ? 'text-xs' : 'text-sm'
      }`}
      onClick={handleTerminalClick}
      style={{ fontFamily: "'Courier New', Courier, monospace" }}
    >
      <div 
        className={`flex-1 overflow-y-auto space-y-1 ${
          isMobile ? 'p-2 text-[11px]' : 'p-4 space-y-2'
        }`}
        onClick={handleTerminalClick}
      >
        {commandHistory.map((entry, index) => (
          <div key={index} className={isMobile ? 'space-y-0.5' : ''}>
            {entry.command && (
              <div className={`flex items-start ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
                <span className={`text-cyan-400 ${isMobile ? 'text-[10px] flex-shrink-0' : ''}`}>
                  {isMobile ? '$' : 'avadhoot@portfolio:~$'}
                </span>
                <span className={`text-yellow-400 ${isMobile ? 'break-all' : ''}`}>
                  {entry.command}
                </span>
              </div>
            )}
            {entry.command && <div className="h-1"></div>}
            {entry.output.length > 0 && (
              <>
                {entry.output.map((line, lineIndex) => (
                  <div 
                    key={lineIndex} 
                    className={`text-green-400 ${
                      isMobile ? 'pl-0 leading-tight break-words' : 'pl-0'
                    }`}
                  >
                    {highlightCommands(line)}
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      <form 
        onSubmit={handleCommand} 
        className={`border-t border-green-900 ${
          isMobile ? 'p-2' : 'p-4'
        } relative z-10`}
      >
        <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
          <span className={`text-cyan-400 flex-shrink-0 ${
            isMobile ? 'text-[10px]' : ''
          }`}>
            {isMobile ? '$' : 'avadhoot@portfolio:~$'}
          </span>
          <input
            ref={inputRef}
            type="text"
            className={`flex-1 bg-transparent text-green-300 outline-none border-none caret-green-400 focus:outline-none focus:ring-0 ${
              isMobile ? 'text-xs' : ''
            }`}
            autoFocus
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            style={{ WebkitAppearance: 'none' }}
          />
        </div>
      </form>
    </div>
  )
}
