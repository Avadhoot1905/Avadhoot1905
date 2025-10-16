# Database Setup Guide

This guide will help you set up PostgreSQL and Prisma for the Messages app.

## Prerequisites

- Node.js installed
- PostgreSQL installed locally or access to a PostgreSQL database (e.g., Supabase, Railway, Neon)

## Step 1: Install Dependencies

```bash
npm install prisma @prisma/client
npm install -D prisma
```

## Step 2: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

1. Install PostgreSQL:
   - macOS: `brew install postgresql@15`
   - Start PostgreSQL: `brew services start postgresql@15`

2. Create a database:
   ```bash
   psql postgres
   CREATE DATABASE avadhoot_portfolio;
   \q
   ```

3. Your connection string will be:
   ```
   postgresql://your_username@localhost:5432/avadhoot_portfolio?schema=public
   ```

### Option B: Cloud PostgreSQL (Recommended)

Use one of these free-tier cloud providers:

- **Supabase**: https://supabase.com (Recommended - has free tier)
- **Neon**: https://neon.tech (Good free tier)
- **Railway**: https://railway.app (Free for small projects)

After creating a database, copy the connection string.

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root of your project:
   ```bash
   cp .env.example .env
   ```

2. Update the `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
   ```

## Step 4: Generate Prisma Client

```bash
npx prisma generate
```

## Step 5: Run Database Migrations

```bash
npx prisma db push
```

Or to create a proper migration:

```bash
npx prisma migrate dev --name init
```

## Step 6: (Optional) View Your Database

Use Prisma Studio to view and edit your data:

```bash
npx prisma studio
```

This will open a browser window at `http://localhost:5555` with a GUI for your database.

## Troubleshooting

### "Can't reach database server"
- Check if PostgreSQL is running
- Verify your DATABASE_URL is correct
- Check firewall settings if using remote database

### "Role does not exist"
- Create the PostgreSQL user: `createuser -s your_username`

### SSL Connection Issues
If your cloud provider requires SSL, update your DATABASE_URL:
```
DATABASE_URL="postgresql://user:pass@host:port/db?schema=public&sslmode=require"
```

## Database Schema

The schema includes two models:

### ChatSession
- `id`: Unique identifier (CUID)
- `sessionId`: Session identifier (indexed)
- `createdAt`: When the session was created
- `updatedAt`: Last update timestamp
- `messages`: Related messages

### Message
- `id`: Unique identifier (CUID)
- `sessionId`: References ChatSession
- `role`: "user" or "assistant"
- `content`: Message text
- `timestamp`: When the message was sent

## Useful Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Apply schema changes to database
npx prisma db push

# Create a migration
npx prisma migrate dev --name your_migration_name

# View database in browser
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## Next Steps

After setting up the database:

1. Start your development server: `npm run dev`
2. The Messages app will automatically save all conversations to the database
3. Conversations persist across page refreshes
4. Redis cache is used for fast access, database for persistence
