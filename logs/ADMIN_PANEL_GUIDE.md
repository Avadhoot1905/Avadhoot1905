# Admin Panel Setup Guide

## Overview
The admin panel provides a secure, password-protected interface for managing your application's database and testing server actions.

## Features

### 🔐 Password Protected Access
- Single password authentication
- Stored securely in environment variables
- Simple login interface

### 📊 Database Management
- **View all chat sessions** with complete message history
- **Database statistics** including:
  - Total number of sessions
  - Total number of messages
  - Average messages per session
- **Session details** with expandable message viewer
- **Delete individual sessions** or clear all data
- Real-time data refresh

### 🧪 Server Actions Testing
- Test all integrated APIs:
  - Redis connection
  - GitHub data fetching
  - LeetCode statistics
  - Medium articles
- Detailed error logging
- Visual success/failure indicators
- JSON response preview

## Setup Instructions

### 1. Set the Admin Password

Add the following to your `.env` or `.env.local` file:

```bash
ADMIN_PASSWORD="your-secure-password-here"
```

**Important:** 
- Choose a strong, unique password
- Never commit this password to version control
- Keep `.env` in your `.gitignore`

### 2. Access the Admin Panel

Navigate to: `http://your-domain/admin`

Or in development: `http://localhost:3000/admin`

### 3. Login

Enter the password you set in the environment variable.

## Usage

### Database Management

1. **View Sessions**: The database overview loads automatically after login
2. **Expand Messages**: Click "Show" button on any session to view all messages
3. **Delete Session**: Click "Delete" to remove a specific session
4. **Clear All Data**: Use with caution - this permanently deletes all sessions and messages
5. **Refresh**: Click the refresh button to reload the latest data

### Testing Server Actions

1. Click "Run Tests" button
2. Wait for all tests to complete
3. Review results for each service:
   - ✅ Green checkmark = Success
   - ❌ Red X = Failed
4. Expand JSON responses for detailed information
5. Check browser console for additional logs

## Security Notes

- ⚠️ **Never share your admin password**
- ⚠️ **Use HTTPS in production** to encrypt password transmission
- ⚠️ **Consider adding rate limiting** for production environments
- ⚠️ **Monitor access logs** for suspicious activity

## Troubleshooting

### "Invalid password" error
- Verify `ADMIN_PASSWORD` is set in your `.env` file
- Restart your development server after changing environment variables
- Check for typos in the password

### Database data not showing
- Verify `DATABASE_URL` is correctly configured
- Check that Prisma migrations are up to date: `npx prisma migrate dev`
- Ensure the database is running and accessible

### Server action tests failing
- Check individual service API keys and configuration
- Review terminal logs for specific error messages
- Verify network connectivity to external services

## Migration from Test Page

The functionality from `/test` has been fully migrated to `/admin`. The test page has been removed. All testing features are now available in the admin panel along with database management tools.

## Development Tips

- Use the admin panel to debug chat functionality
- Monitor message counts to track usage
- Test API integrations before deploying
- Clear test data between development sessions

## Production Considerations

1. **Add session management**: Consider implementing JWT tokens for longer sessions
2. **Add role-based access**: Expand to multiple admin users with different permissions
3. **Add audit logging**: Track who made what changes when
4. **Rate limiting**: Prevent brute force password attempts
5. **Two-factor authentication**: Add extra security layer for production

## File Structure

```
src/
├── actions/
│   └── admin.ts          # Admin server actions
├── app/
│   └── admin/
│       └── page.tsx      # Admin page component
```

## Environment Variables Required

```bash
# Required
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="your-password"

# Optional (for testing features)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
GEMINI_API_KEY="..."
```

## Support

If you encounter issues:
1. Check environment variables are set correctly
2. Review browser console for errors
3. Check server logs in terminal
4. Verify database connectivity
5. Ensure all dependencies are installed
