import type { NextConfig } from "next";

/**
 * ===================================================
 * NEXT.JS STATIC EXPORT CONFIGURATION
 * ===================================================
 * 
 * PURE STATIC SITE - NO SERVER, NO ISR, NO DYNAMIC RENDERING
 * 
 * Architecture:
 * -------------
 * ✅ STATIC (this Next.js app):
 *    - All pages pre-rendered at build time
 *    - Data fetched during build via scripts/fetch-build-data.ts
 *    - Outputs to /out folder
 *    - Deployed to S3 + CloudFront
 *    - Zero server costs
 * 
 * 🔥 DYNAMIC (separate Lambda):
 *    - Chat API in lambda/chat/index.ts
 *    - Deployed independently to AWS Lambda
 *    - Accessed via API Gateway
 *    - Only dynamic component
 * 
 * Build Process:
 * --------------
 * 1. npm run fetch-data  -> Fetches GitHub/LeetCode/Medium
 * 2. npm run build       -> Generates /out folder
 * 3. Deploy /out to S3
 * 4. Deploy lambda/chat to AWS Lambda
 * 
 * What's NOT supported (by design):
 * ---------------------------------
 * ❌ Server Actions ('use server')
 * ❌ API Routes (app/api/*)
 * ❌ ISR (Incremental Static Regeneration)
 * ❌ Dynamic Routes with fallback
 * ❌ Image Optimization (use unoptimized)
 * ❌ Runtime environment variables in UI
 * ❌ cookies(), headers(), redirect() in components
 * 
 * Deployment Cost:
 * ----------------
 * S3 + CloudFront: ~$1-3/month
 * Lambda (chat only): ~$0-5/month (free tier covers most usage)
 * Total: Ultra-low cost (~$5/month max)
 */

const nextConfig: NextConfig = {
  // Enable static export - generates /out folder
  output: 'export',
  
  // Disable image optimization (required for static export)
  images: {
    unoptimized: true,
  },
  
  // Turbopack configuration (Next.js 16+)
  turbopack: {},
  
  // Trailing slashes for S3 compatibility
  trailingSlash: true,
};

export default nextConfig;
