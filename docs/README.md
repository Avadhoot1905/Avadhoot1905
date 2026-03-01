# Lambda Functions - Build & Deployment Guide

## Setup

1. **Create `.env` file in the project root:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your environment variables in `.env`:**
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
   - `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
   - `DATABASE_URL` - Neon PostgreSQL connection string
   - `ADMIN_SECRET` - Secret for admin endpoints

3. **Install dependencies:**
   ```bash
   # Install root dependencies (includes Prisma)
   npm install
   
   # Generate Prisma Client
   npx prisma generate
   ```

## Development

### Express Development Server (Recommended)

The easiest way to test both Lambda functions locally is using the Express dev server, which wraps your Lambda handlers and provides HTTP endpoints on localhost.

**Start the dev server:**
```bash
npx tsx lambda/dev-server.ts
```

This starts:
- **Chat Server** on `http://localhost:3000`
- **Admin Server** on `http://localhost:3002`

**Test the Chat endpoint:**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","message":"Hello, who are you?"}'
```

**Test the Admin endpoint:**
```bash
curl http://localhost:3002/admin/chats \
  -H "x-admin-secret: your_admin_secret_here"
```

**Features:**
- ✅ No Lambda code modifications required
- ✅ CORS enabled for browser testing
- ✅ Request/response logging
- ✅ Proper error handling
- ✅ Environment variable loading from `.env`
- ✅ Works with existing Prisma client

### Running Lambda Functions Directly (TypeScript)

You can also test Lambda functions individually:

**Chat Lambda:**
```bash
cd lambda/chat
npm run dev
# or from root: npx tsx lambda/chat/index.ts
```

**Admin Lambda:**
```bash
cd lambda/admin
npm run dev
# or from root: npx tsx lambda/admin/index.ts
```

### Building (TypeScript → JavaScript)

**Chat Lambda:**
```bash
cd lambda/chat
npm run build
# Output: lambda/chat/dist/
```

**Admin Lambda:**
```bash
cd lambda/admin
npm run build
# Output: lambda/admin/dist/
```

### Running Compiled JavaScript

After building:
```bash
# Chat Lambda
node lambda/chat/dist/index.js

# Admin Lambda
node lambda/admin/dist/index.js
```

### Watch Mode (Auto-rebuild on changes)

```bash
cd lambda/chat
npm run build:watch
```

## TypeScript Configuration

Both Lambda functions use optimized `tsconfig.json` with:

- ✅ **Source Maps** - For debugging
- ✅ **Declaration Files** - Type definitions (.d.ts)
- ✅ **Strict Type Checking** - Full TypeScript safety
- ✅ **AWS Lambda Compatible** - ES2020, CommonJS modules
- ✅ **Node.js Types** - Built-in type support

### Key Settings:
- **Target**: ES2020
- **Module**: CommonJS (required for AWS Lambda)
- **Output**: `dist/` folder
- **Source Maps**: Enabled
- **Strict Mode**: Enabled

## Available Scripts

### Chat Lambda (`lambda/chat/package.json`)

```bash
npm run clean         # Remove dist folder
npm run build         # Clean + compile TypeScript
npm run build:watch   # Watch mode for development
npm run test          # Run compiled JavaScript
npm run dev           # Run TypeScript directly with tsx
npm run package       # Build and create function.zip
npm run deploy:prepare # Production build
```

### Admin Lambda (`lambda/admin/package.json`)

```bash
npm run clean         # Remove dist folder
npm run build         # Clean + compile TypeScript
npm run build:watch   # Watch mode for development
npm run test          # Run compiled JavaScript
npm run dev           # Run TypeScript directly with tsx
npm run package       # Build and create function.zip
npm run deploy:prepare # Production build
```

## Deployment to AWS Lambda

### Automatic Packaging

```bash
cd lambda/chat
npm run package
# Creates function.zip in lambda/chat/
```

This will:
1. Clean the dist folder
2. Compile TypeScript to JavaScript
3. Create a ZIP file with only the necessary files

### Manual Deployment Steps

1. **Build the function:**
   ```bash
   cd lambda/chat
   npm run build
   ```

2. **Install production dependencies:**
   ```bash
   npm install --production
   ```

3. **Generate Prisma Client (for chat lambda):**
   ```bash
   npx prisma generate --schema=../../prisma/schema.prisma
   ```

4. **Create deployment package:**
   ```bash
   cd dist
   zip -r ../function.zip .
   cd ..
   zip -r function.zip node_modules
   ```

5. **Upload to AWS Lambda:**
   - Upload `function.zip` to your Lambda function
   - Set environment variables in Lambda configuration
   - Configure handler: `index.handler`
   - Runtime: Node.js 18.x or later

## Environment Variables for AWS Lambda

Set these in AWS Lambda Console → Configuration → Environment variables:

**Chat Lambda:**
- `GEMINI_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `DATABASE_URL`

**Admin Lambda:**
- `DATABASE_URL`
- `ADMIN_SECRET`

## Troubleshooting

### TypeScript Compilation Errors

```bash
# Check TypeScript version
npx tsc --version

# List files being compiled
cd lambda/chat
npx tsc --listFiles
```

### Missing Dependencies

```bash
# Reinstall dependencies
cd lambda/chat
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client Issues

```bash
# Regenerate Prisma Client
cd ../../  # Go to root
npx prisma generate
```

### Testing Compiled Output

```bash
# Build and test in one command
cd lambda/chat
npm run build && npm run test
```

## File Structure

```
lambda/
├── chat/
│   ├── dist/              # Compiled JavaScript output
│   │   ├── index.js
│   │   ├── index.js.map   # Source map
│   │   └── index.d.ts     # Type declarations
│   ├── index.ts           # Source TypeScript
│   ├── package.json       # Dependencies & scripts
│   └── tsconfig.json      # TypeScript config
├── admin/
│   ├── dist/              # Compiled JavaScript output
│   ├── index.ts           # Source TypeScript
│   ├── package.json       # Dependencies & scripts
│   └── tsconfig.json      # TypeScript config
└── README.md              # This file
```

## Tips

- **Development**: Use `npm run dev` for fastest iteration (runs TypeScript directly)
- **Testing**: Use `npm run build && npm run test` to test compiled code
- **Deployment**: Use `npm run package` for production builds
- **Debugging**: Source maps are enabled - you can debug the compiled JS with original TS files
