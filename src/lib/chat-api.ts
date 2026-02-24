/**
 * ====================================================
 * CHAT API CLIENT FOR STATIC EXPORT
 * ====================================================
 * 
 * This module provides client-side functions to interact
 * with the AWS Lambda chat API (deployed separately).
 * 
 * For static builds, server actions are not available.
 * Instead, we call the Lambda API directly via fetch().
 * 
 * Setup:
 * 1. Deploy lambda/chat/index.ts to AWS Lambda
 * 2. Expose via API Gateway
 * 3. Set NEXT_PUBLIC_CHAT_API_URL in .env
 * 
 * Usage (same interface as old server actions):
 * - sendMessageWithHistory(sessionId, message)
 * - clearChatHistory(sessionId)
 * - getUserChatHistory(sessionId)
 */

// Get API URL from environment variable or use local dev server
const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:3001/chat'

/**
 * Send a message to the chat API
 */
export async function sendMessageWithHistory(
  sessionId: string,
  message: string
): Promise<string> {
  try {
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        message,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success || !data.response) {
      throw new Error(data.error || 'Failed to get response')
    }

    return data.response
  } catch (error) {
    console.error('Chat API error:', error)
    throw error instanceof Error ? error : new Error('Unknown error')
  }
}

/**
 * Clear chat history for a session
 */
export async function clearChatHistory(sessionId: string): Promise<void> {
  try {
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        clearHistory: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to clear history')
    }
  } catch (error) {
    console.error('Clear history error:', error)
    throw error instanceof Error ? error : new Error('Unknown error')
  }
}

/**
 * Get chat history (placeholder - not implemented in Lambda yet)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserChatHistory(_sessionId: string): Promise<{ role: string; content: string }[]> {
  // TODO: Implement in Lambda if needed
  console.warn('getUserChatHistory not yet implemented for static builds')
  return []
}

/**
 * Check if chat API is configured
 */
export function isChatEnabled(): boolean {
  return CHAT_API_URL !== 'https://api.example.com/chat'
}
