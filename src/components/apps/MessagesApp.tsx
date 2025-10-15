"use client"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import { sendMessageWithHistory, clearChatHistory, getUserChatHistory } from "@/actions/gemini"
import { FaPaperPlane, FaUndo } from "react-icons/fa"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

/**
 * Generate a unique session ID that persists during the page session
 * but is cleared on page refresh
 */
function getSessionId(): string {
  // Check if we already have a session ID in sessionStorage (not localStorage)
  let sessionId = sessionStorage.getItem('chat-session-id')
  
  if (!sessionId) {
    // Generate new session ID: timestamp + random string
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`
    sessionStorage.setItem('chat-session-id', sessionId)
  }
  
  return sessionId
}

export function MessagesApp() {
  const { theme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Avadhoot Mahadik. Feel free to ask me anything!",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Initialize session ID and load chat history on mount
  useEffect(() => {
    const initSession = async () => {
      const id = getSessionId()
      setSessionId(id)
      
      // Set a timeout to ensure loading state clears even if there's an issue
      const timeoutId = setTimeout(() => {
        setIsLoadingHistory(false)
      }, 5000) // 5 second timeout
      
      try {
        // Try to load existing chat history from cache
        const history = await getUserChatHistory(id)
        
        if (history && history.length > 0) {
          // Convert cached history to message format
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
            ...loadedMessages
          ])
        }
      } catch (error) {
        console.error("Error loading chat history:", error)
        // Continue anyway - just start fresh
      } finally {
        clearTimeout(timeoutId)
        setIsLoadingHistory(false)
      }
    }
    
    initSession()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Get value from ref instead of state
    const messageText = inputRef.current?.value?.trim() || '';
    
    if (!messageText || isLoading || !sessionId) return

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    
    // Clear input directly
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    
    setIsLoading(true)

    try {
      // Send message with session ID for context tracking
      const response = await sendMessageWithHistory(sessionId, messageText)

      const aiMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
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

  return (
    <div className="flex h-full">
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && (
        <div className={`w-1/3 border-r ${theme === "dark" ? "border-gray-700" : ""}`}>
          <div className={`border-b p-2 ${theme === "dark" ? "border-gray-700" : ""}`}>
            <input
              type="text"
              placeholder="Search"
              className={`w-full rounded-full px-3 py-1 text-sm ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100"}`}
            />
          </div>
          <div className="p-2">
            <div className={`mb-2 rounded p-2 ${theme === "dark" ? "bg-gray-700" : "bg-blue-50"}`}>
              <div className="font-semibold">Avadhoot Ganesh Mahadik</div>
              <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                Active now
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Messages Area */}
      <div className="flex flex-1 flex-col">
        <div className={`border-b p-3 flex items-center justify-between ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex-1 text-center">
            <div className="font-semibold">Avadhoot Mahadik</div>
            <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Online</div>
          </div>
          <button
            onClick={handleClearChat}
            disabled={messages.length <= 1}
            className={`p-2 rounded-full transition-colors ${
              messages.length <= 1 
                ? "opacity-30 cursor-not-allowed" 
                : theme === "dark"
                ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}
            title="Clear chat history"
          >
            <FaUndo className="text-sm" />
          </button>
        </div>
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'}`}>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="flex space-x-2 justify-center mb-2">
                  <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500"></div>
                  <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 delay-100"></div>
                  <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 delay-200"></div>
                </div>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Loading chat...
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-3 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`${isMobile ? 'max-w-[80%]' : 'max-w-[70%]'} rounded-lg p-3 text-sm ${
                  message.role === "user"
                    ? isMobile
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-blue-500 text-white"
                    : theme === "dark"
                    ? isMobile
                      ? "bg-gray-700 text-gray-200 rounded-bl-md"
                      : "bg-gray-700 text-gray-200"
                    : isMobile
                    ? "bg-gray-200 text-gray-900 rounded-bl-md"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-pre:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                  {message.role === "user" ? (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Custom styles for code blocks
                        code: ({node, className, children, ...props}: any) => {
                          const isInline = !className?.includes('language-')
                          return isInline ? (
                            <code
                              className={`${theme === "dark" ? "bg-gray-600" : "bg-gray-300"} px-1 py-0.5 rounded text-xs`}
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <code
                              className={`block ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"} p-2 rounded text-xs overflow-x-auto`}
                              {...props}
                            >
                              {children}
                            </code>
                          )
                        },
                        // Custom styles for links
                        a: ({node, children, ...props}) => (
                          <a
                            className="text-blue-400 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          >
                            {children}
                          </a>
                        ),
                        // Override paragraph styling for user role
                        p: ({node, children, ...props}) => (
                          <p className={message.role === "user" ? "text-white" : ""} {...props}>
                            {children}
                          </p>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
                <div
                  className={`mt-1 text-xs ${
                    message.role === "user"
                      ? "text-blue-100"
                      : theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
              {isLoading && (
                <div className="mb-4 flex justify-start">
                  <div
                    className={`max-w-[70%] rounded-lg p-3 text-sm ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-100"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* Input Area - iOS style on mobile */}
        <div className={`border-t ${isMobile ? 'p-3' : 'p-2'} ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        } ${isMobile ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={isLoadingHistory ? "Loading..." : (isMobile ? "Text Message" : "iMessage")}
              disabled={isLoading || isLoadingHistory}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              className={`flex-1 rounded-full px-4 py-2 text-sm transition-colors ${
                theme === "dark" 
                  ? "bg-gray-700 text-white placeholder:text-gray-400" 
                  : "bg-gray-100 text-gray-900 placeholder:text-gray-500"
              } ${(isLoading || isLoadingHistory) ? "opacity-50 cursor-not-allowed" : ""} ${
                isMobile ? 'border-2 border-gray-300 dark:border-gray-600' : ''
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              type="submit"
              disabled={isLoading || isLoadingHistory}
              className={`rounded-full transition-all ${
                isMobile ? 'p-2.5' : 'p-2'
              } ${
                isLoading || isLoadingHistory
                  ? "cursor-not-allowed opacity-50 bg-blue-400"
                  : "hover:bg-blue-600 active:scale-95"
              } bg-blue-500 text-white shadow-lg`}
            >
              <FaPaperPlane className={isMobile ? 'text-base' : 'text-sm'} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
