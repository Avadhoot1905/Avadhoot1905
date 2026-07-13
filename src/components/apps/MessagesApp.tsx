"use client"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  sendMessageWithHistory,
  clearChatHistory,
  getUserChatHistory,
} from "@/lib/chat-api"
import {
  FaUndo,
  FaSearch,
  FaEdit,
  FaVideo,
  FaPhoneAlt,
  FaInfoCircle,
  FaSmile,
  FaImage,
  FaPlus,
  FaArrowUp,
  FaTimes,
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaFileAlt,
  FaMagic,
} from "react-icons/fa"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type MessagesAppProps = {
  onOpenApp?: (appId: string, params?: { filter?: string }) => void
}

type Contact = {
  id: string
  name: string
  roleSubtitle: string
  avatar: string
  status: string
  lastMessage: string
  time: string
  unread?: boolean
  suggestions: string[]
}

const CONTACTS: Contact[] = [
  {
    id: "avadhoot",
    name: "Avadhoot Ganesh Mahadik",
    roleSubtitle: "Primary AI Assistant • Active now",
    avatar: "/favicon.ico",
    status: "Active now",
    lastMessage: "Hi! I'm Avadhoot Mahadik. Ask me anything!",
    time: "Now",
    suggestions: [
      "Tell me about your experience at QNu Labs 💼",
      "What are your top projects? 🚀",
      "What is your technical stack? ⚡",
      "How can we schedule an interview? 📅",
    ],
  },
]

function getSessionId(): string {
  let sessionId = sessionStorage.getItem("chat-session-id")

  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`
    sessionStorage.setItem("chat-session-id", sessionId)
  }

  return sessionId
}

export function MessagesApp({ onOpenApp }: MessagesAppProps = {}) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [isMobile, setIsMobile] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [showMobileNotice, setShowMobileNotice] = useState(true)
  const [activeContactId, setActiveContactId] = useState<string>("avadhoot")
  const [showInspector, setShowInspector] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Avadhoot Mahadik. Feel free to ask me anything!",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [typingMessage, setTypingMessage] = useState<string>("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const activeContact =
    CONTACTS.find((c) => c.id === activeContactId) ?? CONTACTS[0]

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const initSession = async () => {
      const id = getSessionId()
      setSessionId(id)

      const timeoutId = setTimeout(() => {
        setIsLoadingHistory(false)
      }, 5000)

      try {
        const history = await getUserChatHistory(id)

        if (history && history.length > 0) {
          const loadedMessages: Message[] = history.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: new Date(),
          }))

          setMessages([
            {
              role: "assistant",
              content: "Hi! I'm Avadhoot Mahadik. Feel free to ask me anything!",
              timestamp: new Date(),
            },
            ...loadedMessages,
          ])
        }
      } catch (error) {
        console.error("Error loading chat history:", error)
      } finally {
        clearTimeout(timeoutId)
        setIsLoadingHistory(false)
      }
    }

    initSession()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, typingMessage])

  const sendPromptText = async (promptText: string) => {
    if (!promptText.trim() || isLoading || isLoadingHistory || isTyping) return

    const userMessage: Message = {
      role: "user",
      content: promptText.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await sendMessageWithHistory(
        sessionId,
        promptText.trim()
      )

      setIsLoading(false)
      setIsTyping(true)

      const cachedFullResponse = String(response)
      let cleanResponse = cachedFullResponse
      let appToOpen: string | null = null
      let projectFilter: string | undefined = undefined

      const filteredProjectMarkers = [
        { pattern: "[OPEN:PROJECTS:Website Development]", app: "projects", filter: "Website Development" },
        { pattern: "[OPEN:PROJECTS:App Development]", app: "projects", filter: "App Development" },
        { pattern: "[OPEN:PROJECTS:Machine Learning]", app: "projects", filter: "Machine Learning" },
        { pattern: "[OPEN:PROJECTS:Data Science]", app: "projects", filter: "Data Science" },
        { pattern: "[OPEN:PROJECTS:Extension Development]", app: "projects", filter: "Extension Development" },
        { pattern: "[OPEN:PROJECTS:system]", app: "projects", filter: "system" },
      ]

      for (const { pattern, app, filter } of filteredProjectMarkers) {
        if (cleanResponse.includes(pattern)) {
          cleanResponse = cleanResponse.replace(pattern, "").trim()
          appToOpen = app
          projectFilter = filter
          break
        }
      }

      if (!appToOpen) {
        const generalMarkers: Record<string, string> = {
          "[OPEN:EDUCATION]": "education",
          "[OPEN:EXPERIENCE]": "experience",
          "[OPEN:PROJECTS]": "projects",
        }

        for (const [marker, appId] of Object.entries(generalMarkers)) {
          if (cleanResponse.includes(marker)) {
            cleanResponse = cleanResponse.replace(marker, "").trim()
            appToOpen = appId
            break
          }
        }
      }

      const fullMessage = cleanResponse
      let currentIndex = 0
      setTypingMessage("")

      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }

      typingIntervalRef.current = setInterval(() => {
        if (currentIndex < fullMessage.length) {
          const chunkSize = Math.floor(Math.random() * 3) + 2
          const nextIndex = Math.min(
            currentIndex + chunkSize,
            fullMessage.length
          )
          setTypingMessage(fullMessage.substring(0, nextIndex))
          currentIndex = nextIndex
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current)
          }

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: fullMessage,
              timestamp: new Date(),
            },
          ])
          setIsTyping(false)
          setTypingMessage("")

          if (appToOpen && onOpenApp) {
            setTimeout(() => {
              if (projectFilter) {
                onOpenApp(appToOpen, { filter: projectFilter })
              } else {
                onOpenApp(appToOpen)
              }
            }, 300)
          }
        }
      }, 12)
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputRef.current) return
    const text = inputRef.current.value
    inputRef.current.value = ""
    sendPromptText(text)
  }

  const handleClearChat = async () => {
    if (!sessionId) return

    try {
      await clearChatHistory(sessionId)
      setMessages([
        {
          role: "assistant",
          content: "Hi! I'm Avadhoot Mahadik. Feel free to ask me anything!",
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error("Error clearing chat:", error)
    }
  }

  const filteredContacts = CONTACTS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roleSubtitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div
      className={`flex h-full select-none font-sans overflow-hidden ${isDark ? "bg-[#1E1E1E] text-[#D4D4D4]" : "bg-[#F5F5F7] text-[#1D1D1F]"
        }`}
    >
      {/* Left Sidebar - Contacts List */}
      {!isMobile && (
        <div
          className={`flex w-72 flex-col border-r shrink-0 ${isDark
              ? "border-[#2D2D2D] bg-[#252526]/80"
              : "border-[#E5E5E5] bg-[#E8E8ED]/90"
            }`}
        >
          {/* Top Search & New Message Toolbar */}
          <div
            className={`flex items-center justify-between border-b px-3.5 py-2.5 ${isDark ? "border-[#2D2D2D]" : "border-[#D1D1D6]"
              }`}
          >
            <div className="relative flex-1">
              <FaSearch
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-gray-400" : "text-gray-500"
                  }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className={`w-full rounded-md pl-8 pr-3 py-1 text-xs outline-none transition ${isDark
                    ? "bg-[#1E1E1E] text-white placeholder-gray-500 focus:ring-1 focus:ring-[#0A84FF]"
                    : "bg-white/80 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-[#0A84FF] border border-gray-300"
                  }`}
              />
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              className={`ml-2.5 rounded-md p-1.5 transition ${isDark
                  ? "hover:bg-white/10 text-gray-300"
                  : "hover:bg-black/5 text-gray-700"
                }`}
              title="Compose New Message"
            >
              <FaEdit className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-200/40 dark:divide-gray-800/40">
            {filteredContacts.map((contact) => {
              const isActive = contact.id === activeContactId
              return (
                <div
                  key={contact.id}
                  onClick={() => setActiveContactId(contact.id)}
                  className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-colors relative ${isActive
                      ? isDark
                        ? "bg-[#0A84FF]/25 border-l-4 border-[#0A84FF]"
                        : "bg-[#0A84FF]/15 border-l-4 border-[#0A84FF]"
                      : isDark
                        ? "hover:bg-white/5"
                        : "hover:bg-gray-200/60"
                    }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="h-10 w-10 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-[#252526]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold truncate ${isDark ? "text-white" : "text-gray-900"
                          }`}
                      >
                        {contact.name}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                        {contact.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {contact.lastMessage}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* AI Assistant Notice Card in Left Sidebar */}
          <div
            className={`p-3.5 border-t text-[11px] leading-relaxed ${
              isDark
                ? "border-[#2D2D2D] bg-[#1E1E1E]/80 text-amber-300"
                : "border-[#D1D1D6] bg-amber-50 text-amber-900 shadow-inner"
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold mb-1">
              <span>⚠️</span>
              <span>AI Assistant Notice</span>
            </div>
            <p
              className={`text-[10px] leading-relaxed ${
                isDark ? "text-amber-200/80" : "text-amber-800/90"
              }`}
            >
              You are chatting with an AI representation of Avadhoot Mahadik. Responses are simulated based on his resume &amp; portfolio.
            </p>
          </div>
        </div>
      )}

      {/* Main Messages Canvas */}
      <div className="flex flex-1 flex-col h-full min-w-0 relative">
        {/* Mobile AI Disclaimer Popup */}
        {isMobile && showMobileNotice && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/60 backdrop-blur-sm">
            <div
              className={`rounded-2xl p-5 max-w-sm w-full shadow-2xl border ${
                isDark
                  ? "bg-[#252526] border-[#383838] text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl shrink-0">⚠️</span>
                <div>
                  <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">
                    AI Assistant Notice
                  </h4>
                  <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                    You are chatting with an AI representation of Avadhoot Mahadik. Responses are simulated based on his resume &amp; portfolio.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileNotice(false)}
                className="w-full mt-2 py-2.5 px-4 rounded-xl font-medium text-xs bg-[#0A84FF] hover:bg-blue-600 text-white transition active:scale-95 shadow-md"
              >
                I Understand
              </button>
            </div>
          </div>
        )}

        {/* Top Header Toolbar */}
        <div
          className={`flex h-14 shrink-0 items-center justify-between border-b px-4 ${isDark
              ? "border-[#2D2D2D] bg-[#252526]/80"
              : "border-[#E5E5E5] bg-[#E8E8ED]/90"
            }`}
        >
          {/* Active Contact Header Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={activeContact.avatar}
                alt={activeContact.name}
                className="h-8 w-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
              />
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white dark:ring-gray-800" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-bold truncate ${isDark ? "text-white" : "text-gray-900"
                    }`}
                >
                  {activeContact.name}
                </span>
                <span className="rounded bg-[#0A84FF]/20 px-1.5 py-0.2 text-[9px] font-semibold text-[#0A84FF]">
                  iMessage
                </span>
              </div>
              <div className="text-[10px] text-gray-400 truncate">
                {activeContact.roleSubtitle}
              </div>
            </div>
          </div>

          {/* Right Toolbar Action Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => alert("FaceTime Video: Connect with Avadhoot at arcsmo19@gmail.com")}
              className={`p-2 rounded-md transition ${isDark
                  ? "hover:bg-white/10 text-gray-300"
                  : "hover:bg-black/5 text-gray-700"
                }`}
              title="FaceTime Video"
            >
              <FaVideo className="h-3.5 w-3.5 text-[#0A84FF]" />
            </button>
            <button
              type="button"
              onClick={() => alert("FaceTime Audio: Connect with Avadhoot at arcsmo19@gmail.com")}
              className={`p-2 rounded-md transition ${isDark
                  ? "hover:bg-white/10 text-gray-300"
                  : "hover:bg-black/5 text-gray-700"
                }`}
              title="FaceTime Audio"
            >
              <FaPhoneAlt className="h-3 w-3 text-[#0A84FF]" />
            </button>
            <button
              type="button"
              onClick={() => setShowInspector((prev) => !prev)}
              className={`p-2 rounded-md transition ${showInspector
                  ? "bg-[#0A84FF] text-white"
                  : isDark
                    ? "hover:bg-white/10 text-gray-300"
                    : "hover:bg-black/5 text-gray-700"
                }`}
              title="Toggle Contact Inspector"
            >
              <FaInfoCircle className="h-3.5 w-3.5" />
            </button>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1" />
            <button
              type="button"
              onClick={handleClearChat}
              disabled={messages.length <= 1}
              className={`p-2 rounded-md transition ${messages.length <= 1
                  ? "opacity-30 cursor-not-allowed"
                  : isDark
                    ? "hover:bg-white/10 text-gray-300"
                    : "hover:bg-black/5 text-gray-700"
                }`}
              title="Reset Chat Session"
            >
              <FaUndo className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Chat Feed Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoadingHistory ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="flex space-x-2 justify-center mb-2">
                  <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#0A84FF]" />
                  <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#0A84FF] delay-100" />
                  <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#0A84FF] delay-200" />
                </div>
                <p className="text-xs text-gray-400">Loading conversation...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Apple Messages Profile Header at top of thread */}
              <div className="mb-6 flex flex-col items-center justify-center text-center">
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="h-16 w-16 rounded-full object-cover shadow-md border-2 border-white dark:border-gray-700 mb-2"
                />
                <h3
                  className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"
                    }`}
                >
                  {activeContact.name}
                </h3>
                <p className="text-[11px] text-gray-400">
                  iMessage • End-to-End Encrypted
                </p>

                {/* Quick Interactive Suggestion Chips */}
                <div className="mt-4 flex flex-wrap justify-center gap-1.5 max-w-lg">
                  {activeContact.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendPromptText(suggestion)}
                      disabled={isLoading || isTyping}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition active:scale-95 border ${isDark
                          ? "bg-[#252526] border-[#383838] text-gray-200 hover:bg-[#333333] hover:border-[#0A84FF]"
                          : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-[#0A84FF] shadow-sm"
                        }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Bubbles */}
              {messages.map((message, index) => {
                const isUser = message.role === "user"
                return (
                  <div
                    key={`message-${index}`}
                    className={`mb-3.5 flex ${isUser ? "justify-end" : "justify-start"
                      }`}
                  >
                    {!isUser && (
                      <img
                        src={activeContact.avatar}
                        alt="AI"
                        className="h-6 w-6 rounded-full object-cover mr-2 shrink-0 self-end mb-4 border border-gray-300 dark:border-gray-700"
                      />
                    )}
                    <div className="flex flex-col max-w-[80%] sm:max-w-[70%]">
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${isUser
                            ? "bg-gradient-to-r from-[#0A84FF] to-[#0062DF] text-white rounded-br-xs"
                            : isDark
                              ? "bg-[#2C2C2E] text-[#F5F5F7] rounded-bl-xs border border-white/5"
                              : "bg-[#E9E9EB] text-[#1D1D1F] rounded-bl-xs"
                          }`}
                      >
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-pre:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                          {isUser ? (
                            <div className="whitespace-pre-wrap">
                              {message.content}
                            </div>
                          ) : (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code: ({
                                  className,
                                  children,
                                  ...props
                                }: {
                                  className?: string
                                  children?: React.ReactNode
                                }) => {
                                  const isInline =
                                    !className?.includes("language-")
                                  return isInline ? (
                                    <code
                                      className={`${isDark
                                          ? "bg-black/40 text-gray-200"
                                          : "bg-black/10 text-gray-800"
                                        } px-1.5 py-0.5 rounded text-[11px]`}
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  ) : (
                                    <code
                                      className={`block ${isDark
                                          ? "bg-black/60"
                                          : "bg-white border border-gray-200"
                                        } p-2.5 rounded-lg text-xs overflow-x-auto`}
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  )
                                },
                                a: ({ children, ...props }) => (
                                  <a
                                    className="text-[#0A84FF] underline font-medium hover:opacity-80"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    {...props}
                                  >
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                      <div
                        className={`mt-1 text-[10px] px-1 ${isUser
                            ? "text-right text-gray-400"
                            : "text-left text-gray-400"
                          }`}
                      >
                        {isUser
                          ? "Delivered • " +
                          message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Streaming Typing Indicator */}
              {isTyping && typingMessage && (
                <div className="mb-3.5 flex justify-start">
                  <img
                    src={activeContact.avatar}
                    alt="AI"
                    className="h-6 w-6 rounded-full object-cover mr-2 shrink-0 self-end mb-4 border border-gray-300 dark:border-gray-700"
                  />
                  <div className="flex flex-col max-w-[80%] sm:max-w-[70%]">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${isDark
                          ? "bg-[#2C2C2E] text-[#F5F5F7] rounded-bl-xs border border-white/5"
                          : "bg-[#E9E9EB] text-[#1D1D1F] rounded-bl-xs"
                        }`}
                    >
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {typingMessage}
                        </ReactMarkdown>
                        <span className="inline-block w-1 h-3.5 bg-[#0A84FF] animate-pulse ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Waiting Loading Dots */}
              {isLoading && !isTyping && (
                <div className="mb-3.5 flex justify-start">
                  <img
                    src={activeContact.avatar}
                    alt="AI"
                    className="h-6 w-6 rounded-full object-cover mr-2 shrink-0 self-end mb-2 border border-gray-300 dark:border-gray-700"
                  />
                  <div
                    className={`rounded-2xl px-4 py-3 ${isDark ? "bg-[#2C2C2E]" : "bg-[#E9E9EB]"
                      }`}
                  >
                    <div className="flex space-x-1.5 items-center">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-100" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Authentic iMessage Bottom Bar */}
        <div
          className={`border-t px-3 py-2.5 ${isDark
              ? "border-[#2D2D2D] bg-[#252526]/90"
              : "border-[#E5E5E5] bg-[#E8E8ED]/90"
            }`}
        >
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => alert("Attachments & Media share")}
              className={`rounded-full p-2 transition ${isDark
                  ? "bg-[#3A3A3C] hover:bg-[#48484A] text-gray-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              title="Add Media / App Drawer"
            >
              <FaPlus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => alert("Photos Picker")}
              className={`rounded-full p-2 transition ${isDark
                  ? "hover:bg-white/10 text-gray-300"
                  : "hover:bg-black/5 text-gray-700"
                }`}
              title="Photos"
            >
              <FaImage className="h-4 w-4 text-[#0A84FF]" />
            </button>

            {/* Pill Input */}
            <div
              className={`flex flex-1 items-center rounded-full px-3.5 py-1.5 border transition ${isDark
                  ? "bg-[#1E1E1E] border-[#383838] focus-within:border-[#0A84FF]"
                  : "bg-white border-gray-300 focus-within:border-[#0A84FF]"
                }`}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="iMessage"
                disabled={isLoading || isLoadingHistory || isTyping}
                autoComplete="off"
                className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => alert("Emoji Keyboard")}
                className="ml-2 text-gray-400 hover:text-gray-200 transition"
                title="Emoji"
              >
                <FaSmile className="h-4 w-4" />
              </button>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || isLoadingHistory || isTyping}
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${isLoading || isLoadingHistory || isTyping
                  ? "cursor-not-allowed opacity-40 bg-[#0A84FF]/50 text-white"
                  : "bg-[#0A84FF] text-white hover:bg-blue-600 active:scale-95 shadow-md"
                }`}
            >
              <FaArrowUp className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Side Inspector Panel (Authentic macOS Messages Inspector) */}
      {showInspector && (
        <div
          className={`w-72 border-l flex flex-col shrink-0 overflow-y-auto ${isDark
              ? "border-[#2D2D2D] bg-[#252526]"
              : "border-[#E5E5E5] bg-[#E8E8ED]"
            }`}
        >
          {/* Inspector Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 border-gray-200/50 dark:border-gray-800/50">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Details
            </span>
            <button
              type="button"
              onClick={() => setShowInspector(false)}
              className="text-gray-400 hover:text-foreground transition"
            >
              <FaTimes className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Contact Card Details */}
          <div className="p-5 flex flex-col items-center text-center border-b border-gray-200/50 dark:border-gray-800/50">
            <img
              src={activeContact.avatar}
              alt={activeContact.name}
              className="h-20 w-20 rounded-full object-cover shadow-lg border-2 border-white dark:border-gray-700 mb-3"
            />
            <h4
              className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"
                }`}
            >
              {activeContact.name}
            </h4>
            <p className="text-xs text-[#0A84FF] font-medium mt-0.5">
              {activeContact.roleSubtitle}
            </p>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-4 gap-2 w-full mt-4">
              <a
                href="mailto:arcsmo19@gmail.com"
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition ${isDark
                    ? "bg-[#1E1E1E] hover:bg-[#333333]"
                    : "bg-white hover:bg-gray-100 shadow-sm"
                  }`}
              >
                <FaEnvelope className="h-3.5 w-3.5 text-[#0A84FF] mb-1" />
                <span className="text-[10px]">Mail</span>
              </a>
              <a
                href="https://github.com/Avadhoot1905"
                target="_blank"
                rel="noreferrer"
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition ${isDark
                    ? "bg-[#1E1E1E] hover:bg-[#333333]"
                    : "bg-white hover:bg-gray-100 shadow-sm"
                  }`}
              >
                <FaGithub className="h-3.5 w-3.5 text-[#0A84FF] mb-1" />
                <span className="text-[10px]">GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/avadhoot-mahadik"
                target="_blank"
                rel="noreferrer"
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition ${isDark
                    ? "bg-[#1E1E1E] hover:bg-[#333333]"
                    : "bg-white hover:bg-gray-100 shadow-sm"
                  }`}
              >
                <FaLinkedin className="h-3.5 w-3.5 text-[#0A84FF] mb-1" />
                <span className="text-[10px]">LinkedIn</span>
              </a>
              <button
                type="button"
                onClick={() =>
                  onOpenApp && onOpenApp("finder", { filter: "documents" })
                }
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition ${isDark
                    ? "bg-[#1E1E1E] hover:bg-[#333333]"
                    : "bg-white hover:bg-gray-100 shadow-sm"
                  }`}
              >
                <FaFileAlt className="h-3.5 w-3.5 text-[#0A84FF] mb-1" />
                <span className="text-[10px]">Resume</span>
              </button>
            </div>
          </div>

          {/* Shared Links / Attachments */}
          <div className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2.5">
              Shared Links & Files
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onOpenApp && onOpenApp("projects")}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition ${isDark
                    ? "bg-[#1E1E1E] hover:bg-white/5"
                    : "bg-white hover:bg-gray-50 shadow-sm"
                  }`}
              >
                <div className="h-7 w-7 rounded bg-[#0A84FF]/20 flex items-center justify-center shrink-0">
                  <FaMagic className="h-3.5 w-3.5 text-[#0A84FF]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">
                    Projects Showcase
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    Qosmos, JanSaathi & more
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onOpenApp && onOpenApp("finder", { filter: "documents" })
                }
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition ${isDark
                    ? "bg-[#1E1E1E] hover:bg-white/5"
                    : "bg-white hover:bg-gray-50 shadow-sm"
                  }`}
              >
                <div className="h-7 w-7 rounded bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <FaFileAlt className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">
                    Avadhoot_Resume.pdf
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    Official Resume Document
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
