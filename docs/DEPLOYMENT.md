# AWS Lambda Deployment Guide

This directory contains a consolidated AWS Lambda function that combines both Chat and Admin APIs using Express and serverless-http.

## 📦 Project Structure

```
lambda/
├── index.ts                    # Main handler with Express routes
├── personality-prompt.ts       # AI personality configuration
├── prisma/
│   └── schema.prisma          # Database schema with ARM64 support
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript configuration
├── dist/                      # Compiled JavaScript (gitignored)
├── deploy/                    # Deployment package (gitignored)
│   ├── dist/
│   ├── node_modules/
│   ├── prisma/
│   ├── package.json
│   └── lambda.zip            # ✨ Upload this to AWS Lambda
```

## 🚀 Quick Start

### 1. Build the Deployment Package

```bash
cd lambda
npm run deploy:build
```

This script will:
- Clean old build artifacts
- Install production dependencies
- Generate Prisma client with ARM64 binary targets
- Compile TypeScript to JavaScript
- Create deployment package
- Generate `deploy/lambda.zip`

### 2. Upload to AWS Lambda

#### Option A: AWS Console
1. Go to AWS Lambda Console
2. Create a new function or update existing one
3. Upload `lambda/deploy/lambda.zip`
4. Set handler to: `dist/index.handler`

#### Option B: AWS CLI
```bash
aws lambda update-function-code \
  --function-name your-lambda-name \
  --zip-file fileb://lambda/deploy/lambda.zip
```

## ⚙️ Lambda Configuration

### Runtime Settings
- **Runtime**: `nodejs20.x`
- **Architecture**: `arm64`
- **Handler**: `dist/index.handler`
- **Memory**: 512 MB (recommended minimum)
- **Timeout**: 30 seconds (adjust based on AI response times)

### Environment Variables

Set these in AWS Lambda Configuration:

```bash
GEMINI_API_KEY=your_gemini_api_key
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
DATABASE_URL=postgresql://user:pass@host:port/db
ADMIN_SECRET=your_admin_secret_key
```

### API Gateway Integration

Configure API Gateway with the following routes:

| Method | Path           | Description                         |
|--------|----------------|-------------------------------------|
| POST   | /chat          | Chat API with Gemini AI             |
| GET    | /admin/chats   | Admin API to fetch chat logs        |
| GET    | /health        | Health check endpoint               |

## 📡 API Endpoints

### 1. Chat API - `POST /chat`

**Request:**
```json
{
  "sessionId": "unique-session-id",
  "message": "Your message here",
  "clearHistory": false
}
```

**Response:**
```json
{
  "success": true,
  "response": "AI generated response",
  "sessionId": "unique-session-id"
}
```

**Clear History:**
```json
{
  "sessionId": "unique-session-id",
  "clearHistory": true
}
```

### 2. Admin API - `GET /admin/chats`

**Headers:**
```
x-admin-secret: your_admin_secret
```

**Response:**
```json
[
  {
    "id": "msg_id",
    "sessionId": "session_id",
    "role": "user",
    "content": "message content",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "chatSession": { ... }
  }
]
```

### 3. Health Check - `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Build Scripts

### `npm run clean`
Removes `dist/` and `deploy/` folders

### `npm run build`
Compiles TypeScript to JavaScript

### `npm run deploy:build`
Complete build pipeline:
1. Clean old artifacts
2. Install dependencies
3. Generate Prisma client (with ARM64 support)
4. Compile TypeScript
5. Package everything into `deploy/lambda.zip`

### `npm run deploy:package`
Package existing build into zip (without rebuilding)

## 📋 Deployment Checklist

- [ ] Update environment variables in AWS Lambda
- [ ] Set handler to `dist/index.handler`
- [ ] Configure runtime as `nodejs20.x`
- [ ] Set architecture to `arm64`
- [ ] Configure API Gateway routes
- [ ] Set appropriate memory (512 MB minimum)
- [ ] Configure timeout (30 seconds recommended)
- [ ] Set up CloudWatch logs monitoring
- [ ] Configure VPC if database is in private subnet
- [ ] Test all endpoints after deployment

## 🗄️ Database Setup

The Lambda function uses Prisma to connect to PostgreSQL. Ensure:

1. Database is accessible from Lambda (VPC configuration if needed)
2. Connection string is properly formatted in `DATABASE_URL`
3. Database has the correct schema (run migrations):

```bash
# On your local machine or CI/CD
npx prisma migrate deploy
```

## 🔐 Security Notes

1. **Admin Secret**: Store `ADMIN_SECRET` in AWS Secrets Manager
2. **API Keys**: Use AWS Systems Manager Parameter Store for sensitive keys
3. **CORS**: Update CORS headers in `index.ts` for production
4. **Rate Limiting**: Consider adding API Gateway throttling
5. **VPC**: Deploy Lambda in VPC if database is private

## 📊 Monitoring

### CloudWatch Logs
Lambda automatically logs to CloudWatch:
- Request/response logs
- Error messages
- Performance metrics

### Key Metrics to Monitor
- Invocation count
- Error rate
- Duration (cold starts vs warm)
- Redis cache hit rate
- Database query performance

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"
- Ensure `prisma generate` ran during build
- Check `node_modules/.prisma/client` exists in zip

### "Invalid handler"
- Verify handler is set to `dist/index.handler`
- Check `dist/index.js` exports `handler`

### "Timeout"
- Increase Lambda timeout (default is 3 seconds)
- Optimize Gemini AI configuration
- Check database connection latency

### "Out of Memory"
- Increase Lambda memory allocation
- Monitor CloudWatch memory metrics
- Optimize dependency size

## 📦 Package Contents

The final `lambda.zip` includes **only** production files:

✅ **Included:**
- `dist/` - Compiled JavaScript
- `node_modules/` - Production dependencies
- `prisma/` - Database schema
- `package.json` - Package metadata

❌ **Excluded:**
- TypeScript source files (`.ts`)
- `tsconfig.json`
- Dev dependencies
- Environment files (`.env`)
- Build scripts

## 🔄 Updating the Lambda

```bash
# 1. Make code changes
# 2. Rebuild
cd lambda
npm run deploy:build

# 3. Upload
aws lambda update-function-code \
  --function-name your-lambda-name \
  --zip-file fileb://deploy/lambda.zip

# 4. Verify
curl https://your-api-gateway-url/health
```

## 📝 Notes

- Prisma client is generated with both `native` and `linux-arm64-openssl-3.0.x` binary targets
- Express app is wrapped with `serverless-http` for Lambda compatibility
- All routes use CORS headers (update for production)
- Redis caching is optional - system falls back to database
- Chat history is limited to 30 messages per session

## 🆘 Support

For issues:
1. Check CloudWatch logs
2. Verify environment variables
3. Test endpoints individually
4. Check database connectivity
5. Review Prisma client generation

---

**Handler Path**: `dist/index.handler`  
**Package Size**: ~109 MB  
**Runtime**: Node.js 20.x (ARM64)
