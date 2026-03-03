import type { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Redis } from '@upstash/redis'
import { asc, desc, eq } from 'drizzle-orm'
import { db, chatSessionTable, messageTable } from './src/db'
import { PERSONALITY_PROMPT } from './personality-prompt'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

const SESSION_TTL = 3600
const MAX_HISTORY_MESSAGES = 30
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json',
}

class HttpError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

type NormalizedEvent = {
  requestId: string
  method: string
  path: string
  headers: Record<string, string>
  query: Record<string, string>
  body: string | null
  isBase64Encoded: boolean
}

function normalizeEvent(event: APIGatewayProxyEvent | APIGatewayProxyEventV2): NormalizedEvent {
  const isV2 = (event as APIGatewayProxyEventV2).version === '2.0'
  const requestId =
    (event as APIGatewayProxyEventV2).requestContext?.requestId ||
    (event as APIGatewayProxyEvent).requestContext?.requestId ||
    `req-${Date.now()}`
  const method = isV2
    ? ((event as APIGatewayProxyEventV2).requestContext.http.method || 'GET')
    : ((event as APIGatewayProxyEvent).httpMethod || 'GET')
  const path = isV2
    ? ((event as APIGatewayProxyEventV2).rawPath || '/')
    : ((event as APIGatewayProxyEvent).path || '/')

  const rawHeaders = event.headers || {}
  const headers = Object.fromEntries(
    Object.entries(rawHeaders)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key.toLowerCase(), String(value)])
  )

  const query = isV2
    ? (((event as APIGatewayProxyEventV2).queryStringParameters || {}) as Record<string, string>)
    : (((event as APIGatewayProxyEvent).queryStringParameters || {}) as Record<string, string>)

  console.log(
    `[lambda][${requestId}] normalizeEvent: method=${method} path=${path} isV2=${isV2} base64=${!!event.isBase64Encoded}`
  )

  return {
    requestId,
    method,
    path,
    headers,
    query,
    body: event.body ?? null,
    isBase64Encoded: !!event.isBase64Encoded,
  }
}

function parseJsonBody(event: Pick<NormalizedEvent, 'body' | 'isBase64Encoded' | 'requestId'>): Record<string, unknown> {
  if (!event.body) return {}

  const decoded = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body

  if (!decoded.trim()) return {}

  try {
    return JSON.parse(decoded) as Record<string, unknown>
  } catch {
    console.error(`[lambda][${event.requestId}] parseJsonBody failed: invalid JSON`)
    throw new HttpError(400, 'Invalid JSON body')
  }
}

function jsonResponse(statusCode: number, bodyObject: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(bodyObject),
  }
}

async function getChatHistory(sessionId: string): Promise<{ role: string; content: string }[]> {
  try {
    const cacheKey = `chat:${sessionId}`
    const cached = await redis.get<{ role: string; content: string }[]>(cacheKey)
    if (cached && cached.length > 0) {
      console.log(`[lambda] getChatHistory cache hit: sessionId=${sessionId} count=${cached.length}`)
      return cached
    }

    const dbMessages = await db
      .select({ role: messageTable.role, content: messageTable.content })
      .from(messageTable)
      .where(eq(messageTable.sessionId, sessionId))
      .orderBy(asc(messageTable.timestamp))
      .limit(MAX_HISTORY_MESSAGES)

    console.log(`[lambda] getChatHistory cache miss: sessionId=${sessionId} dbCount=${dbMessages.length}`)

    return dbMessages.map((msg) => ({ role: msg.role, content: msg.content }))
  } catch (error) {
    console.error('[lambda] getChatHistory error:', error)
    return []
  }
}

async function saveChatHistory(sessionId: string, history: { role: string; content: string }[]): Promise<void> {
  try {
    await redis.setex(`chat:${sessionId}`, SESSION_TTL, JSON.stringify(history))
    console.log(`[lambda] saveChatHistory success: sessionId=${sessionId} count=${history.length}`)
  } catch (error) {
    console.warn('[lambda] saveChatHistory warning:', error)
    // best effort cache
  }
}

async function saveMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  retries: number = 3
): Promise<void> {
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await db.insert(chatSessionTable).values({ sessionId, updatedAt: new Date() }).onConflictDoUpdate({
        target: chatSessionTable.sessionId,
        set: { updatedAt: new Date() },
      })
      await db.insert(messageTable).values({ sessionId, role, content })
      console.log(`[lambda] saveMessage success: sessionId=${sessionId} role=${role} attempt=${attempt}`)
      return
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`[lambda] saveMessage failed: sessionId=${sessionId} role=${role} attempt=${attempt}`, lastError)
      if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100))
    }
  }
  throw new Error(`Failed to save ${role} message: ${lastError?.message}`)
}

async function clearChatHistory(sessionId: string): Promise<void> {
  try {
    await redis.del(`chat:${sessionId}`)
    await db.delete(messageTable).where(eq(messageTable.sessionId, sessionId))
    console.log(`[lambda] clearChatHistory success: sessionId=${sessionId}`)
  } catch (error) {
    console.error(`[lambda] clearChatHistory error: sessionId=${sessionId}`, error)
    throw error
  }
}

async function sendMessageToGemini(sessionId: string, userMessage: string): Promise<string> {
  try {
    console.log(`[lambda] sendMessageToGemini start: sessionId=${sessionId} messageLength=${userMessage.length}`)
    const history = await getChatHistory(sessionId)
    const conversationHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      systemInstruction: PERSONALITY_PROMPT,
    })
    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: { maxOutputTokens: 2048, temperature: 0.85 },
    })

    const result = await chat.sendMessage(userMessage)
    const aiResponse = (await result.response).text()
    console.log(`[lambda] sendMessageToGemini generated response: sessionId=${sessionId} responseLength=${aiResponse.length}`)

    await saveMessage(sessionId, 'user', userMessage)
    await saveMessage(sessionId, 'assistant', aiResponse)

    const updatedHistory = [...history, { role: 'user', content: userMessage }, { role: 'assistant', content: aiResponse }]
      .slice(-MAX_HISTORY_MESSAGES)
    await saveChatHistory(sessionId, updatedHistory)

    return aiResponse
  } catch (error) {
    console.error(`[lambda] sendMessageToGemini error: sessionId=${sessionId}`, error)
    throw error
  }
}

async function handleChat(body: Record<string, unknown>): Promise<APIGatewayProxyResult> {
  try {
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
    const message = typeof body.message === 'string' ? body.message : ''
    const clearHistory = body.clearHistory === true

    console.log(`[lambda] handleChat: sessionId=${sessionId || 'missing'} clearHistory=${clearHistory}`)

    if (!sessionId) return jsonResponse(400, { error: 'sessionId is required' })
    if (clearHistory) {
      await clearChatHistory(sessionId)
      return jsonResponse(200, { success: true, message: 'History cleared' })
    }
    if (!message.trim()) return jsonResponse(400, { error: 'message is required' })

    const response = await sendMessageToGemini(sessionId, message.trim())
    return jsonResponse(200, { success: true, response, sessionId })
  } catch (error) {
    console.error('[lambda] handleChat error:', error)
    throw error
  }
}

async function handleAdmin(headers: Record<string, string>): Promise<APIGatewayProxyResult> {
  try {
    const adminSecret = headers['x-admin-secret']
    const expectedSecret = process.env.ADMIN_SECRET

    console.log(`[lambda] handleAdmin: secretPresent=${!!adminSecret}`)

    if (!adminSecret || !expectedSecret || adminSecret !== expectedSecret) {
      console.warn('[lambda] handleAdmin unauthorized request')
      return jsonResponse(401, { error: 'Unauthorized' })
    }

    const rows = await db
      .select()
      .from(messageTable)
      .leftJoin(chatSessionTable, eq(messageTable.sessionId, chatSessionTable.sessionId))
      .orderBy(desc(messageTable.timestamp))
      .limit(100)

    console.log(`[lambda] handleAdmin success: rows=${rows.length}`)
    const messages = rows.map((row) => ({ ...row.Message, chatSession: row.ChatSession }))
    return jsonResponse(200, messages)
  } catch (error) {
    console.error('[lambda] handleAdmin error:', error)
    throw error
  }
}

export const handler = async (
  event: APIGatewayProxyEvent | APIGatewayProxyEventV2
): Promise<APIGatewayProxyResult> => {
  try {
    const normalized = normalizeEvent(event)
    console.log(`[lambda][${normalized.requestId}] handler start: ${normalized.method} ${normalized.path}`)

    if (normalized.method === 'OPTIONS') return jsonResponse(200, { ok: true })

    if (normalized.method === 'POST' && normalized.path === '/api/chat') {
      return await handleChat(parseJsonBody(normalized))
    }

    if (normalized.method === 'GET' && normalized.path === '/api/admin/chats') {
      return await handleAdmin(normalized.headers)
    }

    return jsonResponse(404, { error: 'Not Found' })
  } catch (error) {
    console.error('[lambda] handler error:', error)
    if (error instanceof HttpError) return jsonResponse(error.statusCode, { error: error.message })

    return jsonResponse(500, {
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
