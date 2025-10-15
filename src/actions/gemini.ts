"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { PERSONALITY_PROMPT } from "@/data/personality-prompt"
import redis from "@/lib/redis"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Session TTL: 1 hour (3600 seconds) - clears after inactivity
const SESSION_TTL = 3600

/**
 * Get chat history for a specific user from Redis cache
 */
async function getChatHistory(userId: string): Promise<{ role: string; content: string }[]> {
  try {
    const cacheKey = `chat:${userId}`
    const cached = await redis.get<{ role: string; content: string }[]>(cacheKey)
    return cached || []
  } catch (error) {
    console.error("Error getting chat history:", error)
    return []
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
  } catch (error) {
    console.error("Error clearing chat history:", error)
  }
}

export async function sendMessageToGemini(message: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
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
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    // Get existing chat history for this user
    const existingHistory = await getChatHistory(userId)
    
    // Add system prompt as the first message in history (only if history is empty)
    const systemMessage = {
      role: "user",
      parts: [{ text: PERSONALITY_PROMPT }],
    }
    
    const systemResponse = {
      role: "model",
      parts: [{ text: "I understand. I will respond as Avadhoot Mahadik with the personality traits and communication style you've described. I'm ready to chat!" }],
    }
    
    // Convert existing messages to Gemini chat format
    const history = [
      systemMessage,
      systemResponse,
      ...existingHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }))
    ]
    
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.9, // Higher temperature for more personality
      },
    })
    
    // Send the new message
    const result = await chat.sendMessage(userMessage)
    const response = await result.response
    const text = response.text()
    
    // Update chat history in cache
    const updatedHistory = [
      ...existingHistory,
      { role: "user", content: userMessage },
      { role: "assistant", content: text }
    ]
    await saveChatHistory(userId, updatedHistory)
    
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
