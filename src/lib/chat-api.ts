/**
 * ====================================================
 * CHAT API CLIENT FOR STATIC EXPORT
 * ====================================================
 * 
 * This module provides client-side functions to interact
 * with the chat API through same-origin CloudFront routing.
 * 
 * For static builds, server actions are not available.
 * Instead, we call the API via relative /api routes.
 * 
 * Setup:
 * 1. Deploy lambda/chat/index.ts to AWS Lambda
 * 2. Route /api/chat to API Gateway in CloudFront
 * 
 * Usage (same interface as old server actions):
 * - sendMessageWithHistory(sessionId, message)
 * - clearChatHistory(sessionId)
 * - getUserChatHistory(sessionId)
 */

/**
 * Send a message to the chat API
 */
function getChatApiUrl(): string {
  if (typeof window === 'undefined') {
    return '/api/chat'
  }

  const isLocalPreview =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  if (isLocalPreview) {
    return 'http://localhost:3001/chat'
  }

  return '/api/chat'
}

export async function sendMessageWithHistory(
  sessionId: string,
  message: string
): Promise<string> {
  try {
    const response = await fetch(getChatApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        message,
        userId: sessionId,
        conversationId: sessionId,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `API error: ${response.status}`

      try {
        const errorData = JSON.parse(errorText)
        if (errorData?.error && typeof errorData.error === 'string') {
          errorMessage = `API error: ${response.status} - ${errorData.error}`
        }
      } catch {
        if (errorText) {
          errorMessage = `API error: ${response.status} - ${errorText}`
        }
      }

      throw new Error(errorMessage)
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
    const response = await fetch(getChatApiUrl(), {
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
 * Check if chat API is enabled for same-origin routing
 */
export function isChatEnabled(): boolean {
  return true
}
