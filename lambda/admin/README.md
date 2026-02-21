# Admin Lambda Deployment Guide

## 📋 Overview

This Lambda provides admin functionality for viewing chat logs from the Neon PostgreSQL database.

**Security:** Requires `x-admin-secret` header for authentication.

---

## 📁 Files

```
lambda/admin/
├── index.ts           # Lambda handler
├── package.json       # Dependencies
└── tsconfig.json      # TypeScript config
```

---

## 🚀 Deployment Steps

### 1. Install Dependencies

```bash
cd lambda/admin
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

### 3. Create Deployment Package

```bash
# Create zip file with all dependencies
zip -r function.zip . -x "*.ts" "tsconfig.json" "*.md"
```

### 4. Deploy to AWS Lambda

#### Option A: AWS CLI

```bash
aws lambda create-function \
  --function-name portfolio-admin \
  --runtime nodejs20.x \
  --handler index.handler \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 256 \
  --environment Variables="{ADMIN_SECRET=your-secret-key-here,DATABASE_URL=your-neon-url-here}"
```

#### Option B: AWS Console

1. Go to AWS Lambda Console
2. Click "Create function"
3. Choose "Author from scratch"
4. Function name: `portfolio-admin`
5. Runtime: Node.js 20.x
6. Upload `function.zip`
7. Set handler: `index.handler`
8. Add environment variables (see below)

---

## 🔐 Environment Variables

Set these in AWS Lambda Console → Configuration → Environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_SECRET` | Secret key for authentication | `my-super-secret-key-2024` |
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |

**⚠️ Security Note:** Never commit these values to Git. Use AWS Secrets Manager for production.

---

## 🌐 API Gateway Setup

### 1. Create REST API

```bash
aws apigatewayv2 create-api \
  --name portfolio-admin-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:REGION:ACCOUNT_ID:function:portfolio-admin
```

### 2. Create Route

- **Method:** GET
- **Path:** `/admin/chats`
- **Integration:** Lambda function `portfolio-admin`

### 3. Deploy API

```bash
aws apigatewayv2 create-stage \
  --api-id YOUR_API_ID \
  --stage-name prod \
  --auto-deploy
```

### 4. Get API URL

Your endpoint will be:
```
https://YOUR_API_ID.execute-api.REGION.amazonaws.com/prod/admin/chats
```

---

## 🔧 Update Static Admin UI

After deploying the Lambda and API Gateway:

1. Open `/public/admin.html`
2. Replace `API_URL` on line 210:

```javascript
const API_URL = 'https://YOUR_API_ID.execute-api.REGION.amazonaws.com/prod/admin/chats';
```

3. Rebuild the static site:

```bash
npm run build
```

4. Redeploy to S3:

```bash
aws s3 sync out/ s3://your-bucket-name/ --delete
```

---

## 🧪 Testing

### Test Lambda Locally (using AWS SAM)

```bash
# Install AWS SAM CLI first
sam local invoke portfolio-admin \
  --event test-event.json \
  --env-vars env.json
```

### Test via API

```bash
curl -X GET https://YOUR_API_URL/admin/chats \
  -H "x-admin-secret: your-secret-key-here" \
  -H "Content-Type: application/json"
```

**Expected Response (200):**
```json
[
  {
    "id": "uuid",
    "user_message": "Hello",
    "bot_reply": "Hi there!",
    "created_at": "2024-02-21T12:00:00Z"
  }
]
```

**Unauthorized Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

## 📊 Monitoring

### CloudWatch Logs

```bash
aws logs tail /aws/lambda/portfolio-admin --follow
```

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" | Wrong secret | Check `ADMIN_SECRET` env var |
| "DATABASE_URL not configured" | Missing env var | Add `DATABASE_URL` in Lambda config |
| Timeout | Query too slow | Increase timeout or add index on `created_at` |
| Connection refused | Wrong DB URL | Verify Neon connection string |

---

## 💰 Cost Estimate

| Resource | Monthly Cost |
|----------|-------------|
| Lambda (128MB, 1000 requests/month) | ~$0.00 (free tier) |
| API Gateway (1000 requests/month) | ~$0.00 (free tier) |
| **Total** | **~$0/month** (within free tier) |

---

## 🔒 Security Best Practices

1. **Never hardcode secrets** in frontend code
2. **Use HTTPS only** for API Gateway
3. **Rotate admin secret** regularly
4. **Enable CloudWatch logging** for audit trail
5. **Use IAM roles** instead of access keys
6. **Consider AWS WAF** if public-facing
7. **Implement rate limiting** in API Gateway

---

## 🚨 Production Checklist

- [ ] Lambda deployed with correct environment variables
- [ ] API Gateway configured and deployed
- [ ] Admin secret is strong and secure
- [ ] CloudWatch logging enabled
- [ ] Static admin UI updated with API URL
- [ ] Tested authentication (valid + invalid secrets)
- [ ] Verified chat logs are fetched correctly
- [ ] Checked Lambda execution time and memory usage
- [ ] Set up CloudWatch alarms for errors
- [ ] Documented admin secret location (AWS Secrets Manager)

---

## 📞 Support

For issues or questions, check:
- AWS Lambda logs in CloudWatch
- Neon database connection status
- API Gateway logs
- Network connectivity from Lambda to Neon

---

**Built for ultra-low-cost static deployment** 🚀
