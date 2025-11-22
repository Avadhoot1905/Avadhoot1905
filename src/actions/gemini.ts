"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { 
  PERSONALITY_PROMPT,
  CONTEXT_INTEGRATION,
  CORE_IDENTITY,
  COMMUNICATION_STYLE
} from "@/data/personality-prompt"
import redis from "@/lib/redis"
import { saveMessage, getSessionMessages } from "./messages"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Session TTL: 1 hour (3600 seconds) - clears after inactivity
const SESSION_TTL = 3600

// Maximum number of messages to keep in history (prevents context overflow)
// Each message pair (user + assistant) = 2 messages
// 30 messages = ~15 conversation exchanges
const MAX_HISTORY_MESSAGES = 30

/**
 * Detect conversation type based on user message for context-aware prompting
 */
function getConversationType(message: string): string[] {
  const lowerMessage = message.toLowerCase()
  const contexts = ['communication'] // Always include communication style
  
  // Technical keywords
  if (lowerMessage.match(/(code|programming|technical|development|react|next|typescript|javascript|python|tech|build|framework|library|api|backend|frontend|database)/)) {
    contexts.push('technical', 'projects')
  }
  
  // Project-specific keywords
  if (lowerMessage.match(/(project|portfolio|built|created|developed|examcooker|study\.ai|ivision|kathuria|securelink)/)) {
    contexts.push('projects')
    if (!contexts.includes('technical')) contexts.push('technical')
  }
  
  // Leadership/personal keywords
  if (lowerMessage.match(/(leader|leadership|team|manage|conflict|motivation|philosophy|personal|growth)/)) {
    contexts.push('leadership', 'examples')
  }
  
  // Navigation keywords (always include navigation for these)
  if (lowerMessage.match(/(education|experience|work|job|university|degree|show me|tell me about)/)) {
    contexts.push('navigation')
    if (lowerMessage.match(/(project|portfolio|built)/)) {
      contexts.push('projects', 'technical')
    }
  }
  
  return contexts
}

/**
 * Get optimized personality context based on conversation type
 */
function getOptimizedPersonalityContext(userMessage: string, isFirstMessage: boolean = false): string {
  // For first message or if unsure, use full context
  if (isFirstMessage || userMessage.length < 10) {
    return PERSONALITY_PROMPT
  }
  
  // Get conversation type and create targeted context
  const contextTypes = getConversationType(userMessage)
  
  // If it's a simple greeting or unclear, use minimal context
  if (contextTypes.length === 1 && contextTypes[0] === 'communication') {
    return CORE_IDENTITY + '\n\n' + COMMUNICATION_STYLE
  }
  
  // Otherwise use context-aware selection
  return CONTEXT_INTEGRATION.getPersonalityContext(contextTypes)
}

/**
 * Get chat history for a specific user from Redis cache
 * Falls back to database if Redis is unavailable
 */
async function getChatHistory(userId: string): Promise<{ role: string; content: string }[]> {
  try {
    const cacheKey = `chat:${userId}`
    const cached = await redis.get<{ role: string; content: string }[]>(cacheKey)
    
    if (cached && cached.length > 0) {
      return cached
    }
    
    // Fallback to database
    const dbMessages = await getSessionMessages(userId)
    return dbMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  } catch (error) {
    console.error("Error getting chat history:", error)
    // Try database as last resort
    try {
      const dbMessages = await getSessionMessages(userId)
      return dbMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    } catch (dbError) {
      console.error("Error getting chat history from database:", dbError)
      return []
    }
  }
}

/**
 * Save chat history for a specific user to Redis cache
 */
async function saveChatHistory(userId: string, history: { role: string; content: string }[]): Promise<void> {
  try {
    const cacheKey = `chat:${userId}`
    await redis.setex(cacheKey, SESSION_TTL, JSON.stringify(history))
    console.log(`💾 Saved chat history for user: ${userId}`)
  } catch (error) {
    console.error("Error saving chat history:", error)
  }
}

/**
 * Clear chat history for a specific user
 */
export async function clearChatHistory(userId: string): Promise<void> {
  try {
    const cacheKey = `chat:${userId}`
    await redis.del(cacheKey)
    console.log(`🗑️  Cleared chat history for user: ${userId}`)
    
    // Also clear from database
    const { clearSessionMessages } = await import("./messages")
    await clearSessionMessages(userId)
  } catch (error) {
    console.error("Error clearing chat history:", error)
  }
}

export async function sendMessageToGemini(message: string): Promise<string> {
  try {
    // Use gemini-2.5-flash - stable model (released June 2025)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    const result = await model.generateContent(message)
    const response = await result.response
    const text = response.text()
    
    return text
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return "Sorry, I encountered an error processing your message. Please try again."
  }
}

/**
 * Send message with history for a specific user (supports multi-user conversations)
 * @param userId - Unique identifier for the user
 * @param userMessage - The new message from the user
 */
export async function sendMessageWithHistory(
  userId: string,
  userMessage: string
): Promise<string> {
  try {
    // Use gemini-2.5-flash - stable model (released June 2025)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    // Get existing chat history for this user
    const existingHistory = await getChatHistory(userId)
    
    // 🔧 FIX 1: Limit history to prevent context window overflow
    // Keep only the most recent messages to stay within token limits
    const recentHistory = existingHistory.slice(-MAX_HISTORY_MESSAGES)
    
    // 🔧 FIX 2: Intelligent context-aware system prompt
    // Use optimized context based on conversation type to save tokens
    const isFirstMessage = recentHistory.length === 0
    const optimizedPrompt = getOptimizedPersonalityContext(userMessage, isFirstMessage)
    
    const history = isFirstMessage 
      ? [
          // First time: Include context-aware system prompt
          {
            role: "user",
            parts: [{ text: optimizedPrompt }],
          },
          {
            role: "model",
            parts: [{ text: "I understand. I will respond as Avadhoot Mahadik with the personality traits and communication style you've described. I'm ready to chat!" }],
          }
        ]
      : // Subsequent messages: Use existing history without re-adding system prompt
        recentHistory.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        }))
    
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 2000, // 🔧 FIX 3: Increased from 1000 to allow fuller responses
        temperature: 0.9, // Higher temperature for more personality
      },
    })
    
    // Send the new message
    const result = await chat.sendMessage(userMessage)
    const response = await result.response
    const text = response.text()
    
    // 🔧 FIX 4: Log token usage for monitoring
    const usageMetadata = response.usageMetadata
    if (usageMetadata) {
      console.log(`📊 Token usage - Prompt: ${usageMetadata.promptTokenCount}, Response: ${usageMetadata.candidatesTokenCount}, Total: ${usageMetadata.totalTokenCount}`)
    }
    
    // Update chat history in cache
    const updatedHistory = [
      ...existingHistory,
      { role: "user", content: userMessage },
      { role: "assistant", content: text }
    ]
    
    // 🔧 FIX 5: Trim history before saving to prevent unbounded growth
    const trimmedHistory = updatedHistory.slice(-MAX_HISTORY_MESSAGES)
    await saveChatHistory(userId, trimmedHistory)
    
    // 💾 Save messages to database for persistence
    try {
      await saveMessage(userId, "user", userMessage)
      await saveMessage(userId, "assistant", text)
    } catch (dbError) {
      console.error("Error saving messages to database:", dbError)
      // Continue anyway - Redis cache is still updated
    }
    
    return text
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return "Sorry, I encountered an error processing your message. Please try again."
  }
}

/**
 * Get the full chat history for a user (for initializing UI)
 */
export async function getUserChatHistory(userId: string): Promise<{ role: string; content: string }[]> {
  try {
    return await getChatHistory(userId)
  } catch (error) {
    console.error("Error in getUserChatHistory:", error)
    return []
  }
}
