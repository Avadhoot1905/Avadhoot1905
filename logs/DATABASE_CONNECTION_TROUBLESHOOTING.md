# Database Connection Troubleshooting

## Current Issue
Cannot connect to Neon database. Error: `Can't reach database server`

## Quick Fix Options

### Option 1: Get Fresh Connection String from Neon (Recommended)

1. Go to https://console.neon.tech
2. Log in to your account
3. Select your project
4. Click on **"Connection Details"** or **"Connection String"**
5. Copy the **connection string** (should look like):
   ```
   postgresql://username:password@ep-xxx.aws.neon.tech/dbname?sslmode=require
   ```
6. Update your `.env` file with the new connection string

### Option 2: Check if Database is Active

Neon free tier databases can be suspended. To wake it up:
1. Go to https://console.neon.tech
2. Find your project
3. Check if it shows "Suspended" or "Inactive"
4. Click to activate/wake it up
5. Try the migration again

### Option 3: Test Connection String Format

Your current connection string might need adjustment. Try this format:

```bash
# Edit your .env file and try one of these formats:

# Format 1: With pooler (for production/serverless)
DATABASE_URL="postgresql://neondb_owner:npg_FNuUjapRVz83@ep-late-term-adt396n3-pooler.us-east-1.aws.neon.tech:5432/neondb?sslmode=require"

# Format 2: Direct connection (for migrations)
DATABASE_URL="postgresql://neondb_owner:npg_FNuUjapRVz83@ep-late-term-adt396n3.us-east-1.aws.neon.tech:5432/neondb?sslmode=require"

# Format 3: With connection parameters
DATABASE_URL="postgresql://neondb_owner:npg_FNuUjapRVz83@ep-late-term-adt396n3.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=10"
```

### Option 4: Use Local PostgreSQL (Quick Testing)

If you want to test immediately:

```bash
# 1. Install PostgreSQL (if not installed)
brew install postgresql@15

# 2. Start PostgreSQL
brew services start postgresql@15

# 3. Create database
createdb avadhoot_portfolio

# 4. Update .env
DATABASE_URL="postgresql://$(whoami)@localhost:5432/avadhoot_portfolio"

# 5. Run migration
npm run db:push
```

### Option 5: Use Supabase Instead

Supabase is more reliable for free tier:

1. Go to https://supabase.com
2. Create new project (takes 2 minutes)
3. Go to Project Settings > Database
4. Copy the **Connection String** (URI mode)
5. Update `.env`:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
   ```
6. Run migration

## Testing Your Connection

Once you update your DATABASE_URL, test it:

```bash
# Test connection
npx prisma db pull

# If successful, push your schema
npx prisma db push

# Or create migration
npx prisma migrate dev --name init
```

## Manual Steps to Fix

1. **Open your `.env` file**
   ```bash
   code .env
   # or
   nano .env
   ```

2. **Update DATABASE_URL** with the correct connection string

3. **Verify format**:
   - Must start with `postgresql://` or `postgres://`
   - No extra quotes or commands
   - Include proper SSL mode for cloud databases

4. **Run migration**:
   ```bash
   npm run db:push
   ```

## Need More Help?

- Check Neon status: https://neon.tech/status
- Neon docs: https://neon.tech/docs/connect/connect-from-any-app
- Contact me with the error message

## Current Connection String Format

Your current string appears to be:
```
postgresql://neondb_owner:npg_FNuUjapRVz83@ep-late-term-adt396n3-pooler.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
```

Try removing `-pooler` from the hostname if the above doesn't work:
```
postgresql://neondb_owner:npg_FNuUjapRVz83@ep-late-term-adt396n3.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
```
