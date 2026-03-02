import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

declare global {
  var __lambdaDbPool__: Pool | undefined
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

const pool =
  globalThis.__lambdaDbPool__ ??
  new Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 5000,
  })

if (!globalThis.__lambdaDbPool__) {
  globalThis.__lambdaDbPool__ = pool
}

export const db = drizzle(pool, { schema })

export { pool }
export * from './schema'
