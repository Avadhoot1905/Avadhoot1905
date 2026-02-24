"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// Load environment variables from .env file (for local development)
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.join(process.cwd(), '.env') });
const generative_ai_1 = require("@google/generative-ai");
const redis_1 = require("@upstash/redis");
const client_1 = require("@prisma/client");
// ===================================================
// ENVIRONMENT VARIABLES (Set in Lambda Configuration)
// ===================================================
// GEMINI_API_KEY=xxx
// UPSTASH_REDIS_REST_URL=xxx
// UPSTASH_REDIS_REST_TOKEN=xxx
// DATABASE_URL=postgresql://xxx
// ===================================================
// Initialize clients
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const redis = new redis_1.Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});
const prisma = new client_1.PrismaClient();
// Session configuration
const SESSION_TTL = 3600; // 1 hour
const MAX_HISTORY_MESSAGES = 30;
/**
 * Get chat history from Redis or Neon
 */
async function getChatHistory(sessionId) {
    try {
        const cacheKey = `chat:${sessionId}`;
        const cached = await redis.get(cacheKey);
        if (cached && cached.length > 0) {
            console.log(`✅ Redis cache HIT for session: ${sessionId}`);
            return cached;
        }
        console.log(`❌ Redis cache MISS for session: ${sessionId}, falling back to DB`);
        // Fallback to database
        const dbMessages = await prisma.message.findMany({
            where: { sessionId },
            orderBy: { timestamp: 'asc' },
            take: MAX_HISTORY_MESSAGES,
        });
        return dbMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));
    }
    catch (error) {
        console.error('Error getting chat history:', error);
        return [];
    }
}
/**
 * Save chat history to Redis and Neon
 */
async function saveChatHistory(sessionId, history) {
    try {
        const cacheKey = `chat:${sessionId}`;
        await redis.setex(cacheKey, SESSION_TTL, JSON.stringify(history));
        console.log(`💾 Saved to Redis for session: ${sessionId}`);
    }
    catch (error) {
        console.error('Error saving to Redis:', error);
    }
}
/**
 * Save individual message to Neon
 */
async function saveMessage(sessionId, role, content) {
    try {
        // Ensure session exists
        await prisma.chatSession.upsert({
            where: { sessionId },
            create: { sessionId },
            update: { updatedAt: new Date() },
        });
        // Create the message
        await prisma.message.create({
            data: { sessionId, role, content },
        });
        console.log(`💾 Saved to Neon for session: ${sessionId}, role: ${role}`);
    }
    catch (error) {
        console.error('Error saving message to Neon:', error);
    }
}
/**
 * Clear chat history
 */
async function clearChatHistory(sessionId) {
    try {
        const cacheKey = `chat:${sessionId}`;
        await redis.del(cacheKey);
        await prisma.message.deleteMany({
            where: { sessionId },
        });
        console.log(`🗑️  Cleared history for session: ${sessionId}`);
    }
    catch (error) {
        console.error('Error clearing chat history:', error);
        throw error;
    }
}
/**
 * Send message to Gemini and get response
 */
async function sendMessageToGemini(sessionId, userMessage) {
    try {
        // Get chat history
        const history = await getChatHistory(sessionId);
        // Build conversation history for Gemini
        const conversationHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));
        // Add current user message
        conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }],
        });
        // Send to Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const chat = model.startChat({
            history: conversationHistory.slice(0, -1), // All except current message
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.9,
            },
        });
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const aiResponse = response.text();
        // Save messages to history
        await saveMessage(sessionId, 'user', userMessage);
        await saveMessage(sessionId, 'assistant', aiResponse);
        // Update cache
        const updatedHistory = [
            ...history,
            { role: 'user', content: userMessage },
            { role: 'assistant', content: aiResponse },
        ].slice(-MAX_HISTORY_MESSAGES);
        await saveChatHistory(sessionId, updatedHistory);
        return aiResponse;
    }
    catch (error) {
        console.error('Error sending message to Gemini:', error);
        throw error;
    }
}
/**
 * AWS Lambda Handler
 */
const handler = async (event) => {
    console.log('🚀 Lambda invoked:', JSON.stringify(event, null, 2));
    // CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Update with your domain
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }
    // Only accept POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
    try {
        // Parse body
        const body = JSON.parse(event.body || '{}');
        const { sessionId, message, clearHistory } = body;
        // Validate input
        if (!sessionId || typeof sessionId !== 'string') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'sessionId is required' }),
            };
        }
        // Handle clear history request
        if (clearHistory === true) {
            await clearChatHistory(sessionId);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'History cleared'
                }),
            };
        }
        // Validate message
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'message is required' }),
            };
        }
        // Process chat message
        const response = await sendMessageToGemini(sessionId, message.trim());
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                response,
                sessionId,
            }),
        };
    }
    catch (error) {
        console.error('❌ Lambda error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
            }),
        };
    }
};
exports.handler = handler;
/**
 * Local testing helper
 */
if (require.main === module) {
    // Test locally by running: node lambda/chat/index.js
    const testEvent = {
        httpMethod: 'POST',
        body: JSON.stringify({
            sessionId: 'test-session-123',
            message: 'Hello, who are you?',
        }),
    };
    (0, exports.handler)(testEvent).then(result => {
        console.log('Test result:', JSON.stringify(result, null, 2));
        process.exit(0);
    }).catch(error => {
        console.error('Test error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map