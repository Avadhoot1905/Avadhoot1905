# Admin Panel Quick Setup Checklist

## ✅ Pre-requisites
- [ ] PostgreSQL database is running
- [ ] Prisma schema is migrated (`npx prisma migrate dev`)
- [ ] Environment variables are configured

## 🔧 Setup Steps

### 1. Configure Environment Variable
Add to your `.env` or `.env.local` file:
```bash
ADMIN_PASSWORD="your-secure-password-here"
```

**Note:** Replace `your-secure-password-here` with a strong password.

### 2. Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Access Admin Panel
Navigate to: `http://localhost:3000/admin`

### 4. Test Login
- Enter the password you set in step 1
- You should see the admin dashboard

## 🎯 Verification

### Check Database Section:
- [ ] Can see session count
- [ ] Can see message count
- [ ] Can view individual sessions
- [ ] Can expand sessions to see messages
- [ ] Can delete a session
- [ ] Refresh button works

### Check Testing Section:
- [ ] Can run tests
- [ ] See results for Redis
- [ ] See results for GitHub
- [ ] See results for LeetCode
- [ ] See results for Medium

## 🔒 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Strong password is used (at least 12 characters)
- [ ] Password is not committed to repository
- [ ] Password is unique (not used elsewhere)

## 🐛 Troubleshooting

### Can't login?
1. Check `.env` file has `ADMIN_PASSWORD` set
2. Restart development server
3. Check for typos in password
4. Check browser console for errors

### Database not showing?
1. Verify `DATABASE_URL` is correct
2. Run `npx prisma migrate dev`
3. Check database is running
4. Check Prisma client is generated: `npx prisma generate`

### Tests failing?
1. Check individual service environment variables
2. Verify API keys are valid
3. Check network connectivity
4. Review terminal logs

## 📝 Notes

- The test page (`/test`) has been removed
- All test functionality is now in `/admin`
- Admin page is password protected
- Database operations are permanent (be careful with delete!)

## 🚀 Ready to Use!

Once all checks pass, your admin panel is ready to use. Access it at `/admin` anytime to manage your database and test your server actions.
