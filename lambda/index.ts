import type { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda'
import { randomUUID } from 'node:crypto'
import {
  BedrockRuntimeClient,
  ConverseCommand,
  type Message as BedrockMessage,
} from '@aws-sdk/client-bedrock-runtime'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  BatchWriteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import { PERSONALITY_PROMPT } from './personality-prompt'

// ---------------------------------------------------------------------------
// Configuration (all from environment — no hardcoded values)
// ---------------------------------------------------------------------------
const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0'
const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'chat_history'
// Region is picked up automatically from AWS_REGION in Lambda.
const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'

// Active chat provider: 'gemini' (default) or 'bedrock'. The Bedrock path is
// kept fully intact as a fallback; Gemini is active while Bedrock on-demand
// quota is unavailable on the account.
const LLM_PROVIDER = (process.env.LLM_PROVIDER || 'gemini').toLowerCase()
// Google Gemini (Generative Language API) configuration.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL_ID = process.env.GEMINI_MODEL_ID || 'gemini-3.5-flash'
// Gemini 3.x thinking level; 'low' minimises latency/cost for chat. Empty string
// leaves the model default (set GEMINI_THINKING_LEVEL="" to omit it).
const GEMINI_THINKING_LEVEL =
  process.env.GEMINI_THINKING_LEVEL === undefined ? 'low' : process.env.GEMINI_THINKING_LEVEL

const MAX_HISTORY_MESSAGES = 30
const ADMIN_LIMIT = 100

// ---------------------------------------------------------------------------
// Singleton AWS SDK v3 clients (reused across warm invocations)
// ---------------------------------------------------------------------------
declare global {
  // eslint-disable-next-line no-var
  var __bedrockClient__: BedrockRuntimeClient | undefined
  // eslint-disable-next-line no-var
  var __dynamoDoc__: DynamoDBDocumentClient | undefined
}

const bedrock =
  globalThis.__bedrockClient__ ??
  new BedrockRuntimeClient({ region: AWS_REGION, maxAttempts: 3 })
if (!globalThis.__bedrockClient__) globalThis.__bedrockClient__ = bedrock

const ddb =
  globalThis.__dynamoDoc__ ??
  DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION, maxAttempts: 3 }), {
    marshallOptions: { removeUndefinedValues: true },
  })
if (!globalThis.__dynamoDoc__) globalThis.__dynamoDoc__ = ddb

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json',
}

class HttpError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

type NormalizedEvent = {
  requestId: string
  method: string
  path: string
  headers: Record<string, string>
  query: Record<string, string>
  body: string | null
  isBase64Encoded: boolean
}

function normalizeEvent(event: APIGatewayProxyEvent | APIGatewayProxyEventV2): NormalizedEvent {
  const isV2 = (event as APIGatewayProxyEventV2).version === '2.0'
  const requestId =
    (event as APIGatewayProxyEventV2).requestContext?.requestId ||
    (event as APIGatewayProxyEvent).requestContext?.requestId ||
    `req-${Date.now()}`
  const method = isV2
    ? ((event as APIGatewayProxyEventV2).requestContext.http.method || 'GET')
    : ((event as APIGatewayProxyEvent).httpMethod || 'GET')
  const path = isV2
    ? ((event as APIGatewayProxyEventV2).rawPath || '/')
    : ((event as APIGatewayProxyEvent).path || '/')

  const rawHeaders = event.headers || {}
  const headers = Object.fromEntries(
    Object.entries(rawHeaders)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key.toLowerCase(), String(value)])
  )

  const query = isV2
    ? (((event as APIGatewayProxyEventV2).queryStringParameters || {}) as Record<string, string>)
    : (((event as APIGatewayProxyEvent).queryStringParameters || {}) as Record<string, string>)

  console.log(
    `[lambda][${requestId}] normalizeEvent: method=${method} path=${path} isV2=${isV2} base64=${!!event.isBase64Encoded}`
  )

  return {
    requestId,
    method,
    path,
    headers,
    query,
    body: event.body ?? null,
    isBase64Encoded: !!event.isBase64Encoded,
  }
}

function parseJsonBody(event: Pick<NormalizedEvent, 'body' | 'isBase64Encoded' | 'requestId'>): Record<string, unknown> {
  if (!event.body) return {}

  const decoded = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body

  if (!decoded.trim()) return {}

  try {
    return JSON.parse(decoded) as Record<string, unknown>
  } catch {
    console.error(`[lambda][${event.requestId}] parseJsonBody failed: invalid JSON`)
    throw new HttpError(400, 'Invalid JSON body')
  }
}

function jsonResponse(statusCode: number, bodyObject: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(bodyObject),
  }
}

// A stored chat message item in the `chat_history` DynamoDB table.
//   PK: chatId    (== sessionId)
//   SK: timestamp (ISO-8601 string, lexicographically sortable)
type ChatItem = {
  chatId: string
  timestamp: string
  id: string
  sessionId: string
  role: string
  content: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Conversation persistence (DynamoDB)
// ---------------------------------------------------------------------------

/**
 * Load conversation history for a session. Returns the most recent
 * MAX_HISTORY_MESSAGES messages in chronological (ascending) order — the same
 * shape the previous Redis-cached history provided to the model.
 */
async function getChatHistory(sessionId: string): Promise<{ role: string; content: string }[]> {
  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: DYNAMODB_TABLE_NAME,
        KeyConditionExpression: 'chatId = :c',
        ExpressionAttributeValues: { ':c': sessionId },
        // Newest first, then reverse to chronological order below.
        ScanIndexForward: false,
        Limit: MAX_HISTORY_MESSAGES,
      })
    )

    const items = (result.Items || []) as ChatItem[]
    console.log(`[lambda] getChatHistory: sessionId=${sessionId} count=${items.length}`)

    return items
      .reverse()
      .map((item) => ({ role: item.role, content: item.content }))
  } catch (error) {
    console.error('[lambda] getChatHistory error:', error)
    return []
  }
}

/**
 * Persist a single message with retry + exponential backoff.
 * An explicit timestamp is passed so user/assistant messages keep a stable,
 * strictly-ordered sort key.
 */
async function saveMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  timestamp: string,
  retries: number = 3
): Promise<void> {
  const item: ChatItem = {
    chatId: sessionId,
    timestamp,
    id: randomUUID(),
    sessionId,
    role,
    content,
    createdAt: timestamp,
  }

  let lastError: Error | null = null
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await ddb.send(new PutCommand({ TableName: DYNAMODB_TABLE_NAME, Item: item }))
      console.log(`[lambda] saveMessage success: sessionId=${sessionId} role=${role} attempt=${attempt}`)
      return
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`[lambda] saveMessage failed: sessionId=${sessionId} role=${role} attempt=${attempt}`, lastError)
      if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100))
    }
  }
  throw new Error(`Failed to save ${role} message: ${lastError?.message}`)
}

/**
 * Delete all messages for a session (paginated query + batched deletes).
 */
async function clearChatHistory(sessionId: string): Promise<void> {
  try {
    let lastKey: Record<string, unknown> | undefined
    do {
      const result = await ddb.send(
        new QueryCommand({
          TableName: DYNAMODB_TABLE_NAME,
          KeyConditionExpression: 'chatId = :c',
          ExpressionAttributeValues: { ':c': sessionId },
          ProjectionExpression: 'chatId, #ts',
          ExpressionAttributeNames: { '#ts': 'timestamp' },
          ExclusiveStartKey: lastKey as Record<string, never> | undefined,
        })
      )

      const items = (result.Items || []) as { chatId: string; timestamp: string }[]
      for (let i = 0; i < items.length; i += 25) {
        const batch = items.slice(i, i + 25)
        await ddb.send(
          new BatchWriteCommand({
            RequestItems: {
              [DYNAMODB_TABLE_NAME]: batch.map((it) => ({
                DeleteRequest: { Key: { chatId: it.chatId, timestamp: it.timestamp } },
              })),
            },
          })
        )
      }

      lastKey = result.LastEvaluatedKey
    } while (lastKey)

    console.log(`[lambda] clearChatHistory success: sessionId=${sessionId}`)
  } catch (error) {
    console.error(`[lambda] clearChatHistory error: sessionId=${sessionId}`, error)
    throw error
  }
}

// ---------------------------------------------------------------------------
// Model inference
//
// Two providers are supported; `LLM_PROVIDER` selects the active one:
//   - 'gemini'  (default): Google Gemini via the Generative Language REST API.
//   - 'bedrock'          : Amazon Bedrock (Nova Lite) via the Converse API.
// The Bedrock path is retained in full; Gemini is active while Bedrock on-demand
// quota is unavailable on the account. History/persistence are provider-neutral.
// ---------------------------------------------------------------------------

/** Provider-neutral conversation turn. */
type ChatTurn = { role: 'user' | 'assistant'; content: string }

/**
 * Load history and build the turn list for a new user message. The conversation
 * must begin with a `user` turn and alternate — drop any leading assistant turn
 * (e.g. from a truncated window) before appending the new message. Both Bedrock
 * (Nova) and Gemini require this shape.
 */
async function buildConversation(sessionId: string, userMessage: string): Promise<ChatTurn[]> {
  const history = await getChatHistory(sessionId)
  const conversation: ChatTurn[] = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }))
  while (conversation.length > 0 && conversation[0].role !== 'user') {
    conversation.shift()
  }
  conversation.push({ role: 'user', content: userMessage })
  return conversation
}

// --- Amazon Bedrock (Nova Lite via the Converse API) -----------------------

/** Retry helper for transient Bedrock errors (throttling / service blips). */
function isRetryableBedrockError(error: unknown): boolean {
  const name = (error as { name?: string })?.name || ''
  return (
    name === 'ThrottlingException' ||
    name === 'ServiceUnavailableException' ||
    name === 'ModelTimeoutException' ||
    name === 'InternalServerException'
  )
}

async function callBedrock(conversation: ChatTurn[]): Promise<string> {
  const messages: BedrockMessage[] = conversation.map((t) => ({
    role: t.role,
    content: [{ text: t.content }],
  }))

  let lastError: Error | null = null
  const retries = 3
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await bedrock.send(
        new ConverseCommand({
          modelId: BEDROCK_MODEL_ID,
          system: [{ text: PERSONALITY_PROMPT }],
          messages,
          inferenceConfig: { maxTokens: 2048, temperature: 0.85 },
        })
      )
      return result.output?.message?.content?.[0]?.text ?? ''
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`[lambda] Bedrock invoke failed: attempt=${attempt}`, lastError)

      const httpStatus = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode
      const throttled = lastError.name === 'ThrottlingException' || httpStatus === 429

      // A daily token/request quota (e.g. "Too many tokens per day") will not
      // clear on retry — fail fast with a clear, user-facing 503 instead of
      // burning the retry budget (and billed Lambda time) on it.
      if (throttled && /per day|quota|limit/i.test(lastError.message)) {
        throw new HttpError(503, 'The AI assistant has reached its usage limit for now. Please try again later.')
      }
      if (attempt < retries && isRetryableBedrockError(error)) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 200))
        continue
      }
      // Transient throttling/capacity that survived retries is a 503
      // (temporary, retryable) — not a 500 Internal Server Error.
      if (throttled) {
        throw new HttpError(503, 'The AI assistant is temporarily busy. Please try again in a moment.')
      }
      throw lastError
    }
  }
  throw lastError ?? new Error('Bedrock invocation failed')
}

// --- Google Gemini (Generative Language API) -------------------------------

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta'

async function callGemini(conversation: ChatTurn[]): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new HttpError(500, 'Chat is not configured (missing GEMINI_API_KEY).')
  }

  // Gemini uses roles 'user' and 'model'; the persona goes in system_instruction.
  const contents = conversation.map((t) => ({
    role: t.role === 'user' ? 'user' : 'model',
    parts: [{ text: t.content }],
  }))

  const body = {
    system_instruction: { parts: [{ text: PERSONALITY_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 2048,
      ...(GEMINI_THINKING_LEVEL ? { thinkingConfig: { thinkingLevel: GEMINI_THINKING_LEVEL } } : {}),
    },
  }

  const url = `${GEMINI_ENDPOINT}/models/${encodeURIComponent(GEMINI_MODEL_ID)}:generateContent`
  const retries = 3
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[]
        }
        return (data.candidates?.[0]?.content?.parts || []).map((p) => p.text ?? '').join('')
      }

      const errText = await res.text()
      console.error(`[lambda] Gemini call failed: attempt=${attempt} status=${res.status} ${errText.slice(0, 300)}`)

      // 429 (rate/quota) and 5xx (transient overload) are retryable.
      if ((res.status === 429 || res.status >= 500) && attempt < retries) {
        lastError = new Error(`Gemini HTTP ${res.status}`)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 300))
        continue
      }
      if (res.status === 429 || res.status >= 500) {
        throw new HttpError(503, 'The AI assistant is temporarily busy. Please try again in a moment.')
      }
      // 4xx (bad model id, invalid key, etc.) — not retryable.
      throw new HttpError(502, 'The AI assistant is unavailable right now. Please try again later.')
    } catch (error) {
      if (error instanceof HttpError) throw error
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`[lambda] Gemini fetch error: attempt=${attempt}`, lastError)
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 300))
        continue
      }
      throw new HttpError(502, 'The AI assistant is unavailable right now. Please try again later.')
    }
  }
  throw lastError ?? new Error('Gemini invocation failed')
}

// --- Orchestration ---------------------------------------------------------

/**
 * Generate an assistant reply: load history, dispatch to the active provider,
 * then persist both turns with strictly-ordered timestamps (user before
 * assistant in the sort key).
 */
async function generateReply(sessionId: string, userMessage: string): Promise<string> {
  console.log(
    `[lambda] generateReply start: provider=${LLM_PROVIDER} sessionId=${sessionId} messageLength=${userMessage.length}`
  )
  const conversation = await buildConversation(sessionId, userMessage)

  const aiResponse =
    LLM_PROVIDER === 'bedrock' ? await callBedrock(conversation) : await callGemini(conversation)

  if (!aiResponse.trim()) {
    console.error(`[lambda] generateReply: empty response from provider=${LLM_PROVIDER} sessionId=${sessionId}`)
    throw new HttpError(502, 'The AI assistant did not return a response. Please try again.')
  }

  console.log(`[lambda] generateReply done: sessionId=${sessionId} responseLength=${aiResponse.length}`)

  const base = Date.now()
  await saveMessage(sessionId, 'user', userMessage, new Date(base).toISOString())
  await saveMessage(sessionId, 'assistant', aiResponse, new Date(base + 1).toISOString())

  return aiResponse
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

async function handleChat(body: Record<string, unknown>): Promise<APIGatewayProxyResult> {
  try {
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
    const message = typeof body.message === 'string' ? body.message : ''
    const clearHistory = body.clearHistory === true

    console.log(`[lambda] handleChat: sessionId=${sessionId || 'missing'} clearHistory=${clearHistory}`)

    if (!sessionId) return jsonResponse(400, { error: 'sessionId is required' })
    if (clearHistory) {
      await clearChatHistory(sessionId)
      return jsonResponse(200, { success: true, message: 'History cleared' })
    }
    if (!message.trim()) return jsonResponse(400, { error: 'message is required' })

    const response = await generateReply(sessionId, message.trim())
    return jsonResponse(200, { success: true, response, sessionId })
  } catch (error) {
    console.error('[lambda] handleChat error:', error)
    throw error
  }
}

async function handleAdmin(headers: Record<string, string>): Promise<APIGatewayProxyResult> {
  try {
    const adminSecret = headers['x-admin-secret']
    const expectedSecret = process.env.ADMIN_SECRET

    console.log(`[lambda] handleAdmin: secretPresent=${!!adminSecret}`)

    if (!adminSecret || !expectedSecret || adminSecret !== expectedSecret) {
      console.warn('[lambda] handleAdmin unauthorized request')
      return jsonResponse(401, { error: 'Unauthorized' })
    }

    // Read the full table (paginated) and return the newest ADMIN_LIMIT
    // messages in descending timestamp order — equivalent to the previous
    // `ORDER BY timestamp DESC LIMIT 100`. DynamoDB Scan is unordered, so
    // ordering is applied in memory (fine at this table's scale).
    const items: ChatItem[] = []
    let lastKey: Record<string, unknown> | undefined
    do {
      const result = await ddb.send(
        new ScanCommand({
          TableName: DYNAMODB_TABLE_NAME,
          ExclusiveStartKey: lastKey as Record<string, never> | undefined,
        })
      )
      items.push(...((result.Items || []) as ChatItem[]))
      lastKey = result.LastEvaluatedKey
    } while (lastKey)

    items.sort((a, b) => (a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0))
    const top = items.slice(0, ADMIN_LIMIT)

    console.log(`[lambda] handleAdmin success: scanned=${items.length} returned=${top.length}`)

    const messages = top.map((item) => ({
      id: item.id,
      sessionId: item.sessionId,
      role: item.role,
      content: item.content,
      timestamp: item.timestamp,
      chatSession: {
        id: `cs-${item.sessionId}`,
        sessionId: item.sessionId,
        createdAt: item.createdAt ?? item.timestamp,
        updatedAt: item.timestamp,
      },
    }))

    return jsonResponse(200, messages)
  } catch (error) {
    console.error('[lambda] handleAdmin error:', error)
    throw error
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export const handler = async (
  event: APIGatewayProxyEvent | APIGatewayProxyEventV2
): Promise<APIGatewayProxyResult> => {
  try {
    const normalized = normalizeEvent(event)
    console.log(`[lambda][${normalized.requestId}] handler start: ${normalized.method} ${normalized.path}`)

    if (normalized.method === 'OPTIONS') return jsonResponse(200, { ok: true })

    // Accept both the API Gateway route paths (/chat, /admin/chats) and the
    // /api-prefixed paths used by the local dev server / legacy CloudFront.
    const path = normalized.path

    if (normalized.method === 'POST' && (path === '/chat' || path === '/api/chat')) {
      return await handleChat(parseJsonBody(normalized))
    }

    if (
      normalized.method === 'GET' &&
      (path === '/admin/chats' || path === '/api/admin/chats' || path.endsWith('/admin/chats'))
    ) {
      return await handleAdmin(normalized.headers)
    }

    return jsonResponse(404, { error: 'Not Found' })
  } catch (error) {
    console.error('[lambda] handler error:', error)
    if (error instanceof HttpError) return jsonResponse(error.statusCode, { error: error.message })

    return jsonResponse(500, {
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
