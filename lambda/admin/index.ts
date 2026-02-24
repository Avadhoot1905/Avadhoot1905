// Load environment variables from .env file (for local development)
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env') })

import { PrismaClient } from '@prisma/client';

/**
 * Admin Lambda Handler
 * 
 * Purpose: Fetch chat logs from PostgreSQL database using Prisma
 * Security: Requires x-admin-secret header matching ADMIN_SECRET env var
 * 
 * Environment Variables:
 * - ADMIN_SECRET: Secret key for authentication
 * - DATABASE_URL: PostgreSQL connection string
 */

// Singleton PrismaClient instance
let prisma: PrismaClient;

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export const handler = async (event: any) => {
  // 🐛 Debug: Log incoming event
  console.log('\n🔍 [LAMBDA ADMIN] Incoming event:');
  console.log('   Headers:', JSON.stringify(event.headers, null, 2));
  console.log('   Path:', event.path || event.rawPath || 'UNDEFINED');
  
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }
  
  console.log('✅ [LAMBDA ADMIN] Authorization successful');

  // 2️⃣ Route Handling - Only support GET /admin/chats
  const path = event.path || event.rawPath || '';
  
  if (!path.includes('/admin/chats')) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Not Found' })
    };
  }

  try {
    // 3️⃣ Fetch Chat Logs using Prisma
    const prismaClient = getPrismaClient();
    
    // Fetch last 100 messages ordered by newest first
    // Include the related ChatSession data
    const messages = await prismaClient.message.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        chatSession: true
      }
    });

    console.log(`✅ [LAMBDA ADMIN] Fetched ${messages.length} messages`);

    // 4️⃣ Response Format
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages)
    };

  } catch (error) {
    console.error('❌ [LAMBDA ADMIN] Error fetching messages:', error);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
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
