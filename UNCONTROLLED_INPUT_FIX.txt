// ALTERNATIVE FIX - Use this if controlled input still doesn't work
// Replace the entire input section in MessagesApp.tsx with this:

// 1. Keep the existing inputRef: const inputRef = useRef<HTMLInputElement>(null)

// 2. Replace handleSendMessage with this:
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

// 3. Replace the input with this UNCONTROLLED version:
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

// 4. Update the send button disabled condition:
<button
  type="submit"
  disabled={isLoading || isLoadingHistory}
  // Remove: || !inputValue.trim()
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

// 5. You can remove the inputValue state entirely:
// const [inputValue, setInputValue] = useState("") // DELETE THIS LINE

// This makes it UNCONTROLLED - no React state, pure DOM input
// The ref gives you direct access to the input value when needed
