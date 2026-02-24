/**
 * ===================================================
 * AWS LAMBDA HANDLER - CHAT API
 * ===================================================
 *
 * COMPLETELY SEPARATE FROM NEXT.JS STATIC EXPORT
 *
 * This Lambda function handles all dynamic chat functionality:
 * - Gemini AI integration
 * - Redis session caching
 * - Neon (Postgres) message persistence
 *
 * Deployment:
 * - Package this file independently
 * - Deploy to AWS Lambda
 * - Expose via API Gateway
 * - Set environment variables (see below)
 *
 * Client calls this via:
 * POST https://api.yourdomain.com/chat
 * Body: { sessionId: string, message: string, clearHistory?: boolean }
 *
 * NO NEXT.JS DEPENDENCIES
 * NO APP ROUTER
 * NO SERVER ACTIONS
 */
/**
 * AWS Lambda Handler
 */
export declare const handler: (event: any) => Promise<{
    statusCode: number;
    headers: {
        'Content-Type': string;
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Methods': string;
        'Access-Control-Allow-Headers': string;
    };
    body: string;
}>;
//# sourceMappingURL=index.d.ts.map