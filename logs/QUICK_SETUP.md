# Quick Setup Guide for Messages Database

This guide will help you quickly set up the PostgreSQL database for the Messages app.

## Option 1: Using Supabase (Recommended - Free & Easy)

1. **Create a Supabase Account**
   - Go to https://supabase.com
   - Sign up with GitHub or email
   - Create a new project

2. **Get Your Database URL**
   - In your Supabase project dashboard, go to Settings → Database
   - Scroll to "Connection string" → "URI"
   - Copy the connection string (it will look like `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)

3. **Update Your .env File**
   ```bash
   # Create .env file if it doesn't exist
   cp .env.example .env
   
   # Add your database URL
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
   ```

4. **Initialize the Database**
   ```bash
   npm run db:push
   ```

5. **Done! Start your app**
   ```bash
   npm run dev
   ```

## Option 2: Using Neon (Alternative Free Option)

1. Go to https://neon.tech
2. Create a free account and project
3. Copy the connection string
4. Add to `.env` file
5. Run `npm run db:push`

## Option 3: Local PostgreSQL

1. **Install PostgreSQL**
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Create Database**
   ```bash
   createdb avadhoot_portfolio
   ```

3. **Update .env**
   ```
   DATABASE_URL="postgresql://your_username@localhost:5432/avadhoot_portfolio"
   ```

4. **Initialize**
   ```bash
   npm run db:push
   ```

## Useful Commands

```bash
# Generate Prisma Client (after schema changes)
npm run db:generate

# Push schema to database (development)
npm run db:push

# View/edit database in browser
npm run db:studio

# Create migration (production)
npm run db:migrate

# Reset database (WARNING: deletes all data)
npm run db:reset
```

## Verify Setup

After setup, you can verify everything works by:

1. Starting the dev server: `npm run dev`
2. Opening the Messages app
3. Sending a test message
4. Refreshing the page - your messages should persist!

You can also view your data with:
```bash
npm run db:studio
```

This opens Prisma Studio at http://localhost:5555

## Troubleshooting

**Error: "Can't reach database server"**
- Check if your DATABASE_URL is correct
- Ensure your database service is running
- Check if you need to allow connections from your IP (cloud databases)

**Error: "Environment variable not found"**
- Make sure `.env` file exists in the root directory
- Ensure `DATABASE_URL` is set in `.env`
- Restart your dev server after changing `.env`

**Error: "SSL connection required"**
- Add `?sslmode=require` to your DATABASE_URL:
  ```
  DATABASE_URL="postgresql://...?sslmode=require"
  ```

## What's Been Set Up

✅ Prisma schema with ChatSession and Message models  
✅ Server actions for saving/loading messages  
✅ Integration with existing Gemini chat system  
✅ Redis cache + Database persistence (best of both worlds)  
✅ Automatic message saving on send  
✅ Chat history persists across page refreshes  

Your Messages app now has full database persistence! 🎉
