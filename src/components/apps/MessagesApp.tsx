"use client"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import { sendMessageWithHistory } from "@/actions/gemini"
import { FaPaperPlane } from "react-icons/fa"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function MessagesApp() {
  const { theme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Avadhoot Ganesh Mahadik. Feel free to ask me anything!",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

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
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const chatHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await sendMessageWithHistory(chatHistory)

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
        <div className={`border-b p-3 text-center ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
          <div className="font-semibold">Avadhoot Ganesh Mahadik</div>
          <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Online</div>
        </div>
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'}`}>
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
                <div className="whitespace-pre-wrap">{message.content}</div>
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
        </div>
        
        {/* Input Area - iOS style on mobile */}
        <div className={`border-t ${isMobile ? 'p-3' : 'p-2'} ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        } ${isMobile ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={isMobile ? "Text Message" : "iMessage"}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className={`flex-1 rounded-full px-4 py-2 text-sm transition-colors ${
                theme === "dark" 
                  ? "bg-gray-700 text-white placeholder:text-gray-400" 
                  : "bg-gray-100 text-gray-900 placeholder:text-gray-500"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""} ${
                isMobile ? 'border-2 border-gray-300 dark:border-gray-600' : ''
              }`}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`rounded-full transition-all ${
                isMobile ? 'p-2.5' : 'p-2'
              } ${
                isLoading || !inputValue.trim()
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
