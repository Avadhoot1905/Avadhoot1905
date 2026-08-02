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
// Model inference (Amazon Bedrock — Nova Lite via the Converse API)
// ---------------------------------------------------------------------------

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

async function sendMessageToBedrock(sessionId: string, userMessage: string): Promise<string> {
  try {
    console.log(`[lambda] sendMessageToBedrock start: sessionId=${sessionId} messageLength=${userMessage.length}`)
    const history = await getChatHistory(sessionId)

    // Build the Converse messages array. Nova requires the conversation to
    // begin with a `user` turn and to alternate — drop any leading assistant
    // turn that could violate that (e.g. from a truncated window).
    const conversation: BedrockMessage[] = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: [{ text: msg.content }],
    }))
    while (conversation.length > 0 && conversation[0].role !== 'user') {
      conversation.shift()
    }
    conversation.push({ role: 'user', content: [{ text: userMessage }] })

    let aiResponse = ''
    let lastError: Error | null = null
    const retries = 3
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await bedrock.send(
          new ConverseCommand({
            modelId: BEDROCK_MODEL_ID,
            system: [{ text: PERSONALITY_PROMPT }],
            messages: conversation,
            inferenceConfig: { maxTokens: 2048, temperature: 0.85 },
          })
        )
        aiResponse = result.output?.message?.content?.[0]?.text ?? ''
        break
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(`[lambda] Bedrock invoke failed: sessionId=${sessionId} attempt=${attempt}`, lastError)
        if (attempt < retries && isRetryableBedrockError(error)) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 200))
          continue
        }
        throw lastError
      }
    }

    console.log(`[lambda] sendMessageToBedrock generated response: sessionId=${sessionId} responseLength=${aiResponse.length}`)

    // Persist the exchange. Distinct, strictly-ordered timestamps keep the
    // user turn before the assistant turn in the sort key.
    const base = Date.now()
    await saveMessage(sessionId, 'user', userMessage, new Date(base).toISOString())
    await saveMessage(sessionId, 'assistant', aiResponse, new Date(base + 1).toISOString())

    return aiResponse
  } catch (error) {
    console.error(`[lambda] sendMessageToBedrock error: sessionId=${sessionId}`, error)
    throw error
  }
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

    const response = await sendMessageToBedrock(sessionId, message.trim())
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
