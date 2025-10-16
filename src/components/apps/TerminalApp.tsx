"use client"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"

type CommandHistory = {
  command: string
  output: string[]
}

type TerminalAppProps = {
  onClose?: () => void
  onOpenApp?: (appId: string) => void
}

export function TerminalApp({ onClose, onOpenApp }: TerminalAppProps = {}) {
  const { theme } = useTheme()
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([])
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [commandCache, setCommandCache] = useState<string[]>([])
  const [typingText, setTypingText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
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
          "• C/C++, Java, Python, JavaScript, TypeScript, Golang, Swift, Shell",
          "• React, Next.js, Tailwind CSS",
          "• Node.js, Express.js",
          "• CockroachDB, PostgreSQL, SQLite",
          "• Git, Docker, Kubernetes, REST APIs, Fast API, GitHub",
          "• BeautifulSoup, CoreML, Pandas, NumPy",
          "",
          ""
        ]
      }
    ])

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Typing animation effect
  useEffect(() => {
    const texts = [
      "Type 'help' for commands",
      "Type 'navigate' for portal guide"
    ]
    let currentTextIndex = 0
    let currentCharIndex = 0
    let isDeleting = false
    let timeoutId: NodeJS.Timeout

    const type = () => {
      const currentText = texts[currentTextIndex]
      
      if (isDeleting) {
        setTypingText(currentText.substring(0, currentCharIndex - 1))
        currentCharIndex--
        
        if (currentCharIndex === 0) {
          isDeleting = false
          currentTextIndex = (currentTextIndex + 1) % texts.length
          timeoutId = setTimeout(type, 500) // Pause before typing next text
        } else {
          timeoutId = setTimeout(type, 30) // Backspace speed
        }
      } else {
        setTypingText(currentText.substring(0, currentCharIndex + 1))
        currentCharIndex++
        
        if (currentCharIndex === currentText.length) {
          isDeleting = true
          timeoutId = setTimeout(type, 2000) // Pause before deleting
        } else {
          timeoutId = setTimeout(type, 100) // Typing speed
        }
      }
    }

    timeoutId = setTimeout(type, 1000) // Initial delay

    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [commandHistory])

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Helper function to highlight command names in output
  const highlightCommands = (text: string) => {
    const commands = ['help', 'skills', 'about', 'contact', 'projects', 'education', 'experience', 'clear', 'whoami', 'date', 'ls', 'pwd', 'navigate', 'exit']
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
          "• navigate - Portal guide",
          "• skills - Tech skills",
          "• about - About me",
          "• contact - Contact info",
          "• projects - Projects",
          "• education - Education",
          "• experience - Experience",
          "• clear - Clear screen",
          "• exit - Close terminal",
          "• whoami - Current user",
          "• date - Date/time",
          ""
        ] : [
          "Available commands:",
          "  help       - Show this help message",
          "  navigate   - Guide to the portfolio OS",
          "  skills     - Display technical skills",
          "  about      - About Avadhoot",
          "  contact    - Contact information",
          "  projects   - List of projects",
          "  education  - Educational background",
          "  experience - Work experience",
          "  clear      - Clear the terminal",
          "  exit       - Close the terminal window",
          "  whoami     - Display current user",
          "  date       - Display current date and time",
          ""
        ]
        break
      case "navigate":
        output = isMobile ? [
          "Portfolio OS Guide:",
          "=================",
          "",
          "📁 Finder",
          "Browse all apps & info",
          "",
          "🌐 Safari",
          "Visit external links",
          "",
          "💬 Messages",
          "Chat with AI assistant",
          "",
          "📸 Photos",
          "View photo gallery",
          "",
          "👤 About Me",
          "Personal background",
          "",
          "🚀 Projects",
          "Portfolio projects",
          "",
          "🎓 Education",
          "Academic journey",
          "",
          "💼 Experience",
          "Work experience",
          "",
          "⌨️ Terminal",
          "Command-line interface",
          "",
          "� Gmail",
          "Send email",
          "",
          "�🔗 GitHub",
          "Code repositories",
          "",
          "💼 LinkedIn",
          "Professional profile",
          "",
          "🧩 LeetCode",
          "Coding challenges",
          "",
          "✍️ Medium",
          "Blog & articles",
          ""
        ] : [
          "Portfolio OS - Navigation Guide",
          "================================",
          "",
          "Welcome to Avadhoot's interactive portfolio! This is a macOS/iOS-inspired",
          "web experience. Click on any app icon to explore different sections.",
          "",
          "Available Applications:",
          "----------------------",
          "",
          "📁 Finder        - Browse and navigate through all available apps and information",
          "🌐 Safari        - Access external links and web resources",
          "💬 Messages      - Interactive AI-powered chat assistant to learn more about me",
          "📸 Photos        - View photo gallery and visual content",
          "👤 About Me      - Personal background, story, and introduction",
          "🚀 Projects      - Showcase of portfolio projects and technical work",
          "🎓 Education     - Academic background and educational journey",
          "💼 Experience    - Professional work experience and career history",
          "⌨️ Terminal      - Command-line interface for quick information access",
          "",
          "Social & Professional Links (in Dock):",
          "--------------------------------------",
          "",
          "� Gmail         - Send me an email at arcsmo19@gmail.com",
          "�🔗 GitHub        - View my code repositories and open-source contributions",
          "💼 LinkedIn      - Connect professionally and view career details",
          "🧩 LeetCode      - Check out my coding challenge solutions and stats",
          "✍️ Medium        - Read my technical articles and blog posts",
          "",
          "Tip: Use 'help' to see available terminal commands!",
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
      case "contact":
        output = isMobile ? [
          "Contact:",
          "• Gmail: arcsmo19@gmail.com",
          "• GitHub: Avadhoot1905",
          "• LinkedIn: /avadhoot-m..",
          "• LeetCode: arcsmo19",
          "• Medium: @arcsmo19",
          ""
        ] : [
          "Contact Information:",
          "-------------------",
          "• Gmail: arcsmo19@gmail.com",
          "• GitHub: github.com/Avadhoot1905",
          "• LinkedIn: linkedin.com/in/avadhoot-mahadik-125362295/",
          "• LeetCode: leetcode.com/u/arcsmo19/",
          "• Medium: medium.com/@arcsmo19",
          ""
        ]
        break
      case "projects":
        if (onOpenApp) {
          onOpenApp("projects")
          output = ["Displayed in the Projects app", ""]
        } else {
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
        }
        break
      case "education":
        if (onOpenApp) {
          onOpenApp("education")
          output = ["Displayed in the Education app", ""]
        } else {
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
        }
        break
      case "experience":
        if (onOpenApp) {
          onOpenApp("experience")
          output = ["Displayed in the Experience app", ""]
        } else {
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
        }
        break
      case "about":
        if (onOpenApp) {
          onOpenApp("about")
          output = ["Displayed in the About Me app", ""]
        } else {
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
        }
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
      case "exit":
        if (onClose) {
          onClose()
        } else {
          output = ["Terminal window cannot be closed from this context", ""]
        }
        return
      default:
        output = [`command not found: ${commandText}`, "Type 'help' for available commands", ""]
    }

    setCommandHistory([...commandHistory, { command: commandText, output }])
    
    // Add to command cache for history navigation
    setCommandCache([...commandCache, commandText])
    setHistoryIndex(-1)
    
    // Clear input directly
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandCache.length === 0) return
      
      const newIndex = historyIndex === -1 
        ? commandCache.length - 1 
        : Math.max(0, historyIndex - 1)
      
      setHistoryIndex(newIndex)
      if (inputRef.current) {
        inputRef.current.value = commandCache[newIndex]
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (commandCache.length === 0 || historyIndex === -1) return
      
      const newIndex = historyIndex + 1
      
      if (newIndex >= commandCache.length) {
        setHistoryIndex(-1)
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      } else {
        setHistoryIndex(newIndex)
        if (inputRef.current) {
          inputRef.current.value = commandCache[newIndex]
        }
      }
    }
  }

  const handleTerminalClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsTyping(false)
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
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              className={`w-full bg-transparent outline-none border-none focus:outline-none focus:ring-0 relative z-10 ${
                isMobile ? 'text-xs' : ''
              }`}
              onKeyDown={handleKeyDown}
              onClick={() => setIsTyping(false)}
              autoFocus
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              style={{ 
                WebkitAppearance: 'none',
                color: isTyping ? 'transparent' : '#86efac',
                caretColor: isTyping ? 'transparent' : '#4ade80',
              }}
            />
            {isTyping && !inputRef.current?.value && (
              <div 
                className={`absolute left-0 top-0 text-green-500 pointer-events-none ${
                  isMobile ? 'text-xs' : ''
                }`}
              >
                {typingText}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
