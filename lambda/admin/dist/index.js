"use strict";
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
const serverless_1 = require("@neondatabase/serverless");
const handler = async (event) => {
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
        const sql = (0, serverless_1.neon)(databaseUrl);
        // Fetch last 100 chats ordered by newest first
        const chats = await sql `
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
    }
    catch (error) {
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
exports.handler = handler;
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
    (0, exports.handler)(testEvent).then(result => {
        console.log('Response Status:', result.statusCode);
        console.log('Response Body:', result.body);
        process.exit(0);
    }).catch(error => {
        console.error('Test error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map