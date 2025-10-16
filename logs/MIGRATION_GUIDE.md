# Migration Guide: Adding Database to Existing Messages App

This guide explains how the Messages app has been upgraded with database persistence.

## What Changed?

### Before
- Messages stored only in Redis cache
- Messages lost after 1 hour of inactivity
- Messages cleared on page refresh if Redis expires

### After
- Messages stored in both Redis (fast) and PostgreSQL (permanent)
- Messages persist forever
- Chat history automatically loads on page refresh
- Better reliability and data integrity

## For End Users

**No action required!** The app works exactly the same way:
- Send messages as before
- Messages now automatically save to database
- Your chat history persists across sessions
- App feels faster thanks to Redis caching

## For Developers

### 1. Install New Dependencies

Already done if you've run `npm install`. The new dependencies are:
- `@prisma/client` - Prisma database client
- `prisma` - Prisma CLI (dev dependency)

### 2. Set Up Your Database

**Quick Option (Recommended):**
```bash
# 1. Get a free PostgreSQL database from Supabase
#    https://supabase.com (recommended) or https://neon.tech

# 2. Create .env file
cp .env.example .env

# 3. Add your DATABASE_URL to .env
# DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# 4. Push schema to database
npm run db:push

# 5. Start your app
npm run dev
```

See `QUICK_SETUP.md` for detailed instructions.

### 3. How It Works

#### Data Flow
```
User sends message
    ↓
Gemini API processes
    ↓
Response generated
    ↓
    ├─→ Save to Redis (1 hour TTL) ← Fast access
    └─→ Save to PostgreSQL         ← Permanent storage
```

#### Loading Messages
```
App loads
    ↓
Try Redis cache ← Fast
    ↓
If cache miss → Load from PostgreSQL
    ↓
Populate cache for future requests
```

### 4. New Server Actions Available

All in `src/actions/messages.ts`:

```typescript
// Save a message
await saveMessage(sessionId, "user", "Hello!")

// Get all messages for a session
const messages = await getSessionMessages(sessionId)

// Clear session messages
await clearSessionMessages(sessionId)

// Delete entire session
await deleteSession(sessionId)

// Get all sessions
const sessions = await getAllSessions()
```

### 5. Updated Gemini Actions

The existing `gemini.ts` actions now:
- Save to both Redis and database
- Load from database if Redis cache misses
- Clear from both when user clears chat

**No breaking changes** - your existing code still works!

### 6. Useful Commands

```bash
# View your database in browser
npm run db:studio

# Update database schema
npm run db:push

# Create a migration (for production)
npm run db:migrate

# Reset database (deletes all data!)
npm run db:reset
```

## Database Schema

### ChatSession Table
| Column    | Type      | Description                    |
|-----------|-----------|--------------------------------|
| id        | String    | Primary key (CUID)            |
| sessionId | String    | Unique session identifier     |
| createdAt | DateTime  | When session was created      |
| updatedAt | DateTime  | Last activity timestamp       |

### Message Table
| Column    | Type      | Description                    |
|-----------|-----------|--------------------------------|
| id        | String    | Primary key (CUID)            |
| sessionId | String    | Foreign key to ChatSession    |
| role      | String    | "user" or "assistant"         |
| content   | Text      | Message content               |
| timestamp | DateTime  | When message was sent         |

## Backward Compatibility

✅ **Fully backward compatible!**
- Existing Messages app code works unchanged
- Messages in Redis cache are preserved
- New messages automatically saved to database
- No API changes

## Error Handling

The system has robust error handling:
- If database fails, app continues with Redis only
- If Redis fails, app loads from database
- Errors logged to console for debugging
- User experience never interrupted

## Performance

**No performance impact:**
- Redis cache ensures instant message loading
- Database saves happen asynchronously
- Indexes optimize database queries
- Connection pooling handles concurrent users

## Testing Your Setup

1. **Send a message** in the Messages app
2. **Refresh the page** - message should still be there
3. **Run Prisma Studio**: `npm run db:studio`
4. **Verify** your messages appear in the database

## Troubleshooting

### Messages not persisting?
```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Verify Prisma client is generated
npm run db:generate

# Check database connection
npm run db:studio
```

### Can't connect to database?
- Verify DATABASE_URL in `.env` file
- Check if database service is running
- Try the connection string in a database client (e.g., TablePlus, DBeaver)

### Still having issues?
1. Check console for error messages
2. Verify `.env` file exists and has DATABASE_URL
3. Restart your dev server
4. See `DATABASE_SETUP.md` for detailed troubleshooting

## Production Deployment

When deploying to production:

1. **Set DATABASE_URL** in your hosting platform (Vercel, Railway, etc.)
2. **Run migrations**:
   ```bash
   npm run db:migrate
   ```
3. **Verify environment variables** are set
4. **Test** message persistence in production

## Benefits of This Upgrade

✅ **Permanent Storage** - Messages never expire  
✅ **Better UX** - Chat history persists across sessions  
✅ **Reliability** - Dual storage (Redis + PostgreSQL)  
✅ **Scalability** - Can handle thousands of users  
✅ **Data Integrity** - ACID compliance  
✅ **Developer Tools** - Prisma Studio for data management  
✅ **Type Safety** - Full TypeScript support  
✅ **Fast** - Redis caching keeps it snappy  

## Questions?

- See `QUICK_SETUP.md` for quick start guide
- See `DATABASE_SETUP.md` for detailed setup
- Check `logs/MESSAGES_DATABASE_IMPLEMENTATION.md` for technical details

---

**Your Messages app is now production-ready with enterprise-grade data persistence! 🚀**
