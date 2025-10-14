# Documentation Index

This folder contains all technical documentation for the MacOS Portfolio project.

## 📁 File Organization

### 🚀 Getting Started
Start here if you're setting up the project:

1. **[README.md](../README.md)** - Main project overview (in root folder)
2. **[REDIS_SETUP.md](REDIS_SETUP.md)** - Step-by-step Redis setup guide
3. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions

### 🏗️ Architecture & Implementation
Understand how the project works:

- **[SERVER_ACTIONS_MIGRATION.md](SERVER_ACTIONS_MIGRATION.md)**
  - Why we use server actions instead of API routes
  - Performance benefits
  - Implementation details

- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)**
  - Backend caching implementation
  - Redis integration
  - File structure

- **[CACHE_SIZE_ANALYSIS.md](CACHE_SIZE_ANALYSIS.md)**
  - Data size calculations
  - Cost analysis
  - Scalability projections

### 🐛 Debugging & Fixes
Troubleshooting guides for specific issues:

- **[DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md)**
  - General debugging steps
  - How to use the test page
  - Common error messages

- **[NOTHING_VISIBLE_FIX.md](NOTHING_VISIBLE_FIX.md)**
  - Fix for blank Safari app screens
  - Data loading issues
  - Component rendering problems

- **[LEETCODE_SUBMISSIONS_FIX.md](LEETCODE_SUBMISSIONS_FIX.md)**
  - Fix for missing LeetCode recent problems
  - API endpoint changes
  - Caching issues

### 📝 Migration & Changes
Historical documentation:

- **[MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)**
  - API routes to server actions migration
  - What changed and why
  - Before/after comparison

- **[API_ROUTES_CLEANUP.md](API_ROUTES_CLEANUP.md)**
  - Removal of duplicate API routes
  - Why server actions are preferred
  - Current architecture

- **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)**
  - Chronological list of all changes
  - Feature additions
  - Bug fixes

## 🔍 Quick Reference

### I need to...

**Set up Redis caching:**
→ Read [REDIS_SETUP.md](REDIS_SETUP.md)

**Fix a bug or error:**
→ Start with [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**Understand the architecture:**
→ Read [SERVER_ACTIONS_MIGRATION.md](SERVER_ACTIONS_MIGRATION.md)

**Debug blank screens:**
→ Follow [NOTHING_VISIBLE_FIX.md](NOTHING_VISIBLE_FIX.md)

**Fix LeetCode data issues:**
→ Check [LEETCODE_SUBMISSIONS_FIX.md](LEETCODE_SUBMISSIONS_FIX.md)

**Learn about caching costs:**
→ See [CACHE_SIZE_ANALYSIS.md](CACHE_SIZE_ANALYSIS.md)

**Understand recent changes:**
→ Review [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)

## 📊 Documentation Status

| Document | Purpose | Last Updated |
|----------|---------|--------------|
| REDIS_SETUP.md | Setup guide | 2025-10-14 |
| TROUBLESHOOTING.md | General troubleshooting | 2025-10-14 |
| SERVER_ACTIONS_MIGRATION.md | Architecture docs | 2025-10-14 |
| IMPLEMENTATION_SUMMARY.md | Implementation details | 2025-10-14 |
| CACHE_SIZE_ANALYSIS.md | Cost analysis | 2025-10-14 |
| DEBUGGING_GUIDE.md | Debugging help | 2025-10-14 |
| NOTHING_VISIBLE_FIX.md | Specific bug fix | 2025-10-14 |
| LEETCODE_SUBMISSIONS_FIX.md | Specific bug fix | 2025-10-14 |
| MIGRATION_SUMMARY.md | Migration docs | 2025-10-14 |
| API_ROUTES_CLEANUP.md | Code cleanup | 2025-10-14 |
| CHANGES_SUMMARY.md | Change log | 2025-10-14 |

## 🎯 Recommended Reading Order

### For New Developers:
1. Main README.md (in root)
2. REDIS_SETUP.md
3. SERVER_ACTIONS_MIGRATION.md
4. TROUBLESHOOTING.md

### For Debugging Issues:
1. TROUBLESHOOTING.md
2. DEBUGGING_GUIDE.md
3. Specific fix docs (NOTHING_VISIBLE_FIX.md or LEETCODE_SUBMISSIONS_FIX.md)

### For Understanding Architecture:
1. SERVER_ACTIONS_MIGRATION.md
2. IMPLEMENTATION_SUMMARY.md
3. CACHE_SIZE_ANALYSIS.md

## 📞 Need More Help?

1. Check the test page: `http://localhost:3000/test`
2. Review browser console logs (F12)
3. Check terminal/server logs
4. Search through these docs for your specific issue

## 📝 Notes

- All documentation is in Markdown format
- Code examples are provided where relevant
- Screenshots/diagrams may be added in future updates
- Documentation is kept up-to-date with code changes

---

**Last Updated:** October 14, 2025
