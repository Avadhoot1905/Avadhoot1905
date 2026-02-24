/**
 * ===================================================
 * LOCAL DEVELOPMENT SERVER - EXPRESS WRAPPER
 * ===================================================
 * 
 * This TypeScript Express server wraps your existing Lambda handlers
 * for local development without modifying the Lambda code.
 * 
 * Features:
 * - Chat endpoint on port 3000
 * - Admin endpoint on port 3002
 * - CORS support
 * - Request/response logging
 * - Environment variable loading
 * - Proper error handling
 * 
 * Usage:
 *   npx tsx lambda/dev-server.ts
 * 
 * Then test with:
 *   curl -X POST http://localhost:3000/chat \
 *     -H "Content-Type: application/json" \
 *     -d '{"sessionId":"test-123","message":"Hello!"}'
 * 
 *   curl http://localhost:3002/admin/chats \
 *     -H "x-admin-secret: your-secret"
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import express, { Request, Response, Application } from 'express'

// ===================================================
// 1. LOAD ENVIRONMENT VARIABLES
// ===================================================
dotenv.config({ path: path.join(process.cwd(), '.env') })

// ===================================================
// 2. VALIDATE REQUIRED ENVIRONMENT VARIABLES
// ===================================================
const requiredEnvVars = [
  'GEMINI_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'DATABASE_URL',
  'ADMIN_SECRET'
]

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`))
  console.error('\n💡 Create a .env file in the root directory with these variables.\n')
  process.exit(1)
}

console.log('✅ Environment variables loaded\n')

// ===================================================
// 3. IMPORT LAMBDA HANDLERS
// ===================================================
// These are imported after environment variables are loaded
import { handler as chatHandler } from './chat/index.js'
import { handler as adminHandler } from './admin/index.js'

// ===================================================
// 4. HELPER FUNCTION: Convert Express Request to Lambda Event
// ===================================================
interface LambdaEvent {
  httpMethod: string
  path: string
  headers: Record<string, string>
  body?: string
}

function expressToLambdaEvent(req: Request): LambdaEvent {
  // Express headers are IncomingHttpHeaders which can have string | string[] | undefined values
  // We need to normalize them to Record<string, string> for Lambda compatibility
  const headers: Record<string, string> = {};
  
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value !== undefined) {
      // If value is an array, join it; otherwise convert to string
      headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
    }
  });
  
  return {
    httpMethod: req.method,
    path: req.path,
    headers,
    body: req.body ? JSON.stringify(req.body) : undefined
  }
}

// ===================================================
// 5. HELPER FUNCTION: Send Lambda Response via Express
// ===================================================
interface LambdaResponse {
  statusCode: number
  headers?: Record<string, string>
  body: string
}

function sendLambdaResponse(res: Response, lambdaResponse: LambdaResponse): void {
  // Set headers from Lambda response
  if (lambdaResponse.headers) {
    Object.entries(lambdaResponse.headers).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
  }

  // Send response
  res.status(lambdaResponse.statusCode).send(lambdaResponse.body)
}

// ===================================================
// 6. CREATE CHAT SERVER (PORT 3000)
// ===================================================
const chatApp: Application = express()
const CHAT_PORT = 3000

// Middleware
chatApp.use(express.json())

// CORS middleware
chatApp.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  next()
})

// Request logging middleware
chatApp.use((req, res, next) => {
  console.log(`\n📨 [CHAT] ${req.method} ${req.path}`)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   Body:', JSON.stringify(req.body, null, 2))
  }
  next()
})

// POST /chat endpoint
chatApp.post('/chat', async (req: Request, res: Response) => {
  try {
    // Convert Express request to Lambda event format
    const lambdaEvent = expressToLambdaEvent(req)
    
    // Call the Lambda handler
    const lambdaResponse = await chatHandler(lambdaEvent)
    
    // Log response
    console.log(`   Status: ${lambdaResponse.statusCode}`)
    
    // Send Lambda response back to client
    sendLambdaResponse(res, lambdaResponse)
  } catch (error) {
    console.error('❌ [CHAT] Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
})

// Start chat server
chatApp.listen(CHAT_PORT, () => {
  console.log(`🚀 Chat Server running on http://localhost:${CHAT_PORT}`)
  console.log(`   Endpoint: POST http://localhost:${CHAT_PORT}/chat`)
})

// ===================================================
// 7. CREATE ADMIN SERVER (PORT 3002)
// ===================================================
const adminApp: Application = express()
const ADMIN_PORT = 3002

// Middleware
adminApp.use(express.json())

// CORS middleware
adminApp.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  next()
})

// Request logging middleware
adminApp.use((req, res, next) => {
  console.log(`\n📨 [ADMIN] ${req.method} ${req.path}`)
  console.log('   All headers:', JSON.stringify(req.headers, null, 2))
  
  const adminSecret = req.headers['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_SECRET;
  
  console.log('   x-admin-secret header:', adminSecret ? `[${String(adminSecret).length} chars]` : 'MISSING')
  console.log('   ADMIN_SECRET env var:', expectedSecret ? `[${expectedSecret.length} chars]` : 'NOT SET')
  
  next()
})

// GET /admin/chats endpoint
adminApp.get('/admin/chats', async (req: Request, res: Response) => {
  try {
    // Convert Express request to Lambda event format
    const lambdaEvent = expressToLambdaEvent(req)
    
    // Call the Lambda handler
    const lambdaResponse = await adminHandler(lambdaEvent)
    
    // Log response
    console.log(`   Status: ${lambdaResponse.statusCode}`)
    
    // Send Lambda response back to client
    sendLambdaResponse(res, lambdaResponse)
  } catch (error) {
    console.error('❌ [ADMIN] Error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Start admin server
adminApp.listen(ADMIN_PORT, () => {
  console.log(`🔐 Admin Server running on http://localhost:${ADMIN_PORT}`)
  console.log(`   Endpoint: GET http://localhost:${ADMIN_PORT}/admin/chats`)
})

// ===================================================
// 8. GRACEFUL SHUTDOWN
// ===================================================
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down servers...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down servers...')
  process.exit(0)
})

console.log('\n✨ Development servers started successfully!')
console.log('   Press Ctrl+C to stop\n')
