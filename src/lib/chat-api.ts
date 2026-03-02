/**
 * ====================================================
 * CHAT API CLIENT — delegates to lib/api.ts
 * ====================================================
 *
 * Maintains the public interface consumed by MessagesApp.tsx.
 * All routing logic, URL resolution, and error handling now live
 * in a single source of truth: @/lib/api.
 */

import { apiSendMessage, apiClearHistory } from "@/lib/api"

/**
 * Send a message and return the AI reply string.
 *
 * Delegates to apiSendMessage which calls:
 *   POST /api/chat   { sessionId, message }
 * and expects:
 *   { success: true, response: string, sessionId: string }
 */
export async function sendMessageWithHistory(
  sessionId: string,
  message: string
): Promise<string> {
  try {
    const data = await apiSendMessage(sessionId, message.trim())
    return data.response
  } catch (error) {
    console.error("Chat API error:", error)
    throw error instanceof Error ? error : new Error("Unknown error")
  }
}

/**
 * Clear chat history for a session.
 *
 * Delegates to apiClearHistory which calls:
 *   POST /api/chat   { sessionId, clearHistory: true }
 */
export async function clearChatHistory(sessionId: string): Promise<void> {
  try {
    await apiClearHistory(sessionId)
  } catch (error) {
    console.error("Clear history error:", error)
    throw error instanceof Error ? error : new Error("Unknown error")
  }
}

/**
 * Get chat history — not yet implemented in Lambda.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserChatHistory(_sessionId: string): Promise<{ role: string; content: string }[]> {
  console.warn("getUserChatHistory not yet implemented for static builds")
  return []
}

/**
 * Chat is always enabled for same-origin CloudFront routing.
 */
export function isChatEnabled(): boolean {
  return true
}
