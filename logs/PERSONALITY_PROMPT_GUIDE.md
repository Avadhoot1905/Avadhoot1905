# Personality Prompt Configuration Guide

This guide explains how to customize the AI personality in your Messages app to respond as you.

## 📍 File Location

The personality prompt is located at:
```
src/data/personality-prompt.ts
```

## 🎯 What It Does

The personality prompt file defines how the Gemini AI will respond in the Messages app. It includes:
- Your professional identity and expertise
- Personality traits and communication style
- Areas of knowledge and interests
- Example phrases and response guidelines

## ✏️ How to Customize

### 1. Open the Personality Prompt File
Navigate to `src/data/personality-prompt.ts` and edit the `PERSONALITY_PROMPT` constant.

### 2. Sections to Customize

#### Core Identity
Update with your actual information:
```typescript
- Name: Your Full Name
- Profession: Your Job Title
- Expertise: Your Key Skills
```

#### Personality Traits
Describe your actual personality:
- Are you formal or casual?
- Humorous or serious?
- Direct or diplomatic?
- Detail-oriented or big-picture focused?

#### Communication Style
How do you typically communicate?
- Sentence length and complexity
- Use of emojis or expressions
- Technical depth
- Tone (friendly, professional, etc.)

#### Areas of Expertise
List your actual skills and knowledge areas:
- Programming languages
- Frameworks and tools
- Industries or domains
- Hobbies and interests

#### Response Guidelines
Set boundaries for the AI:
- What topics should it discuss?
- How should it handle questions it can't answer?
- What level of detail to provide?

### 3. Example Customizations

**For a more casual tone:**
```typescript
## Communication Style
- Use casual language and slang
- Include emojis frequently 😊
- Keep responses short and punchy
- Use humor when appropriate
```

**For a more formal tone:**
```typescript
## Communication Style
- Use professional, formal language
- Minimize emoji usage
- Provide detailed, structured responses
- Maintain a respectful, business-like demeanor
```

**For a technical focus:**
```typescript
## Areas of Expertise
- Systems Architecture
- DevOps and Cloud Infrastructure (AWS, Azure)
- Microservices and API Design
- Performance Optimization
```

## 🔧 Technical Details

### How It Works

1. The prompt is imported in `src/actions/gemini.ts`
2. When a chat starts, the prompt is injected as the first "system" message
3. Gemini AI uses this context for all subsequent responses
4. The AI maintains this personality throughout the conversation

### Integration Points

**File: `src/actions/gemini.ts`**
```typescript
import { PERSONALITY_PROMPT } from "@/data/personality-prompt"

// The prompt is added to chat history
const systemMessage = {
  role: "user",
  parts: [{ text: PERSONALITY_PROMPT }],
}
```

**File: `src/components/apps/MessagesApp.tsx`**
- Uses `sendMessageWithHistory()` from gemini.ts
- Maintains conversation context
- Displays messages with timestamps

## 🎨 Tips for Best Results

### 1. Be Specific
Instead of "friendly," say "warm and welcoming, uses casual language, often checks in on how the user is doing"

### 2. Include Examples
Add example phrases you actually use:
```typescript
## Example Phrases You Might Use
- "Absolutely! Let me show you..."
- "That's a fantastic question"
- "Here's how I'd approach that..."
```

### 3. Set Boundaries
Be clear about what the AI should and shouldn't do:
```typescript
## What NOT to do
- Don't make up facts or experiences you don't have
- Don't give medical or legal advice
- Don't share confidential information
```

### 4. Add Context
Include background that helps the AI respond authentically:
```typescript
## Background
- Graduated from [University] with [Degree]
- Currently working at/on [Company/Project]
- Passionate about [Specific Interests]
- Based in [Location]
```

### 5. Test and Iterate
After making changes:
1. Save the file
2. Restart your development server if needed
3. Test the Messages app
4. Refine the prompt based on the responses

## 🔄 Updating the Prompt

Changes to the personality prompt take effect immediately in new conversations. Existing chat sessions maintain their context until the app is refreshed or restarted.

To test changes:
1. Edit `src/data/personality-prompt.ts`
2. Save the file
3. Refresh your browser
4. Start a new conversation in the Messages app

## 📝 Example Complete Prompt

See the current `personality-prompt.ts` file for a complete example. It includes:
- All necessary sections
- Proper formatting
- Detailed guidelines
- Example phrases

## 🚀 Advanced Configuration

### Adjusting AI Parameters

In `src/actions/gemini.ts`, you can also adjust:

```typescript
generationConfig: {
  maxOutputTokens: 1000,  // Response length (500-2000)
  temperature: 0.9,        // Creativity (0.1-1.0)
}
```

- **maxOutputTokens**: Controls response length (higher = longer responses)
- **temperature**: Controls randomness/creativity (higher = more creative/varied)

## 🐛 Troubleshooting

**Issue: AI not responding with personality**
- Ensure the file is saved
- Check for syntax errors in the prompt
- Verify the import in `gemini.ts`
- Restart the dev server

**Issue: Responses are too generic**
- Add more specific details to your prompt
- Include more example phrases
- Increase temperature in generationConfig

**Issue: Responses are inconsistent**
- Make guidelines more explicit
- Add more examples
- Lower the temperature setting

## 📚 Additional Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Prompt Engineering Best Practices](https://ai.google.dev/docs/prompt_best_practices)

---

**Last Updated**: October 2025
**Version**: 1.0
