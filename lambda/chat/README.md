# Chat Lambda

AWS Lambda function for Gemini AI chat functionality with Redis caching and PostgreSQL persistence.

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
Client
  ↓
API Gateway
  ↓
AWS Lambda
  ├→ Gemini AI (chat responses)
  ├→ Upstash Redis (session cache, 1 hour TTL)
  └→ Neon PostgreSQL (persistent storage)
```

## 🧪 Local Testing

```bash
# Set environment variables
export GEMINI_API_KEY="your-key"
export UPSTASH_REDIS_REST_URL="your-redis-url"
export UPSTASH_REDIS_REST_TOKEN="your-redis-token"
export DATABASE_URL="your-database-url"

# Run test
node index.ts
```

## 📊 Features

- ✅ Gemini 2.0 Flash AI model
- ✅ Redis caching for fast responses
- ✅ PostgreSQL persistence for chat history
- ✅ Session management with 1-hour TTL
- ✅ CORS enabled
- ✅ Error handling and logging
- ✅ Up to 30 messages per session history

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
