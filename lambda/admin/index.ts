// Load environment variables from .env file (for local development)
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env') })

import { desc, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'

/**
 * Admin Lambda Handler
 * 
 * Purpose: Fetch chat logs from PostgreSQL database using Drizzle ORM
 * Security: Requires x-admin-secret header matching ADMIN_SECRET env var
 * 
 * Environment Variables:
 * - ADMIN_SECRET: Secret key for authentication
 * - DATABASE_URL: PostgreSQL connection string
 */

const chatSessionTable = pgTable('ChatSession', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  sessionId: text('sessionId').notNull(),
  createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' }).notNull(),
})

const messageTable = pgTable('Message', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  sessionId: text('sessionId').notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp', { precision: 3, mode: 'date' }).notNull().defaultNow(),
})

let pool: Pool | undefined

function getDb() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required')
    }
    pool = new Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 5000,
    })
  }

  return drizzle(pool)
}

export const handler = async (event: any) => {
  // ===================================================
  // NORMALIZE EVENT (API Gateway v1 and v2)
  // ===================================================
  //
  // Method: v2 stores it inside requestContext.http; v1 uses httpMethod directly
  const method: string =
    event.requestContext?.http?.method ??
    event.httpMethod ??
    'GET'

  // Path: v2 uses rawPath; v1 uses path
  const path: string = event.rawPath ?? event.path ?? '/'

  // Body: decode base64 first if the gateway marked it as such.
  // Admin is GET-only so body is not used in business logic, but we
  // normalize it here for completeness and future-proofing.
  let _rawBody = event.body
  if (event.isBase64Encoded && typeof _rawBody === 'string') {
    _rawBody = Buffer.from(_rawBody, 'base64').toString('utf-8')
  }
  const body: Record<string, any> =
    _rawBody && typeof _rawBody === 'object'
      ? (_rawBody as Record<string, any>)
      : typeof _rawBody === 'string'
      ? (() => { try { return JSON.parse(_rawBody) } catch { return {} } })()
      : {}
  // ===================================================

  // CORS headers for HTTP API v2.0
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://avadhootgm.in',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
  
  // Handle OPTIONS preflight request
  if (method === 'OPTIONS') {
    console.log('✅ [LAMBDA ADMIN] OPTIONS preflight request');
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }
  
  // 🐛 Debug: Log incoming event
  console.log('\n🔍 [LAMBDA ADMIN] Incoming event:');
  console.log('   Headers:', JSON.stringify(event.headers, null, 2));
  console.log('   Path:', path || 'UNDEFINED');
  
  // 1️⃣ Security Check - Validate admin secret
  // Normalize all header keys to lowercase for consistent comparison
  const normalizedHeaders: Record<string, string> = {};
  if (event.headers && typeof event.headers === 'object') {
    Object.keys(event.headers).forEach(key => {
      const value = event.headers[key];
      if (value !== undefined && value !== null) {
        normalizedHeaders[key.toLowerCase()] = String(value).trim();
      }
    });
  }
  
  console.log('   Normalized headers:', JSON.stringify(normalizedHeaders, null, 2));
  
  const adminSecret = normalizedHeaders['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_SECRET?.trim();
  
  console.log('   Received secret:', adminSecret ? `[${adminSecret.length} chars]` : 'MISSING');
  console.log('   Expected secret:', expectedSecret ? `[${expectedSecret.length} chars]` : 'NOT CONFIGURED');
  console.log('   Secrets match:', adminSecret === expectedSecret);

  if (!adminSecret || !expectedSecret || adminSecret !== expectedSecret) {
    console.log('❌ [LAMBDA ADMIN] Authorization failed');
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }
  
  console.log('✅ [LAMBDA ADMIN] Authorization successful');

  // 2️⃣ Route Handling - Only support GET /admin/chats
  if (!path.includes('/admin/chats')) {
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not Found' })
    };
  }

  try {
    // 3️⃣ Fetch chat logs using Drizzle
    const db = getDb()

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

    console.log(`✅ [LAMBDA ADMIN] Fetched ${messages.length} messages`);

    // 4️⃣ Response Format
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://avadhootgm.in',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messages)
    };

  } catch (error) {
    console.error('❌ [LAMBDA ADMIN] Error fetching messages:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://avadhootgm.in',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

/**
 * Local testing helper
 */
if (require.main === module) {
  console.log('🔐 Testing Admin Lambda Handler\n');
  
  // Test event with admin secret
  const testEvent = {
    httpMethod: 'GET',
    path: '/admin/chats',
    headers: {
      'x-admin-secret': process.env.ADMIN_SECRET || 'test-secret'
    }
  };
  
  handler(testEvent).then(result => {
    console.log('Response Status:', result.statusCode);
    console.log('Response Body:', result.body);
    process.exit(0);
  }).catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  });
}
