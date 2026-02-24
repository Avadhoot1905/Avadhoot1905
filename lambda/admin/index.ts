// Load environment variables from .env file (for local development)
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env') })

import { neon } from '@neondatabase/serverless';

/**
 * Admin Lambda Handler
 * 
 * Purpose: Fetch chat logs from Neon PostgreSQL database
 * Security: Requires x-admin-secret header matching ADMIN_SECRET env var
 * 
 * Environment Variables:
 * - ADMIN_SECRET: Secret key for authentication
 * - DATABASE_URL: Neon PostgreSQL connection string
 */

interface ChatLog {
  id: string;
  user_message: string;
  bot_reply: string;
  created_at: string;
}

export const handler = async (event: any) => {
  // 1️⃣ Security Check - Validate admin secret
  const adminSecret = event.headers?.['x-admin-secret'] || event.headers?.['X-Admin-Secret'];
  const expectedSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || adminSecret !== expectedSecret) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

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
    // 3️⃣ Fetch Chat Logs from Neon
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    const sql = neon(databaseUrl);
    
    // Fetch last 100 chats ordered by newest first
    const chats = await sql`
      SELECT 
        id,
        user_message,
        bot_reply,
        created_at
      FROM messages
      ORDER BY created_at DESC
      LIMIT 100
    `;

    // 4️⃣ Response Format
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chats)
    };

  } catch (error) {
    console.error('Error fetching chats:', error);
    
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
