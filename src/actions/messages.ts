"use server"

import { prisma } from "@/lib/prisma"

type MessageRole = "user" | "assistant"

interface MessageData {
  role: MessageRole
  content: string
  timestamp: Date
}

/**
 * Save a message to the database
 */
export async function saveMessage(
  sessionId: string,
  role: MessageRole,
  content: string
): Promise<void> {
  try {
    // Ensure session exists
    await prisma.chatSession.upsert({
      where: { sessionId },
      create: { sessionId },
      update: { updatedAt: new Date() },
    })

    // Create the message
    await prisma.message.create({
      data: {
        sessionId,
        role,
        content,
      },
    })
  } catch (error) {
    console.error("Error saving message:", error)
    throw new Error("Failed to save message")
  }
}

/**
 * Get all messages for a session
 */
export async function getSessionMessages(
  sessionId: string
): Promise<MessageData[]> {
  try {
    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { timestamp: "asc" },
    })

    return messages.map((msg: { role: string; content: string; timestamp: Date }) => ({
      role: msg.role as MessageRole,
      content: msg.content,
      timestamp: msg.timestamp,
    }))
  } catch (error) {
    console.error("Error fetching messages:", error)
    return []
  }
}

/**
 * Clear all messages for a session
 */
export async function clearSessionMessages(sessionId: string): Promise<void> {
  try {
    await prisma.message.deleteMany({
      where: { sessionId },
    })
  } catch (error) {
    console.error("Error clearing messages:", error)
    throw new Error("Failed to clear messages")
  }
}

/**
 * Delete a session and all its messages
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await prisma.chatSession.delete({
      where: { sessionId },
    })
  } catch (error) {
    console.error("Error deleting session:", error)
    throw new Error("Failed to delete session")
  }
}

/**
 * Get all sessions with their last message
 */
export async function getAllSessions() {
  try {
    const sessions = await prisma.chatSession.findMany({
      include: {
        messages: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return sessions.map((session: {
      sessionId: string;
      updatedAt: Date;
      createdAt: Date;
      messages: Array<{ content: string; timestamp: Date }>;
    }) => ({
      sessionId: session.sessionId,
      lastMessage: session.messages[0]?.content || "",
      lastMessageTime: session.messages[0]?.timestamp || session.createdAt,
      updatedAt: session.updatedAt,
    }))
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return []
  }
}
