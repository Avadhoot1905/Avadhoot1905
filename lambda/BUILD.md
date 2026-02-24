# Lambda Functions - Quick Build Reference

## 🚀 Quick Start

```bash
# From lambda/chat or lambda/admin directory:
npm run dev          # Run TypeScript directly (development)
npm run build        # Compile to JavaScript
npm run test         # Run compiled JavaScript
npm run package      # Create deployment ZIP
```

## 📁 What Gets Built

```
lambda/chat/
├── index.ts          ← Source TypeScript
└── dist/             ← Compiled output
    ├── index.js      ← Compiled JavaScript
    ├── index.js.map  ← Source map (debugging)
    └── index.d.ts    ← Type declarations
```

## ⚙️ TypeScript Configuration

Both `chat` and `admin` Lambda functions have identical `tsconfig.json`:

### Key Features:
- ✅ **AWS Lambda Compatible**: ES2020, CommonJS
- ✅ **Source Maps**: Enabled for debugging
- ✅ **Type Declarations**: `.d.ts` files generated
- ✅ **Strict Type Checking**: Full safety
- ✅ **Node Types**: Built-in support

### Important Settings:
```json
{
  "target": "ES2020",           // AWS Lambda Node.js runtime
  "module": "commonjs",         // Required for Lambda
  "outDir": "./dist",           // Output directory
  "sourceMap": true,            // For debugging
  "declaration": true,          // Generate .d.ts
  "strict": true,               // Full type safety
  "types": ["node"]             // Node.js types
}
```

## 🔧 Build Process

### Development (Fast)
```bash
npm run dev
# Uses tsx - runs TypeScript directly without compilation
# ✓ Fast iteration
# ✓ No build step
# ✓ Hot reload
```

### Production (Optimized)
```bash
npm run build
# 1. Cleans dist/ folder
# 2. Compiles TypeScript → JavaScript
# 3. Generates source maps
# 4. Creates type declarations
# ✓ Optimized for deployment
# ✓ Debuggable with source maps
```

### Watch Mode
```bash
npm run build:watch
# Auto-rebuilds on file changes
# ✓ Good for testing compiled output
```

## 📦 Deployment Package

```bash
npm run package
```

Creates `function.zip` containing:
- Compiled JavaScript (`dist/`)
- Type declarations (`.d.ts`)
- Source maps (`.js.map`)

Upload to AWS Lambda with:
- **Handler**: `index.handler`
- **Runtime**: Node.js 18.x+

## 🧪 Testing

### Test TypeScript Directly
```bash
npm run dev
```

### Test Compiled JavaScript
```bash
npm run build
npm run test
```

### Test Both
```bash
npm run build && npm run test
```

## 📋 Dependencies

### Chat Lambda
- `@google/generative-ai` - Gemini AI
- `@upstash/redis` - Redis caching
- `@prisma/client` - Database ORM
- `dotenv` - Environment variables

### Admin Lambda
- `@neondatabase/serverless` - Neon DB
- `dotenv` - Environment variables

## 🔑 Environment Variables

Create `.env` in project root:
```env
GEMINI_API_KEY=your_key
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
DATABASE_URL=postgresql://...
ADMIN_SECRET=your_secret
```

## 🐛 Troubleshooting

### Build fails
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### TypeScript errors
```bash
# Check what files are being compiled
npx tsc --listFiles
```

### Runtime errors
```bash
# Check compiled output
cat dist/index.js
# Run with source maps for better errors
node --enable-source-maps dist/index.js
```

## 📊 Comparison: Development vs Production

| Aspect | Development (`npm run dev`) | Production (`npm run build`) |
|--------|---------------------------|----------------------------|
| Speed | ⚡ Very fast | 🐌 Slower (compile step) |
| Process | Run TypeScript directly | Compile to JavaScript |
| Tool | tsx | TypeScript compiler |
| Use case | Local testing | AWS deployment |
| Source maps | Not needed | Included |
| Type checking | On-the-fly | At compile time |

## 🎯 Best Practices

1. **Development**: Always use `npm run dev`
2. **Before commit**: Run `npm run build` to check for compile errors
3. **Before deploy**: Test with `npm run build && npm run test`
4. **CI/CD**: Use `npm run deploy:prepare` for production builds

## 📝 Common Commands

```bash
# Development workflow
npm run dev                    # Start development

# Build workflow
npm run clean                  # Clean output
npm run build                  # Build once
npm run build:watch           # Build on changes

# Testing workflow  
npm run test                   # Test compiled output

# Deployment workflow
npm run deploy:prepare        # Production build
npm run package               # Create ZIP file
```
