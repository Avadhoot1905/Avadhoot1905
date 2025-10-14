"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function sendMessageToGemini(message: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    const result = await model.generateContent(message)
    const response = await result.response
    const text = response.text()
    
    return text
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return "Sorry, I encountered an error processing your message. Please try again."
  }
}

export async function sendMessageWithHistory(
  messages: { role: string; content: string }[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    // Convert messages to Gemini chat format
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))
    
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    })
    
    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response
    const text = response.text()
    
    return text
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return "Sorry, I encountered an error processing your message. Please try again."
  }
}
