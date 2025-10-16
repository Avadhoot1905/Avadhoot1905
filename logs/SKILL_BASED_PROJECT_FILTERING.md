# Skill-Based Project Filtering Feature

## Overview
Implemented intelligent skill and technology-based project filtering in the Messages app. When users ask about specific skills or technologies, the AI responds naturally and automatically opens the Projects window filtered to show relevant projects.

## Changes Made

### 1. **Enhanced Personality Prompt** (`src/data/personality-prompt.ts`)

Added comprehensive skill-based navigation markers:

#### General App Markers
- `[OPEN:EDUCATION]` - Academic questions
- `[OPEN:EXPERIENCE]` - Work/career questions  
- `[OPEN:PROJECTS]` - General project questions

#### Skill-Specific Project Markers
- `[OPEN:PROJECTS:Website Development]` - Web dev, Next.js, React questions
- `[OPEN:PROJECTS:App Development]` - Mobile apps, iOS, Swift questions
- `[OPEN:PROJECTS:Machine Learning]` - ML, AI experience questions
- `[OPEN:PROJECTS:Data Science]` - Data analysis, scraping questions
- `[OPEN:PROJECTS:Extension Development]` - Browser extension questions
- `[OPEN:PROJECTS:system]` - System programming, Linux, bash questions

#### AI Response Guidelines
Added instructions for honest skill assessment:
- ML/AI: "Full-stack developer with minimal ML experience, team projects like iVision and Study.ai"
- Web Development: Primary strength area
- Always relate skills back to actual projects

### 2. **Updated ProjectsApp** (`src/components/apps/ProjectsApp.tsx`)

Added support for initial filter parameter:
```typescript
type ProjectsAppProps = {
  initialFilter?: string
}
```

- Accepts `initialFilter` prop to set starting filter
- Uses `useEffect` to update filter when `initialFilter` changes
- Defaults to "all" if no filter provided

### 3. **Updated MessagesApp** (`src/components/apps/MessagesApp.tsx`)

Enhanced marker detection system:

```typescript
type MessagesAppProps = {
  onOpenApp?: (appId: string, params?: { filter?: string }) => void
}
```

**Two-tier marker detection:**
1. **Filtered markers** (checked first - more specific):
   - Extracts both app ID and filter from marker
   - Example: `[OPEN:PROJECTS:Machine Learning]` → opens projects with ML filter

2. **General markers** (fallback):
   - Basic app opening without filter
   - Example: `[OPEN:PROJECTS]` → opens projects with "all" filter

**Process flow:**
1. AI responds with natural language + marker
2. MessagesApp parses response
3. Removes marker from displayed message
4. Opens app with optional filter parameter after 500ms delay

### 4. **Updated Desktop** (`src/components/desktop.tsx`)

Added state management for project filter:

```typescript
const [projectsFilter, setProjectsFilter] = useState<string>("all")
```

Updated `openOrActivateWindow` function:
```typescript
const openOrActivateWindow = (appId: string, params?: { filter?: string }) => {
  if (appId === 'projects' && params?.filter) {
    setProjectsFilter(params.filter)
  }
  // ...open/activate window
}
```

**Passes filter to ProjectsApp:**
```tsx
<ProjectsApp initialFilter={projectsFilter} />
```

## How It Works

### Example Flow: Machine Learning Question

**User asks:** "Tell me about your machine learning experience"

**AI Response:**
```
I'm primarily a full-stack developer, but I have some experience with 
machine learning through team projects. I've worked on iVision (an iOS 
app using CoreML and TensorFlow for eye disease detection) and Study.ai 
(an AI-powered learning platform using the Gemini API). While ML isn't 
my primary focus, these projects gave me hands-on experience with ML 
model integration and AI-driven features.

[OPEN:PROJECTS:Machine Learning]
```

**What happens:**
1. ✅ User sees clean response (marker removed)
2. ✅ Projects window opens automatically
3. ✅ ML filter is pre-selected
4. ✅ Shows: iVision and Study.ai projects
5. ✅ Messages window stays open for continued conversation

### Example Triggers

| Question | Response Tone | Opens | Filter |
|----------|--------------|-------|--------|
| "What do you know about ML?" | Honest about minimal experience, mentions team projects | Projects | Machine Learning |
| "What web apps have you built?" | Confident, discusses full-stack expertise | Projects | Website Development |
| "Do you have iOS experience?" | Mentions iVision app | Projects | App Development |
| "Tell me about data science" | Limited experience, mentions scraping projects | Projects | Data Science |
| "What have you built?" | General overview | Projects | All |
| "Show me your education" | Academic background | Education | N/A |

## Technical Architecture

```
User Question
     ↓
Gemini AI (with personality prompt)
     ↓
Response + Marker: "[OPEN:PROJECTS:Machine Learning]"
     ↓
MessagesApp.handleSendMessage()
     ├─ Parse marker
     ├─ Extract: appId="projects", filter="Machine Learning"
     └─ Remove marker from display
     ↓
onOpenApp("projects", { filter: "Machine Learning" })
     ↓
Desktop.openOrActivateWindow()
     ├─ Update projectsFilter state
     └─ Open/activate projects window
     ↓
ProjectsApp renders with initialFilter="Machine Learning"
     ├─ Sets filter state
     └─ Filters projects to ML category
     ↓
User sees ML projects (iVision, Study.ai)
```

## Key Features

✅ **Natural Conversation** - AI responds conversationally, not robotically  
✅ **Automatic Navigation** - No manual clicking needed  
✅ **Filtered Views** - Opens directly to relevant category  
✅ **Honest Responses** - AI acknowledges skill levels accurately  
✅ **Non-Intrusive** - Messages window stays open  
✅ **Multi-Domain Support** - Projects with multiple domains show in all relevant filters  
✅ **Fallback Handling** - Works with or without filters  

## Benefits

### For Users
- **Faster Discovery**: Directly see relevant projects
- **Better Context**: Questions answered with visual proof
- **Smooth UX**: No window juggling or manual navigation
- **Honest Assessment**: Realistic skill level communication

### For Portfolio
- **Intelligent Interaction**: Showcases advanced chat integration
- **Project Showcase**: Automatically highlights relevant work
- **Professional Honesty**: Builds trust with accurate self-assessment
- **Modern UX**: iOS-inspired smooth interactions

## Example Conversations

### Conversation 1: ML Question
```
User: "What's your machine learning experience?"

AI: "I'm primarily a full-stack developer, but I have worked on ML 
projects in teams. iVision uses CoreML and TensorFlow for eye disease 
detection, and Study.ai leverages the Gemini API for personalized 
learning. While not my main expertise, I understand ML integration 
in production apps."

[Projects window opens → ML filter → Shows iVision & Study.ai]
```

### Conversation 2: Web Development
```
User: "Show me your web development projects"

AI: "Web development is my strength! I specialize in Next.js and React. 
I've built full-stack applications like ExamCooker (exam management 
with CockroachDB), Kathuria Gun House (e-commerce with Razorpay), 
and this portfolio site you're viewing. Let me show you."

[Projects window opens → Web filter → Shows 8+ web projects]
```

### Conversation 3: iOS Development
```
User: "Have you built any iOS apps?"

AI: "Yes! I built iVision, an iOS app that uses machine learning to 
detect eye diseases in real-time through the device camera. It's 
built with Swift and integrates CoreML and TensorFlow models."

[Projects window opens → App filter → Shows iVision]
```

## Edge Cases Handled

1. **Multiple Markers**: Only first detected marker is used
2. **Unknown Filter**: Falls back to "all" filter
3. **No Marker**: Message displays normally without opening apps
4. **Window Already Open**: Brings to front and updates filter
5. **Invalid Filter Name**: Defaults to "all"

## Testing Checklist

- [ ] Ask "what do you know about machine learning"
- [ ] Verify Projects window opens with ML filter
- [ ] Check iVision and Study.ai appear
- [ ] Confirm Messages window stays open
- [ ] Test web development questions
- [ ] Test app development questions  
- [ ] Test data science questions
- [ ] Test general project questions
- [ ] Verify honest skill assessment in responses
- [ ] Test with Projects window already open (should update filter)

## Future Enhancements

Possible improvements:
- Add more granular filters (e.g., "Next.js projects")
- Support multiple simultaneous filters
- Add visual transition effects when filter changes
- Highlight specific projects in response
- Add "See more" prompts for related projects
- Track which projects users are most interested in
- Suggest related projects based on conversation

## Related Files

- `/src/data/personality-prompt.ts` - AI personality and navigation instructions
- `/src/components/apps/MessagesApp.tsx` - Marker detection and parsing
- `/src/components/apps/ProjectsApp.tsx` - Filter state management
- `/src/components/desktop.tsx` - Window and filter orchestration
- `/src/data/projects.ts` - Project data with multi-domain support
