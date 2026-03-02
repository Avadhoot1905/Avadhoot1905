/**
 * ====================================================
 * CENTRALIZED API CLIENT
 * ====================================================
 *
 * Single source of truth for all backend API calls.
 *
 * Infrastructure:
 *   Browser → CloudFront → API Gateway (/prod) → Lambda
 *
 * CloudFront behavior:
 *   /api/* → API Gateway (origin path /prod stripped transparently)
 *   default → S3 (static assets)
 *
 * Rules enforced here:
 *   ✅ Only relative paths in production (/api/...)
 *   ✅ No hardcoded execute-api or region URLs
 *   ✅ No /prod prefix (CloudFront origin path handles this)
 *   ✅ Local dev uses dev-server ports (no /api prefix on those servers)
 *
 * Backend contract (verified from lambda/index.ts):
 *
 *   POST /api/chat
 *     Body:     { sessionId: string, message: string, clearHistory?: boolean }
 *     Response: { success: boolean, response: string, sessionId: string }
 *
 *   GET /api/admin/chats
 *     Header:   x-admin-secret: <secret>
 *     Response: AdminMessage[]
 */

// ====================================================
// CONSTANTS
// ====================================================

const API_BASE = "/api"

// ====================================================
// HELPERS
// ====================================================

function isLocalDev(): boolean {
  if (typeof window === "undefined") return false
  const host = window.location.hostname
  return host === "localhost" || host === "127.0.0.1"
}

/**
 * Resolve the chat endpoint.
 *
 * Production: relative path routed through CloudFront → API Gateway.
 * Local dev:  dev-server.ts registers POST /chat on port 3001
 *             (no /api prefix — that server wraps chat/index.ts directly).
 */
function getChatEndpoint(): string {
  if (isLocalDev()) {
    return "http://localhost:3001/chat"
  }
  return `${API_BASE}/chat`
}

/**
 * Resolve the admin chats endpoint.
 *
 * Production: relative path routed through CloudFront → API Gateway.
 * Local dev:  dev-server.ts registers GET /admin/chats on port 3002.
 */
function getAdminChatsEndpoint(): string {
  if (isLocalDev()) {
    return "http://localhost:3002/admin/chats"
  }
  return `${API_BASE}/admin/chats`
}

// ====================================================
// TYPES (matched to backend response shapes)
// ====================================================

export interface ChatSuccessResponse {
  success: true
  response: string
  sessionId: string
}

export interface ChatClearResponse {
  success: true
  message: string
}

export interface AdminMessage {
  id: string
  sessionId: string
  role: string
  content: string
  timestamp: string
  chatSession: {
    id: string
    sessionId: string
    createdAt: string
    updatedAt: string
  } | null
}

// ====================================================
// CHAT API
// ====================================================

/**
 * Send a chat message.
 *
 * Backend: POST /api/chat
 * Body:    { sessionId, message }
 * Headers: Content-Type: application/json
 */
export async function apiSendMessage(
  sessionId: string,
  message: string
): Promise<ChatSuccessResponse> {
  const url = getChatEndpoint()
  const body = { sessionId, message }

  console.log(`[api] POST ${url}`, { sessionId, message: message.substring(0, 80) })

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (res.status !== 200) {
    const text = await res.text()
    let detail = text
    try {
      const json = JSON.parse(text)
      if (json?.error) detail = json.error
    } catch { /* raw text is fine */ }
    throw new Error(`Chat API error ${res.status}: ${detail}`)
  }

  const data = await res.json() as ChatSuccessResponse
  if (!data.success || !data.response) {
    throw new Error(data.response ? "Malformed chat response" : "No response field in chat reply")
  }

  return data
}

/**
 * Clear chat history for a session.
 *
 * Backend: POST /api/chat
 * Body:    { sessionId, clearHistory: true }
 */
export async function apiClearHistory(sessionId: string): Promise<void> {
  const url = getChatEndpoint()
  const body = { sessionId, clearHistory: true }

  console.log(`[api] POST ${url} (clearHistory)`, { sessionId })

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (res.status !== 200) {
    const text = await res.text()
    let detail = text
    try {
      const json = JSON.parse(text)
      if (json?.error) detail = json.error
    } catch { /* raw text is fine */ }
    throw new Error(`Clear history error ${res.status}: ${detail}`)
  }

  const data = await res.json() as ChatClearResponse
  if (!data.success) {
    throw new Error("Backend reported failure clearing history")
  }
}

// ====================================================
// ADMIN API
// ====================================================

/**
 * Fetch all chat messages (admin view).
 *
 * Backend: GET /api/admin/chats
 * Headers: x-admin-secret: <secret>
 *
 * ⚠️  Header name is `x-admin-secret` — confirmed from lambda/index.ts
 *     and lambda/admin/index.ts — do NOT use x-admin-password.
 */
export async function apiGetAdminChats(adminSecret: string): Promise<AdminMessage[]> {
  const url = getAdminChatsEndpoint()

  console.log(`[api] GET ${url}`)

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": adminSecret,
    },
  })

  if (res.status !== 200) {
    const text = await res.text()
    let detail = text
    try {
      const json = JSON.parse(text)
      if (json?.error) detail = json.error
    } catch { /* raw text is fine */ }
    throw new Error(`Admin API error ${res.status}: ${detail}`)
  }

  return res.json() as Promise<AdminMessage[]>
}
