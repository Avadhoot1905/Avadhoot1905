# Chat Lambda

AWS Lambda function for Gemini AI chat functionality with Redis caching, PostgreSQL persistence, and personality-driven MCP context.

## ✨ Features

- ✅ **Personality-driven AI**: Uses Model Context Protocol (MCP) with custom personality prompt
- ✅ **Dual Mode**: Run as Express server for local development OR AWS Lambda for production
- ✅ **Gemini 2.0 Flash**: Latest AI model with system instructions
- ✅ **Redis caching**: Fast responses with session management
- ✅ **PostgreSQL persistence**: Long-term chat history storage
- ✅ **Auto CORS**: Configured for frontend integration

## 🎭 Personality Context

The chatbot uses `personality-prompt.ts` as MCP context, giving Gemini AI:
- Core identity and persona
- Communication style guidelines  
- Technical expertise and skills
- Project portfolio context
- UI navigation markers for frontend integration

This ensures consistent, authentic, and contextually aware responses.

## 🚀 Local Development

### Run as Express Server

```bash
# From lambda/chat directory
npx tsx index.ts
# or
npm run dev
# or
npm run server
```

This starts a local Express server on port 3001 (configurable via `CHAT_PORT` env var):

```
🚀 Chat Server Started!
   URL: http://localhost:3001
   Endpoint: POST http://localhost:3001/chat
   Health: GET http://localhost:3001/health
   Model: gemini-2.0-flash-exp with personality context
```

### Alternative: From project root

```bash
# Using the dev script from root directory
npx tsx lambda/chat/index.ts
# or
node lambda/chat/index.ts
```

### Test the server

```bash
# Send a message
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "message": "Hello, who are you?"
  }'

# Health check
curl http://localhost:3001/health
```

## 📦 Dependencies

```bash
cd lambda/chat
npm install
```

**Installed packages:**
- `@google/generative-ai` - Gemini AI SDK
- `@upstash/redis` - Redis client for session caching
- `@prisma/client` - PostgreSQL ORM for message persistence

## 🔐 Environment Variables

Set these in AWS Lambda → Configuration → Environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google AI Studio API key | `...` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | `...` |
| `DATABASE_URL` | Neon PostgreSQL connection | `postgresql://user:pass@host/db` |

## 🚀 Deployment

### 1. Install dependencies

```bash
npm install
```

### 2. Build (optional for TypeScript)

```bash
npm run build
```

### 3. Create deployment package

```bash
zip -r function.zip . -x "*.ts" "tsconfig.json" "*.md"
```

### 4. Deploy to AWS Lambda

```bash
aws lambda create-function \
  --function-name portfolio-chat \
  --runtime nodejs20.x \
  --handler index.handler \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-role \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables="{GEMINI_API_KEY=xxx,UPSTASH_REDIS_REST_URL=xxx,UPSTASH_REDIS_REST_TOKEN=xxx,DATABASE_URL=xxx}"
```

### 5. Create API Gateway

```bash
# Create HTTP API
aws apigatewayv2 create-api \
  --name portfolio-chat-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:REGION:ACCOUNT_ID:function:portfolio-chat

# Your endpoint will be:
# https://API_ID.execute-api.REGION.amazonaws.com/chat
```

## 📡 API Usage

### Send Message

```bash
POST https://your-api-url/chat
Content-Type: application/json

{
  "sessionId": "user-session-123",
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "I'm doing well, thank you for asking!",
  "sessionId": "user-session-123"
}
```

### Clear History

```bash
POST https://your-api-url/chat
Content-Type: application/json

{
  "sessionId": "user-session-123",
  "clearHistory": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "History cleared"
}
```

## 🏗️ Architecture

```
Frontend (Next.js on localhost:3000)
  ↓ HTTP POST
Chat Server (Express on localhost:3001)
  ├→ Gemini AI (with personality context)
  ├→ Upstash Redis (session cache, 1 hour TTL)
  └→ Neon PostgreSQL (persistent storage)
```

## 🔌 Frontend Integration

The frontend is already configured to connect to the chat server:

1. **Chat API Client**: [`src/lib/chat-api.ts`](../../src/lib/chat-api.ts)
  - Uses same-origin route `/api/chat`
  - CloudFront routes `/api/*` to API Gateway

2. **Environment Configuration**: No public frontend API URL variable is required

3. **Run Both Servers**:
   ```bash
   # Terminal 1: Start chat server
   npx tsx lambda/chat/index.ts
   
   # Terminal 2: Start Next.js frontend
   npm run dev
   ```

4. **Access the Chat**:
   - Open http://localhost:3000
   - Open Messages app
   - Chat with the AI powered by your personality context!

## 🧪 Testing & Development Modes

### Mode 1: Express Server (Recommended for Development)

Runs a full HTTP server with proper request handling:

```bash
# Create .env file in project root with:
GEMINI_API_KEY=your-key
UPSTASH_REDIS_REST_URL=your-redis-url  
UPSTASH_REDIS_REST_TOKEN=your-redis-token
DATABASE_URL=your-database-url
CHAT_PORT=3001  # Optional, defaults to 3001

# Run the server
npx tsx lambda/chat/index.ts
```

### Mode 2: AWS Lambda (Production)

Deployed to AWS Lambda and invoked via API Gateway.

## 📊 Enhanced Features

- ✅ Gemini 2.0 Flash Exp model with personality context
- ✅ System instructions for consistent persona
- ✅ Redis caching for fast responses  
- ✅ PostgreSQL persistence for chat history
- ✅ Session management with 1-hour TTL
- ✅ CORS enabled for frontend integration
- ✅ Up to 30 messages per session history
- ✅ Health check endpoint (`/health`)
- ✅ Graceful shutdown handling

## 💰 Cost Estimate

| Service | Monthly Cost |
|---------|--------------|
| Lambda (512MB, 10K requests) | ~$0.00-$2.00 |
| Upstash Redis (free tier) | $0.00 |
| Neon PostgreSQL (free tier) | $0.00 |
| API Gateway (10K requests) | ~$0.01 |
| **Total** | **~$0-3/month** |

## 🔧 Troubleshooting

### Check logs
```bash
aws logs tail /aws/lambda/portfolio-chat --follow
```

### Common Issues

| Error | Solution |
|-------|----------|
| "GEMINI_API_KEY not found" | Set environment variable in Lambda |
| "Redis connection failed" | Check Upstash credentials |
| "Prisma client error" | Ensure DATABASE_URL is correct |
| CORS error | Update `Access-Control-Allow-Origin` in code |

---

**Built for ultra-low-cost serverless deployment** 🚀
