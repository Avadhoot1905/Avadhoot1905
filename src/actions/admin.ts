"use server"

import { prisma } from "@/lib/prisma"

/**
 * Verify admin password
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD
  
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD not set in environment variables")
    return false
  }
  
  return password === adminPassword
}

/**
 * Get all database statistics
 */
export async function getDatabaseStats() {
  try {
    const [totalSessions, totalMessages] = await Promise.all([
      prisma.chatSession.count(),
      prisma.message.count(),
    ])

    const sessionStats = await prisma.chatSession.findMany({
      include: {
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return {
      success: true,
      stats: {
        totalSessions,
        totalMessages,
        averageMessagesPerSession: totalSessions > 0 ? (totalMessages / totalSessions).toFixed(2) : 0,
      },
      sessionStats: sessionStats.map((session: {
        sessionId: string;
        _count: { messages: number };
        createdAt: Date;
        updatedAt: Date;
      }) => ({
        sessionId: session.sessionId,
        messageCount: session._count.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      })),
    }
  } catch (error) {
    console.error("Error fetching database stats:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get all sessions with full message history
 */
export async function getAllSessionsWithMessages() {
  try {
    const sessions = await prisma.chatSession.findMany({
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return {
      success: true,
      data: sessions.map((session: {
        id: string;
        sessionId: string;
        createdAt: Date;
        updatedAt: Date;
        messages: Array<{ id: string; role: string; content: string; timestamp: Date }>;
      }) => ({
        id: session.id,
        sessionId: session.sessionId,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
        messages: session.messages.map((msg: { id: string; role: string; content: string; timestamp: Date }) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        })),
      })),
    }
  } catch (error) {
    console.error("Error fetching all sessions:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    }
  }
}

/**
 * Delete all messages and sessions (admin only)
 */
export async function clearAllData() {
  try {
    await prisma.message.deleteMany()
    await prisma.chatSession.deleteMany()

    return {
      success: true,
      message: "All data cleared successfully",
    }
  } catch (error) {
    console.error("Error clearing data:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Delete a specific session (admin)
 */
export async function deleteSessionAdmin(sessionId: string) {
  try {
    await prisma.chatSession.delete({
      where: { sessionId },
    })

    return {
      success: true,
      message: `Session ${sessionId} deleted successfully`,
    }
  } catch (error) {
    console.error("Error deleting session:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
