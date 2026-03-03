/**
 * ===================================================
 * AWS LAMBDA HANDLER - CONSOLIDATED API
 * ===================================================
 * 
 * Combines Chat and Admin APIs into a single Lambda function
 * using Express and serverless-http.
 * 
 * Routes:
 * - POST /chat      : Chat API with Gemini AI
 * - GET  /admin/chats : Admin API to fetch chat logs
 * 
 * Deployment:
 * - Handler: dist/index.handler
 * - Runtime: nodejs20.x
 * - Architecture: arm64
 * 
 * Environment Variables:
 * - GEMINI_API_KEY
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 * - DATABASE_URL
 * - ADMIN_SECRET
 */

import express, { Request, Response } from 'express'
import serverless from 'serverless-http'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Redis } from '@upstash/redis'
import { asc, desc, eq, sql } from 'drizzle-orm'
import { db, chatSessionTable, messageTable } from './src/db'
import { PERSONALITY_PROMPT } from './personality-prompt'

// ===================================================
// INITIALIZE CLIENTS
// ===================================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Configuration
const SESSION_TTL = 3600 // 1 hour
const MAX_HISTORY_MESSAGES = 30

// ===================================================
// CHAT HELPER FUNCTIONS
// ===================================================

/**
 * Get chat history from Redis or Database
 */
async function getChatHistory(sessionId: string): Promise<{ role: string; content: string }[]> {
  try {
    const cacheKey = `chat:${sessionId}`
    const cached = await redis.get<{ role: string; content: string }[]>(cacheKey)
    
    if (cached && cached.length > 0) {
      console.log(`✅ Redis cache HIT for session: ${sessionId}`)
      return cached
    }
    
    console.log(`❌ Redis cache MISS for session: ${sessionId}, falling back to DB`)
    
    const dbMessages = await db
      .select({ role: messageTable.role, content: messageTable.content })
      .from(messageTable)
      .where(eq(messageTable.sessionId, sessionId))
      .orderBy(asc(messageTable.timestamp))
      .limit(MAX_HISTORY_MESSAGES)
    
    return dbMessages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content,
    }))
  } catch (error) {
    console.error('Error getting chat history:', error)
    return []
  }
}

/**
 * Save chat history to Redis
 */
async function saveChatHistory(
  sessionId: string, 
  history: { role: string; content: string }[]
): Promise<void> {
  try {
    const cacheKey = `chat:${sessionId}`
    await redis.setex(cacheKey, SESSION_TTL, JSON.stringify(history))
    console.log(`📦 Redis cache updated for session: ${sessionId} (${history.length} messages)`)
  } catch (error) {
    console.warn('⚠️  Redis cache update failed (non-critical):', error)
  }
}

/**
 * Save individual message to database
 */
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
      
      console.log(`💾 ✅ Saved to database - Role: ${role}, Length: ${content.length} chars`)
      return
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`❌ Attempt ${attempt}/${retries} failed:`, lastError.message)
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
      }
    }
  }
  
  throw new Error(`Failed to save ${role} message: ${lastError?.message}`)
}

/**
 * Clear chat history
 */
async function clearChatHistory(sessionId: string): Promise<void> {
  try {
    const cacheKey = `chat:${sessionId}`
    await redis.del(cacheKey)
    
    await db.delete(messageTable).where(eq(messageTable.sessionId, sessionId))
    
    console.log(`🗑️  Cleared history for session: ${sessionId}`)
  } catch (error) {
    console.error('Error clearing chat history:', error)
    throw error
  }
}

/**
 * Send message to Gemini and get response
 */
async function sendMessageToGemini(
  sessionId: string,
  userMessage: string
): Promise<string> {
  let aiResponse = ''
  
  try {
    const history = await getChatHistory(sessionId)
    
    const conversationHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))
    
    conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }],
    })
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      systemInstruction: PERSONALITY_PROMPT,
    })
    
    const chat = model.startChat({
      history: conversationHistory.slice(0, -1),
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.85,
      },
    })
    
    const result = await chat.sendMessage(userMessage)
    const response = await result.response
    aiResponse = response.text()
    
    console.log(`🤖 AI Response generated: ${aiResponse.substring(0, 100)}...`)
    
  } catch (error) {
    console.error('Error generating AI response:', error)
    throw error
  }
  
  // Save messages to database
  try {
    await saveMessage(sessionId, 'user', userMessage)
    await saveMessage(sessionId, 'assistant', aiResponse)
    console.log('✅ Both messages saved successfully to database')
  } catch (error) {
    console.error('🚨 CRITICAL ERROR: Failed to save messages:', error)
    throw new Error(`Database save failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  // Update Redis cache
  try {
    const updatedHistory = [
      ...await getChatHistory(sessionId),
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiResponse },
    ].slice(-MAX_HISTORY_MESSAGES)
    
    await saveChatHistory(sessionId, updatedHistory)
  } catch (error) {
    console.warn('⚠️  Warning: Failed to update Redis cache (non-critical):', error)
  }
  
  return aiResponse
}

// ===================================================
// EXPRESS APP & ROUTES
// ===================================================

const app = express()

// Middleware
app.use(express.json())

// ===================================================
// CORS MIDDLEWARE
// ===================================================
// Configured for AWS API Gateway HTTP API v2.0
// Handles OPTIONS preflight requests and adds CORS headers to all responses
app.use((req, res, next) => {
  // Set CORS headers for all responses
  res.header('Access-Control-Allow-Origin', 'https://avadhootgm.in')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret')
  res.header('Access-Control-Max-Age', '86400') // Cache preflight for 24 hours
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ OPTIONS preflight request for ${req.path}`)
    res.status(200).end()
    return
  }
  
  next()
})

// Request logging
app.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.path}`)
  next()
})

const apiRouter = express.Router()

app.use('/api', apiRouter)

// ===================================================
// CHAT ROUTE
// ===================================================

apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { sessionId, message, clearHistory } = req.body
    
    // Validate sessionId
    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).json({ error: 'sessionId is required' })
      return
    }
    
    // Handle clear history request
    if (clearHistory === true) {
      await clearChatHistory(sessionId)
      res.json({ success: true, message: 'History cleared' })
      return
    }
    
    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'message is required' })
      return
    }
    
    // Process chat message
    const response = await sendMessageToGemini(sessionId, message.trim())
    
    res.json({
      success: true,
      response,
      sessionId,
    })
  } catch (error) {
    console.error('❌ Chat error:', error)
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    })
  }
})

// ===================================================
// ADMIN ROUTE
// ===================================================

apiRouter.get('/admin/chats', async (req: Request, res: Response) => {
  try {
    // Validate admin secret
    const adminSecret = req.headers['x-admin-secret']
    const expectedSecret = process.env.ADMIN_SECRET
    
    if (!adminSecret || !expectedSecret || adminSecret !== expectedSecret) {
      console.log('❌ Authorization failed')
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    
    console.log('✅ Authorization successful')
    
    // Fetch chat logs
    const rows = await db
      .select()
      .from(messageTable)
      .leftJoin(chatSessionTable, eq(messageTable.sessionId, chatSessionTable.sessionId))
      .orderBy(desc(messageTable.timestamp))
      .limit(100)

    const messages = rows.map((row) => ({
      ...row.Message,
      chatSession: row.ChatSession,
    }))

    console.log(`✅ Fetched ${messages.length} messages`)
    
    res.json(messages)
  } catch (error) {
    console.error('❌ Admin error:', error)
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// ===================================================
// HEALTH CHECK
// ===================================================

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/health/db', async (req: Request, res: Response) => {
  try {
    await db.execute(sql`SELECT 1`)
    res.json({ status: 'ok', db: 'up', timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('❌ DB health check failed:', error)
    res.status(500).json({
      status: 'error',
      db: 'down',
      error: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date().toISOString(),
    })
  }
})

// ===================================================
// EVENT NORMALIZATION (API Gateway v1 and v2)
// ===================================================

/**
 * Normalizes an API Gateway event so the rest of the handler works
 * identically regardless of whether it came from:
 *   - REST API (v1): event.httpMethod, event.path, event.body (string)
 *   - HTTP API (v2): event.requestContext.http.method, event.rawPath,
 *                    event.body (possibly base64-encoded)
 *
 * The normalized event always has:
 *   httpMethod       – upper-case HTTP verb
 *   path             – request path
 *   body             – decoded string (or null)
 *   isBase64Encoded  – false (already decoded above)
 */
function normalizeEvent(event: any): any {
  // Method: v2 stores it inside requestContext.http; v1 uses httpMethod directly
  const method =
    event.requestContext?.http?.method ??
    event.httpMethod ??
    'GET'

  // Path: v2 uses rawPath; v1 uses path
  const path = event.rawPath ?? event.path ?? '/'

  // Body: decode base64 if the gateway marked it as such
  let rawBody = event.body
  if (event.isBase64Encoded && typeof rawBody === 'string') {
    rawBody = Buffer.from(rawBody, 'base64').toString('utf-8')
  }

  return {
    ...event,
    httpMethod: method,      // serverless-http reads httpMethod (v1-style)
    path,                    // serverless-http reads path
    body: rawBody ?? null,
    isBase64Encoded: false,  // body is already a plain string now
  }
}

// ===================================================
// EXPORT LAMBDA HANDLER
// ===================================================

const _serverlessHandler = serverless(app)

export const handler = async (event: any, context: any): Promise<any> => {
  return _serverlessHandler(normalizeEvent(event), context)
}
