/**
 * ===================================================
 * AWS LAMBDA HANDLER - CHAT API
 * ===================================================
 * 
 * COMPLETELY SEPARATE FROM NEXT.JS STATIC EXPORT
 * 
 * This Lambda function handles all dynamic chat functionality:
 * - Gemini AI integration
 * - Redis session caching
 * - Neon (Postgres) message persistence
 * 
 * Deployment:
 * - Package this file independently
 * - Deploy to AWS Lambda
 * - Expose via API Gateway
 * - Set environment variables (see below)
 * 
 * Client calls this via:
 * POST https://api.yourdomain.com/chat
 * Body: { sessionId: string, message: string, clearHistory?: boolean }
 * 
 * NO NEXT.JS DEPENDENCIES
 * NO APP ROUTER
 * NO SERVER ACTIONS
 */

// Load environment variables from .env file (for local development)
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env') })

import { GoogleGenerativeAI } from "@google/generative-ai"
import { Redis } from '@upstash/redis'
import { PrismaClient } from '@prisma/client'
import express, { Request, Response } from 'express'
import { PERSONALITY_PROMPT } from './personality-prompt.js'

// ===================================================
// ENVIRONMENT VARIABLES (Set in Lambda Configuration)
// ===================================================
// GEMINI_API_KEY=xxx
// UPSTASH_REDIS_REST_URL=xxx
// UPSTASH_REDIS_REST_TOKEN=xxx
// DATABASE_URL=postgresql://xxx
// ===================================================

// Initialize clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})
const prisma = new PrismaClient()

// Session configuration
const SESSION_TTL = 3600 // 1 hour
const MAX_HISTORY_MESSAGES = 30

/**
 * Get chat history from Redis or Neon
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
    
    // Fallback to database
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
 * Save chat history to Redis (best effort)
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
    // Don't throw - cache failure is not critical
  }
}

/**
 * Save individual message to Neon with retry logic
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
      // Ensure session exists
      await prisma.chatSession.upsert({
        where: { sessionId },
        create: { sessionId },
        update: { updatedAt: new Date() },
      })

      // Create the message
      await prisma.message.create({
        data: { 
          sessionId, 
          role, 
          content,
        },
      })
      
      console.log(`💾 ✅ Saved to database - Session: ${sessionId}, Role: ${role}, Length: ${content.length} chars`)
      return // Success - exit function
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`❌ Attempt ${attempt}/${retries} failed saving message to database:`, {
        sessionId,
        role,
        error: lastError.message,
      })
      
      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
      }
    }
  }
  
  // All retries failed - throw error to make it visible
  console.error(`🚨 CRITICAL: Failed to save ${role} message after ${retries} attempts`, {
    sessionId,
    contentPreview: content.substring(0, 100),
  })
  throw new Error(`Failed to save ${role} message to database: ${lastError?.message}`)
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
    // Get chat history
    const history = await getChatHistory(sessionId)
    
    // Build conversation history for Gemini
    const conversationHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))
    
    // Add current user message
    conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }],
    })
    
    // Send to Gemini with personality context
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      systemInstruction: PERSONALITY_PROMPT,
    })
    
    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // All except current message
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
  
  // Save messages to database (CRITICAL: Must succeed for both messages)
  try {
    console.log('\n💾 Saving messages to database...')
    
    // Save user message first
    await saveMessage(sessionId, 'user', userMessage)
    
    // CRITICAL: Save assistant response
    await saveMessage(sessionId, 'assistant', aiResponse)
    
    console.log('✅ Both messages saved successfully to database\n')
    
  } catch (error) {
    console.error('🚨 CRITICAL ERROR: Failed to save messages to database:', error)
    // Log details for debugging
    console.error('Session:', sessionId)
    console.error('User message length:', userMessage.length)
    console.error('AI response length:', aiResponse.length)
    // Re-throw to make the error visible to the client
    throw new Error(`Database save failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  // Update Redis cache (best effort - don't fail if this doesn't work)
  try {
    const updatedHistory = [
      ...await getChatHistory(sessionId),
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiResponse },
    ].slice(-MAX_HISTORY_MESSAGES)
    
    await saveChatHistory(sessionId, updatedHistory)
  } catch (error) {
    console.warn('⚠️  Warning: Failed to update Redis cache (non-critical):', error)
    // Don't throw - cache failure is not critical
  }
  
  return aiResponse
}

/**
 * AWS Lambda Handler
 */
export const handler = async (event: any) => {
  console.log('🚀 Lambda invoked:', JSON.stringify(event, null, 2))
  
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Update with your domain
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }
  
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }
  
  try {
    // Parse body
    const body = JSON.parse(event.body || '{}')
    const { sessionId, message, clearHistory } = body
    
    // Validate input
    if (!sessionId || typeof sessionId !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'sessionId is required' }),
      }
    }
    
    // Handle clear history request
    if (clearHistory === true) {
      await clearChatHistory(sessionId)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'History cleared' 
        }),
      }
    }
    
    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'message is required' }),
      }
    }
    
    // Process chat message
    const response = await sendMessageToGemini(sessionId, message.trim())
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response,
        sessionId,
      }),
    }
  } catch (error) {
    console.error('❌ Lambda error:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    }
  }
}

/**
 * Express server for local development
 */
function startExpressServer() {
  const app = express()
  const PORT = process.env.CHAT_PORT || 3001
  
  // Middleware
  app.use(express.json())
  
  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }
    
    next()
  })
  
  // Request logging
  app.use((req, res, next) => {
    console.log(`\n📨 ${req.method} ${req.path}`)
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('   Body:', JSON.stringify(req.body, null, 2))
    }
    next()
  })
  
  // POST /chat endpoint
  app.post('/chat', async (req: Request, res: Response) => {
    try {
      // Convert Express request to Lambda event format
      const lambdaEvent = {
        httpMethod: 'POST',
        path: '/chat',
        headers: req.headers as Record<string, string>,
        body: JSON.stringify(req.body),
      }
      
      // Call the Lambda handler
      const lambdaResponse = await handler(lambdaEvent)
      
      // Log response
      console.log(`   Status: ${lambdaResponse.statusCode}`)
      
      // Set headers from Lambda response
      if (lambdaResponse.headers) {
        Object.entries(lambdaResponse.headers).forEach(([key, value]) => {
          res.setHeader(key, value)
        })
      }
      
      // Send response
      res.status(lambdaResponse.statusCode).send(lambdaResponse.body)
    } catch (error) {
      console.error('❌ Error:', error)
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    }
  })
  
  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })
  
  // Start server
  app.listen(PORT, () => {
    console.log('\n🚀 Chat Server Started!')
    console.log(`   URL: http://localhost:${PORT}`)
    console.log(`   Endpoint: POST http://localhost:${PORT}/chat`)
    console.log(`   Health: GET http://localhost:${PORT}/health`)
    console.log(`   Model: gemini-2.5-flash-lite with personality context`)
    console.log('\n✨ Ready to receive requests from frontend')
    console.log('   Press Ctrl+C to stop\n')
  })
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down server...')
    process.exit(0)
  })
  
  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Shutting down server...')
    process.exit(0)
  })
}

/**
 * Run as Express server when executed directly
 */
if (require.main === module) {
  console.log('🔧 Starting in development mode...\n')
  
  // Validate environment variables
  const requiredEnvVars = [
    'GEMINI_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'DATABASE_URL',
  ]
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`))
    console.error('\n💡 Create a .env file in the root directory with these variables.\n')
    process.exit(1)
  }
  
  console.log('✅ Environment variables loaded')
  console.log('✅ Personality prompt loaded\n')
  
  startExpressServer()
}
