# Visual Guide: How the Chat System Works

## 🎬 User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER OPENS MESSAGES APP                      │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  Session ID Generated: "session-1729012345678-abc123"           │
│  Stored in: sessionStorage (temporary)                          │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│              Check Redis for Existing Chat History              │
│                  Key: "chat:session-..."                        │
└─────────────────────────────────────────────────────────────────┘
                               ↓
                    ┌──────────┴──────────┐
                    ↓                     ↓
         ┌─────────────────┐   ┌─────────────────┐
         │  Found History  │   │  No History     │
         │  (Cache HIT)    │   │  (Cache MISS)   │
         └─────────────────┘   └─────────────────┘
                    ↓                     ↓
         ┌─────────────────┐   ┌─────────────────┐
         │ Load Previous   │   │ Show Welcome    │
         │ Messages        │   │ Message         │
         └─────────────────┘   └─────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    USER SENDS MESSAGE                            │
│                 "Tell me about yourself"                         │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│               Build Context for Gemini API                       │
│  1. Your personality prompt (from personality-prompt.ts)        │
│  2. All previous messages in this session                       │
│  3. New user message                                            │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Send to Gemini API                            │
│          Temperature: 0.9 (creative responses)                   │
│          Max Tokens: 1000                                        │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                   AI Responds as YOU                             │
│  "I'm Avadhoot, a third-year CS student who's passionate        │
│   about web development and building meaningful systems..."      │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│              Update Redis Cache                                  │
│  Save: [previous messages + new Q&A]                            │
│  TTL: 3600 seconds (1 hour)                                     │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Display in UI                                   │
│  User message (blue bubble) + AI response (gray bubble)         │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Session Lifecycle

```
┌────────────────────────────────────────────────────────────────┐
│                        DAY 1 - 2:00 PM                          │
└────────────────────────────────────────────────────────────────┘

User opens page → Session: "session-123"
User: "What's your favorite tech stack?"
AI: "I really enjoy working with React, Next.js..."
                        ↓
              [Saved in Redis]
              TTL: 3600s (1 hour)


┌────────────────────────────────────────────────────────────────┐
│                        DAY 1 - 2:05 PM                          │
│                    (Same session continues)                      │
└────────────────────────────────────────────────────────────────┘

User: "Why do you like Next.js?"
                        ↓
        [Loads from Redis - Context Preserved]
                        ↓
AI: "As I mentioned, I enjoy Next.js because of its..."
     ↑
     └─── AI remembers the previous conversation!


┌────────────────────────────────────────────────────────────────┐
│                        DAY 1 - 2:10 PM                          │
│                    (User REFRESHES PAGE)                        │
└────────────────────────────────────────────────────────────────┘

Session cleared → New Session: "session-456"
User: "What were we talking about?"
                        ↓
           [Redis: No history found]
                        ↓
AI: "I don't have context from a previous conversation..."
     ↑
     └─── Fresh start - Previous context is gone


┌────────────────────────────────────────────────────────────────┐
│                        DAY 1 - 3:15 PM                          │
│              (1 hour + 5 min after last activity)               │
└────────────────────────────────────────────────────────────────┘

             [Redis TTL expired]
             Cache automatically cleared
             Old session data deleted
```

## 🧑‍🤝‍🧑 Multi-User Support

```
┌─────────────────────────────────────────────────────────────────┐
│                         SAME TIME                                │
└─────────────────────────────────────────────────────────────────┘

   User A (session-111)          User B (session-222)
          ↓                              ↓
   ┌──────────────┐              ┌──────────────┐
   │ "Who are     │              │ "Tell me     │
   │  you?"       │              │  about your  │
   │              │              │  projects"   │
   └──────────────┘              └──────────────┘
          ↓                              ↓
   ┌──────────────┐              ┌──────────────┐
   │  Redis:      │              │  Redis:      │
   │  chat:       │              │  chat:       │
   │  session-111 │              │  session-222 │
   └──────────────┘              └──────────────┘
          ↓                              ↓
   ┌──────────────┐              ┌──────────────┐
   │ AI responds  │              │ AI responds  │
   │ to User A    │              │ to User B    │
   │ with A's     │              │ with B's     │
   │ context      │              │ context      │
   └──────────────┘              └──────────────┘

   Completely Isolated - No Cross-Contamination!
```

## 🗄️ Redis Cache Structure

```
Redis Database
│
├── chat:session-1729012345678-abc123   [TTL: 3600s]
│   └── Value: [
│         { role: "user", content: "Hi there!" },
│         { role: "assistant", content: "Hey! I'm Avadhoot..." },
│         { role: "user", content: "Tell me more" },
│         { role: "assistant", content: "Sure! So I'm..." }
│       ]
│
├── chat:session-1729012398765-xyz789   [TTL: 3600s]
│   └── Value: [
│         { role: "user", content: "What do you do?" },
│         { role: "assistant", content: "I'm a CS student..." }
│       ]
│
└── chat:session-1729012401234-def456   [TTL: 2890s]
    └── Value: [
          { role: "user", content: "Hi" },
          { role: "assistant", content: "Hello!" }
        ]

    After TTL expires → Key automatically deleted
```

## 🎯 Message Flow with Personality

```
┌────────────────────────────────────────────────────────────────┐
│                    WHAT GETS SENT TO GEMINI                     │
└────────────────────────────────────────────────────────────────┘

Message 1 (System):
┌──────────────────────────────────────────────────────────────┐
│ "You are Avadhoot Mahadik, a curious, introspective, and    │
│  creative computer science student... [full personality]"    │
└──────────────────────────────────────────────────────────────┘

Message 2 (System Acknowledgment):
┌──────────────────────────────────────────────────────────────┐
│ "I understand. I will respond as Avadhoot Mahadik..."       │
└──────────────────────────────────────────────────────────────┘

Message 3 (Previous User):
┌──────────────────────────────────────────────────────────────┐
│ "What's your favorite programming language?"                 │
└──────────────────────────────────────────────────────────────┘

Message 4 (Previous AI):
┌──────────────────────────────────────────────────────────────┐
│ "I'd say I'm really into JavaScript/TypeScript lately..."   │
└──────────────────────────────────────────────────────────────┘

Message 5 (New User):
┌──────────────────────────────────────────────────────────────┐
│ "Why TypeScript specifically?"                               │
└──────────────────────────────────────────────────────────────┘

                            ↓
┌──────────────────────────────────────────────────────────────┐
│         Gemini Processes Everything with Context             │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ AI Response (in YOUR voice):                                 │
│ "TypeScript gives me that balance I mentioned earlier..."   │
│                                                               │
│ [References previous conversation naturally]                 │
└──────────────────────────────────────────────────────────────┘
```

## 🎨 UI Components

```
┌─────────────────────────────────────────────────────────────┐
│                      MESSAGES APP UI                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Avadhoot Mahadik      Online              [Trash Icon]     │  ← Header
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────┐                          │
│  │ Hi! I'm Avadhoot Mahadik...  │  (Gray - AI)            │
│  │ 2:00 PM                       │                          │
│  └──────────────────────────────┘                          │
│                                                              │
│                          ┌────────────────────────────────┐ │
│                          │ What's your background?       │ │  (Blue - User)
│                          │ 2:01 PM                        │ │
│                          └────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────┐                          │
│  │ I'm a third-year CS student  │  (Gray - AI)            │
│  │ passionate about...           │                          │
│  │ 2:01 PM                       │                          │
│  └──────────────────────────────┘                          │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  [          Type a message...          ] [Send Button]      │  ← Input
└─────────────────────────────────────────────────────────────┘
```

## 📱 Storage Comparison

```
sessionStorage                  vs               localStorage
     ↓                                                ↓
┌──────────────┐                           ┌──────────────┐
│ WE USE THIS! │                           │  NOT USED    │
└──────────────┘                           └──────────────┘
     ↓                                                ↓
Features:                                    Features:
✅ Clears on refresh                        ❌ Never clears
✅ Tab-specific                              ❌ Shared across tabs
✅ Privacy-friendly                          ❌ Persists forever
✅ Temporary                                 ❌ Requires cleanup
✅ Perfect for sessions                      ❌ Would store forever

Why sessionStorage?
→ Each visit is fresh
→ No cleanup needed
→ Privacy by default
→ Simple and effective
```

## 🎭 Personality Integration

```
Your Personality File
(personality-prompt.ts)
         ↓
         ↓ Imported by
         ↓
gemini.ts (Server Action)
         ↓
         ↓ Injected into
         ↓
Gemini API Chat Session
         ↓
         ↓ AI Responds as
         ↓
Avadhoot Mahadik
(with your traits, style, and knowledge)
```

## ⚡ Performance Flow

```
User sends message
       ↓
Check Redis (5-10ms)
       ↓
   ┌───┴───┐
   ↓       ↓
 Hit      Miss
   ↓       ↓
 Fast   Slow
(10ms) (2s)
   ↓       ↓
   └───┬───┘
       ↓
Format context
       ↓
Send to Gemini (1-3s)
       ↓
Get response
       ↓
Save to Redis (10ms)
       ↓
Display to user
```

---

**Remember:**
- Each box = a step in the process
- ↓ = flows to next step
- [Text] = data or state
- ✅/❌ = what we do/don't do

**For full details, see:**
- `MULTI_USER_CHAT_SYSTEM.md` - Technical docs
- `CHAT_SYSTEM_SUMMARY.md` - Complete guide
