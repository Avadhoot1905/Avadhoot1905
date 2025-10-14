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
      <div className="flex flex-1 flex-col">
        <div className={`border-b p-2 text-center ${theme === "dark" ? "border-gray-700" : ""}`}>
          <div className="font-semibold">Avadhoot Ganesh Mahadik</div>
          <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Online</div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 text-sm ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : theme === "dark"
                    ? "bg-gray-700 text-gray-200"
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
        <div className={`border-t p-2 ${theme === "dark" ? "border-gray-700" : ""}`}>
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="iMessage"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className={`flex-1 rounded-full px-3 py-2 text-sm ${
                theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`rounded-full p-2 transition-colors ${
                isLoading || !inputValue.trim()
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-blue-600"
              } bg-blue-500 text-white`}
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
