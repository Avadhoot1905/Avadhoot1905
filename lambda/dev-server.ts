import * as dotenv from 'dotenv'
import * as http from 'node:http'
import { URL } from 'node:url'
import * as path from 'node:path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const PORT = Number(process.env.PORT || 3001)

let handlerPromise: Promise<typeof import('./index').handler> | null = null

async function getHandler(): Promise<typeof import('./index').handler> {
  if (!handlerPromise) {
    handlerPromise = import('./index').then((module) => module.handler)
  }
  return handlerPromise
}

type HeaderValue = string | string[] | undefined

function normalizeHeaders(headers: http.IncomingHttpHeaders): Record<string, string> {
  const normalized: Record<string, string> = {}
  Object.entries(headers).forEach(([key, value]: [string, HeaderValue]) => {
    if (value === undefined) return
    normalized[key] = Array.isArray(value) ? value.join(',') : String(value)
  })
  return normalized
}

function readBody(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  const method = req.method || 'GET'
  const host = req.headers.host || `localhost:${PORT}`
  const requestUrl = new URL(req.url || '/', `http://${host}`)

  try {
    const rawBody = await readBody(req)
    const event = {
      version: '2.0' as const,
      routeKey: '$default',
      rawPath: requestUrl.pathname,
      rawQueryString: requestUrl.search.startsWith('?') ? requestUrl.search.slice(1) : requestUrl.search,
      headers: normalizeHeaders(req.headers),
      queryStringParameters: Object.fromEntries(requestUrl.searchParams.entries()),
      requestContext: {
        http: {
          method,
          path: requestUrl.pathname,
          protocol: 'HTTP/1.1',
          sourceIp: req.socket.remoteAddress || '127.0.0.1',
          userAgent: req.headers['user-agent'] || '',
        },
      },
      isBase64Encoded: false,
      body: rawBody.length > 0 ? rawBody.toString('utf8') : undefined,
    }

    const handler = await getHandler()
    const lambdaResponse = await handler(event)
    res.statusCode = lambdaResponse.statusCode || 200

    Object.entries(lambdaResponse.headers || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        res.setHeader(key, String(value))
      }
    })

    res.end(lambdaResponse.body || '')
  } catch (error) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        error: 'Local dev server error',
        message: error instanceof Error ? error.message : String(error),
      })
    )
  }
})

server.listen(PORT, () => {
  console.log(`🚀 Lambda backend dev server running at http://localhost:${PORT}`)
  console.log('   Routes: POST /api/chat, GET /api/admin/chats')
})

process.on('SIGINT', () => {
  server.close(() => {
    console.log('\n🛑 Dev server stopped')
    process.exit(0)
  })
})
