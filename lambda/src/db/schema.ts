import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { randomUUID } from 'node:crypto'

export const chatSessionTable = pgTable(
  'ChatSession',
  {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    sessionId: text('sessionId').notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' }).notNull(),
  },
  (table) => ({
    sessionIdUnique: uniqueIndex('ChatSession_sessionId_key').on(table.sessionId),
    sessionIdIndex: index('ChatSession_sessionId_idx').on(table.sessionId),
  })
)

export const messageTable = pgTable(
  'Message',
  {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    sessionId: text('sessionId')
      .notNull()
      .references(() => chatSessionTable.sessionId, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    role: text('role').notNull(),
    content: text('content').notNull(),
    timestamp: timestamp('timestamp', { precision: 3, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    sessionIdIndex: index('Message_sessionId_idx').on(table.sessionId),
    timestampIndex: index('Message_timestamp_idx').on(table.timestamp),
  })
)

export const chatSessionRelations = relations(chatSessionTable, ({ many }) => ({
  messages: many(messageTable),
}))

export const messageRelations = relations(messageTable, ({ one }) => ({
  chatSession: one(chatSessionTable, {
    fields: [messageTable.sessionId],
    references: [chatSessionTable.sessionId],
  }),
}))
