# Messages App Navigation Feature

## Overview
Implemented automatic app opening from the Messages chat window when users ask about education, experience, or projects.

## Changes Made

### 1. **Personality Prompt Enhancement** (`src/data/personality-prompt.ts`)
Added special instructions for the AI to detect when users ask about:
- **Education** - academic background, university, degree, courses, GPA
- **Experience** - work experience, internships, jobs, roles, companies
- **Projects** - portfolio work, what you've built, technical projects

The AI now adds special markers at the end of responses:
- `[OPEN:EDUCATION]` - Opens Education app
- `[OPEN:EXPERIENCE]` - Opens Experience app
- `[OPEN:PROJECTS]` - Opens Projects app

### 2. **MessagesApp Component** (`src/components/apps/MessagesApp.tsx`)
- Added `onOpenApp` prop (same as TerminalApp)
- Implemented marker detection in AI responses
- Automatically removes markers from displayed message
- Opens the relevant app with a 500ms delay after message renders

### 3. **Desktop Component** (`src/components/desktop.tsx`)
- Passed `openOrActivateWindow` function to MessagesApp
- Enables app opening/activation from chat

## How It Works

1. User asks a question like "What did you study?" or "Tell me about your projects"
2. Gemini AI detects the intent and includes the appropriate marker in response
3. MessagesApp parses the response, extracts the marker
4. Displays clean message (without marker) to user
5. Opens the relevant app automatically

## Example Triggers

**Education:**
- "What did you study?"
- "Tell me about your education"
- "What's your degree?"
- "Which university did you go to?"

**Experience:**
- "What companies have you worked at?"
- "Tell me about your work experience"
- "Where have you interned?"
- "What's your professional background?"

**Projects:**
- "Show me your projects"
- "What have you built?"
- "Tell me about your portfolio"
- "What projects are you proud of?"

## Technical Details

- Markers are case-sensitive and must appear at the end of the response
- Only one app can be opened per message
- If multiple markers exist, the first one found is used
- The app opening is non-blocking and happens after message display
- Works seamlessly with the existing window management system

## Testing

To test:
1. Open the Messages app
2. Ask questions about education, experience, or projects
3. Watch as the AI responds and automatically opens the relevant app
4. The app should open/activate without closing the Messages window

## Future Enhancements

Possible improvements:
- Add markers for other apps (About, Photos, etc.)
- Support multiple app opening from a single response
- Add visual indicators when an app is about to open
- Make marker system more robust with regex patterns
