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

import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env') })

import express, { Request, Response } from 'express'
import serverless from 'serverless-http'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Redis } from '@upstash/redis'
import { PrismaClient } from '@prisma/client'
import { PERSONALITY_PROMPT } from './personality-prompt'

// ===================================================
// INITIALIZE CLIENTS
// ===================================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})
const prisma = new PrismaClient()

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
    
    const dbMessages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
      take: MAX_HISTORY_MESSAGES,
    })
    
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
      await prisma.chatSession.upsert({
        where: { sessionId },
        create: { sessionId },
        update: { updatedAt: new Date() },
      })

      await prisma.message.create({
        data: { sessionId, role, content },
      })
      
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
    
    await prisma.message.deleteMany({
      where: { sessionId },
    })
    
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

// ===================================================
// CHAT ROUTE
// ===================================================

app.post('/chat', async (req: Request, res: Response) => {
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

app.get('/admin/chats', async (req: Request, res: Response) => {
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
    const messages = await prisma.message.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        chatSession: true
      }
    })

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

// ===================================================
// EXPORT LAMBDA HANDLER
// ===================================================

const serverlessHandler = serverless(app)

export const handler = async (event: any, context: any) => {
  return serverlessHandler(event, context)
}
