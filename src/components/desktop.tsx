"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { MenuBar } from "@/components/menu-bar"
import { Dock } from "@/components/dock"
import { Window } from "@/components/window"
import { AppIcon } from "@/components/app-icon"
import { LoadingScreen } from "@/components/loading-screen"
import { ShutdownScreen } from "@/components/shutdown-screen"
import { LockScreen } from "@/components/lock-screen"
import { SelectionBox, SelectionRect } from "@/components/selection-box"
import { ContextMenu, ContextMenuPosition } from "@/components/context-menu"
import { useTheme } from "next-themes"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { X } from "lucide-react"
import { GiTicTacToe } from "react-icons/gi"
import {
  FaSafari,
  FaCommentDots,
  FaImages,
  FaUser,
  FaCode,
  FaGraduationCap,
  FaBriefcase,
  FaGamepad,
  FaTerminal
} from "react-icons/fa"
import { PiBirdFill } from "react-icons/pi"
import {
  SiGithub,
  SiLinkedin,
  SiLeetcode,
  SiMedium,
  SiGmail
} from "react-icons/si"
import { FinderApp } from "@/components/apps/FinderApp"
import { SafariApp } from "@/components/apps/SafariApp"
import { AboutApp } from "@/components/apps/AboutApp"
import { ProjectsApp } from "@/components/apps/ProjectsApp"
import { EducationApp } from "@/components/apps/EducationApp"
import { ExperienceApp } from "@/components/apps/ExperienceApp"
import { MessagesApp } from "@/components/apps/MessagesApp"
import { PhotosApp } from "@/components/apps/PhotosApp"
import { TicTacToeApp } from "@/components/apps/TicTacToeApp"
import { Game2048App } from "@/components/apps/Game2048App"
import { FlappyBirdApp } from "@/components/apps/FlappyBirdApp"
import { TerminalApp } from "@/components/apps/TerminalApp"
import { AchievementsApp, AchievementsAppIcon } from "@/components/apps/AchievementsApp"
import { Widgets } from "@/components/widgets"

const LOADING_SEEN_STORAGE_KEY = "macosDesktopLoadingSeen"
const ICON_POSITIONS_STORAGE_KEY = "macos_desktop_icon_positions"
const MOBILE_WELCOME_TIMEOUT_MS = 9000

type WelcomeNotificationExit = "right" | "left" | "up" | "pop-open" | "pop-close"

const finderIcon = (
  <img
    src="/assets/macos/finder-svgrepo-com.svg"
    alt="Finder"
    className="h-[88%] w-[88%] object-contain drop-shadow-sm"
    draggable={false}
  />
)

const safariIcon = (
  <img
    src="/assets/macos/safari-svgrepo-com.svg"
    alt="Safari"
    className="h-full w-full object-contain drop-shadow-sm"
    draggable={false}
  />
)

const messagesIcon = (
  <img
    src="/assets/macos/messages-svgrepo-com.svg"
    alt="Messages"
    className="h-full w-full object-contain drop-shadow-sm"
    draggable={false}
  />
)

const photosIcon = (
  <img
    src="/assets/macos/apple-photos.svg"
    alt="Photos"
    className="h-full w-full object-contain drop-shadow-sm"
    draggable={false}
  />
)

const profileIcon = (
  <img
    src="/assets/macos/contacts.svg"
    alt="About Me"
    className="h-[88%] w-[88%] object-contain drop-shadow-sm"
    draggable={false}
  />
)

const projectsIcon = (
  <img
    src="/assets/macos/Xcode.svg"
    alt="Projects"
    className="h-full w-full object-contain scale-[1.15] drop-shadow-sm"
    draggable={false}
  />
)

const achievementsIcon = (
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_Notes_icon.svg"
    alt="Achievements"
    className="h-[88%] w-[88%] object-contain drop-shadow-sm"
    draggable={false}
  />
)

const educationIcon = (
  <img
    src="/assets/macos/notion-svgrepo-com.svg"
    alt="Education"
    className="h-[86%] w-[86%] object-contain drop-shadow-sm"
    draggable={false}
  />
)

const experienceIcon = (
  <img
    src="/assets/macos/mail.svg"
    alt="Experience"
    className="h-[88%] w-[88%] object-contain drop-shadow-sm"
    draggable={false}
  />
)

const terminalIcon = (
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Terminalicon2.png"
    alt="Terminal"
    className="h-full w-full object-contain scale-110 drop-shadow-sm"
    draggable={false}
  />
)

const flappyBirdIcon = (
  <div className="flex h-[88%] w-[88%] items-center justify-center rounded-[22%] bg-gradient-to-b from-[#f8d040] to-[#e07020] p-2 shadow-sm">
    <img
      src="/assets/macos/Video-Game-Flappy-Bird--Streamline-Ultimate.svg"
      alt="Flappy Bird"
      className="h-full w-full object-contain drop-shadow-sm"
      draggable={false}
    />
  </div>
)

const game2048Icon = (
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/1/18/2048_logo.svg"
    alt="2048"
    className="h-[92%] w-[92%] object-contain drop-shadow-sm"
    draggable={false}
  />
)

const ticTacToeIcon = (
  <img
    src="/assets/macos/tic-tac-toe.svg"
    alt="Tic Tac Toe"
    className="h-[88%] w-[88%] object-contain drop-shadow-sm"
    draggable={false}
  />
)

const CELL_WIDTH = 104
const CELL_HEIGHT = 112
const RIGHT_MARGIN = 16
const TOP_MARGIN = 52

interface DesktopAppDefinition {
  id: string
  name: string
  icon: React.ReactElement
}

export function MacOSDesktop() {
  const [openWindows, setOpenWindows] = useState<string[]>([])
  const [activeWindow, setActiveWindow] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false)
  const [isShuttingDown, setIsShuttingDown] = useState(false)
  const [shutdownAction, setShutdownAction] = useState<'shutdown' | 'restart'>('shutdown')
  const [isLocked, setIsLocked] = useState(true)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [projectsFilter, setProjectsFilter] = useState<string>("all")
  const [terminalCommand, setTerminalCommand] = useState<string | undefined>(undefined)
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(true)
  const [isWelcomeHovered, setIsWelcomeHovered] = useState(false)
  const [welcomeNotificationExit, setWelcomeNotificationExit] = useState<WelcomeNotificationExit>("right")
  const { theme } = useTheme()

  // Desktop selection & layout states
  const [selectedIcons, setSelectedIcons] = useState<string[]>([])
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null)
  const [contextMenuPos, setContextMenuPos] = useState<ContextMenuPosition | null>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const desktopAreaRef = useRef<HTMLDivElement>(null)

  const desktopApps: DesktopAppDefinition[] = React.useMemo(() => [
    { id: "finder", name: "Finder", icon: finderIcon },
    { id: "safari", name: "Safari", icon: safariIcon },
    { id: "messages", name: "Messages", icon: messagesIcon },
    { id: "photos", name: "Photos", icon: photosIcon },
    { id: "about", name: "About Me", icon: profileIcon },
    { id: "projects", name: "Projects", icon: projectsIcon },
    { id: "achievements", name: "Achievements", icon: achievementsIcon },
    { id: "education", name: "Education", icon: educationIcon },
    { id: "experience", name: "Experience", icon: experienceIcon },
    { id: "tictactoe", name: "Tic Tac Toe", icon: ticTacToeIcon },
    { id: "2048", name: "2048", icon: game2048Icon },
    { id: "flappybird", name: "Flappy Bird", icon: flappyBirdIcon },
    { id: "terminal", name: "Terminal", icon: terminalIcon },
  ], [])

  // Helper to generate default macOS right-to-left vertical column layout
  const computeDefaultPositions = useCallback((containerWidth: number, containerHeight: number, apps: DesktopAppDefinition[]) => {
    const availHeight = Math.max(300, containerHeight - 120)
    const maxRows = Math.max(1, Math.floor(availHeight / CELL_HEIGHT))
    const positions: Record<string, { x: number; y: number }> = {}

    apps.forEach((app, idx) => {
      const col = Math.floor(idx / maxRows)
      const row = idx % maxRows
      const x = containerWidth - RIGHT_MARGIN - CELL_WIDTH - col * CELL_WIDTH
      const y = TOP_MARGIN + row * CELL_HEIGHT
      positions[app.id] = { x: Math.max(10, x), y: Math.max(10, y) }
    })

    return positions
  }, [])

  // Initialize or load saved icon positions
  useEffect(() => {
    if (typeof window === "undefined") return

    const updateLayout = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const defaults = computeDefaultPositions(width, height, desktopApps)

      const savedJson = localStorage.getItem(ICON_POSITIONS_STORAGE_KEY)
      if (savedJson) {
        try {
          const parsed = JSON.parse(savedJson) as Record<string, { x: number; y: number }>
          const merged: Record<string, { x: number; y: number }> = {}
          desktopApps.forEach((app) => {
            if (
              parsed[app.id] &&
              parsed[app.id].x >= 0 &&
              parsed[app.id].x <= width - 60 &&
              parsed[app.id].y >= TOP_MARGIN &&
              parsed[app.id].y <= height - 80
            ) {
              merged[app.id] = parsed[app.id]
            } else {
              merged[app.id] = defaults[app.id]
            }
          })
          setIconPositions(merged)
          return
        } catch {
          // ignore error and fallback to defaults
        }
      }
      setIconPositions(defaults)
    }

    updateLayout()
  }, [computeDefaultPositions, desktopApps])

  const savePositionsToStorage = useCallback((newPos: Record<string, { x: number; y: number }>) => {
    setIconPositions(newPos)
    try {
      localStorage.setItem(ICON_POSITIONS_STORAGE_KEY, JSON.stringify(newPos))
    } catch {
      // ignore storage errors
    }
  }, [])

  // Snap an icon to grid on drag end
  const handleIconDragEnd = useCallback((id: string, rawX: number, rawY: number) => {
    const width = window.innerWidth
    const height = window.innerHeight
    const colFromRight = Math.max(0, Math.round((width - RIGHT_MARGIN - CELL_WIDTH - rawX) / CELL_WIDTH))
    const rowFromTop = Math.max(0, Math.round((rawY - TOP_MARGIN) / CELL_HEIGHT))

    const snappedX = width - RIGHT_MARGIN - CELL_WIDTH - colFromRight * CELL_WIDTH
    const snappedY = TOP_MARGIN + rowFromTop * CELL_HEIGHT

    savePositionsToStorage({
      ...iconPositions,
      [id]: {
        x: Math.max(10, Math.min(width - CELL_WIDTH, snappedX)),
        y: Math.max(TOP_MARGIN, Math.min(height - CELL_HEIGHT - 60, snappedY)),
      },
    })
  }, [iconPositions, savePositionsToStorage])

  // Clean up icons to macOS clean right-aligned grid
  const handleCleanUp = useCallback(() => {
    const newPositions = computeDefaultPositions(window.innerWidth, window.innerHeight, desktopApps)
    savePositionsToStorage(newPositions)
  }, [computeDefaultPositions, desktopApps, savePositionsToStorage])

  // Sort by name and arrange
  const handleSortByName = useCallback(() => {
    const sorted = [...desktopApps].sort((a, b) => a.name.localeCompare(b.name))
    const newPositions = computeDefaultPositions(window.innerWidth, window.innerHeight, sorted)
    savePositionsToStorage(newPositions)
  }, [computeDefaultPositions, desktopApps, savePositionsToStorage])

  // Prevent hydration mismatch & check mobile
  useEffect(() => {
    setMounted(true)

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    const hasSeenLoading = localStorage.getItem(LOADING_SEEN_STORAGE_KEY) === "1"
    const shouldShowLoading = !hasSeenLoading

    if (!shouldShowLoading) {
      setIsLoading(false)
      setIsAssetsLoaded(true)
      return
    }

    localStorage.setItem(LOADING_SEEN_STORAGE_KEY, "1")
    setIsLoading(true)
    setIsAssetsLoaded(false)

    const timer = setTimeout(() => {
      setIsAssetsLoaded(true)
    }, 6500)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    if (!showWelcomeNotification || !isMobile || isLocked || isLoading || isShuttingDown) {
      return
    }

    const timer = setTimeout(() => {
      setWelcomeNotificationExit("up")
      setShowWelcomeNotification(false)
    }, MOBILE_WELCOME_TIMEOUT_MS)

    return () => clearTimeout(timer)
  }, [isLoading, isLocked, isMobile, isShuttingDown, showWelcomeNotification])

  useEffect(() => {
    if (openWindows.includes("terminal") && terminalCommand) {
      const timer = setTimeout(() => {
        setTerminalCommand(undefined)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [terminalCommand, openWindows])

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now())
    if (isLocked) {
      setIsLocked(false)
    }
  }, [isLocked])

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'keyup', 'scroll', 'touchstart', 'click', 'input']

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
    }
  }, [updateActivity])

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > 300000) {
        setIsLocked(true)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [lastActivity])

  const handleUnlock = () => {
    setIsLocked(false)
    setLastActivity(Date.now())
  }

  const handleLockScreen = () => {
    setIsLocked(true)
    setLastActivity(Date.now())
  }

  const handleShutdown = () => {
    setShutdownAction('shutdown')
    setIsShuttingDown(true)
  }

  const handleRestart = () => {
    setShutdownAction('restart')
    setIsShuttingDown(true)
  }

  const handleShutdownComplete = () => {
    setIsShuttingDown(false)
    setIsLoading(true)
    setIsLocked(true)
  }

  const toggleWindow = useCallback((appId: string) => {
    if (appId === "gmail") {
      window.open("mailto:arcsmo19@gmail.com", "_blank")
      return
    }
    if (appId === "linkedin") {
      window.open("https://www.linkedin.com/in/avadhoot-mahadik/", "_blank")
      return
    }
    if (appId === "github") {
      window.open("https://github.com/Avadhoot1905", "_blank")
      return
    }
    if (appId === "leetcode") {
      window.open("https://leetcode.com/u/arcsmo19/", "_blank")
      return
    }
    if (appId === "medium") {
      window.open("https://medium.com/@arcsmo19", "_blank")
      return
    }

    setOpenWindows((prev) => {
      if (prev.includes(appId)) {
        const next = prev.filter((id) => id !== appId)
        setActiveWindow(next.length > 0 ? next[next.length - 1] : null)
        return next
      } else {
        setActiveWindow(appId)
        return [...prev, appId]
      }
    })
  }, [])

  const activateWindow = useCallback((appId: string) => {
    setActiveWindow(appId)
  }, [])

  const openOrActivateWindow = useCallback((appId: string, params?: { filter?: string; command?: string }) => {
    if (appId === 'projects' && params?.filter) {
      setProjectsFilter(params.filter)
    }

    if (appId === 'terminal' && params?.command) {
      setTerminalCommand(params.command)
    }

    setOpenWindows((prevWindows) => {
      if (prevWindows.includes(appId)) {
        setActiveWindow(appId)
        if (appId === 'terminal' && params?.command) {
          setTerminalCommand(params.command)
        }
        return prevWindows
      } else {
        setActiveWindow(appId)
        return [...prevWindows, appId]
      }
    })
  }, [])

  const handleLoadingDismiss = useCallback(() => {
    setIsLoading(false)
    localStorage.setItem(LOADING_SEEN_STORAGE_KEY, "1")
  }, [])

  const dismissWelcomeNotification = useCallback((direction: WelcomeNotificationExit) => {
    setWelcomeNotificationExit(direction)
    setShowWelcomeNotification(false)
  }, [])

  const handleWelcomeNotificationOpen = useCallback(() => {
    dismissWelcomeNotification("pop-open")
    setTimeout(() => {
      openOrActivateWindow("about")
    }, 140)
  }, [dismissWelcomeNotification, openOrActivateWindow])

  const handleWelcomeNotificationClose = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    dismissWelcomeNotification("pop-close")
  }, [dismissWelcomeNotification])

  const handleWelcomeSwipeEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isMobile) return
    const offsetX = info.offset.x
    const offsetY = info.offset.y
    const absX = Math.abs(offsetX)
    const absY = Math.abs(offsetY)
    const threshold = 80

    if (absX < threshold && offsetY > -threshold) return
    if (absX > absY && absX >= threshold) {
      dismissWelcomeNotification(offsetX > 0 ? "right" : "left")
      return
    }
    if (offsetY <= -threshold) {
      dismissWelcomeNotification("up")
    }
  }, [dismissWelcomeNotification, isMobile])

  const welcomeNotificationExitAnimation = useCallback((direction: WelcomeNotificationExit) => {
    if (direction === "left") return { x: -220, opacity: 0, scale: 0.92, transition: { duration: 0.22 } }
    if (direction === "up") return { y: -160, opacity: 0, scale: 0.94, transition: { duration: 0.22 } }
    if (direction === "pop-open") {
      return {
        scale: [1, 1.08, 0.68],
        opacity: [1, 1, 0],
        transition: { duration: 0.24, times: [0, 0.42, 1] },
      }
    }
    if (direction === "pop-close") {
      return {
        scale: [1, 1.04, 0.72],
        opacity: [1, 0.95, 0],
        transition: { duration: 0.2, times: [0, 0.45, 1] },
      }
    }
    return { x: 220, opacity: 0, scale: 0.92, transition: { duration: 0.22 } }
  }, [])

  // Desktop selection box handlers
  const handleDesktopPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMobile) return
    if (e.button !== 0) return

    // Ensure click is on the desktop background itself
    const target = e.target as Element
    if (
      !target ||
      target.closest(".window-drag-handle") ||
      target.closest("[data-window]") ||
      target.closest("[data-app-icon]") ||
      target.closest("[data-widget]") ||
      target.closest("[data-context-menu]") ||
      target.closest("[data-dock]") ||
      target.closest("[data-menu-bar]")
    ) {
      return
    }

    setContextMenuPos(null)

    if (!e.shiftKey && !e.metaKey) {
      setSelectedIcons([])
    }

    const rect = desktopAreaRef.current?.getBoundingClientRect()
    if (!rect) return

    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top

    dragStartRef.current = { x: startX, y: startY }
    setSelectionRect({ left: startX, top: startY, width: 0, height: 0 })
  }

  const handleDesktopPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMobile || !dragStartRef.current || !desktopAreaRef.current) return

    const rect = desktopAreaRef.current.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    const left = Math.min(dragStartRef.current.x, currentX)
    const top = Math.min(dragStartRef.current.y, currentY)
    const width = Math.abs(currentX - dragStartRef.current.x)
    const height = Math.abs(currentY - dragStartRef.current.y)

    setSelectionRect({ left, top, width, height })

    // Check intersections with icons
    if (width > 4 || height > 4) {
      const intersectingIds: string[] = []
      desktopApps.forEach((app) => {
        const pos = iconPositions[app.id]
        if (!pos) return
        const iconRect = { left: pos.x, top: pos.y, right: pos.x + 88, bottom: pos.y + 88 }
        const intersects = !(
          iconRect.right < left ||
          iconRect.left > left + width ||
          iconRect.bottom < top ||
          iconRect.top > top + height
        )
        if (intersects) {
          intersectingIds.push(app.id)
        }
      })
      setSelectedIcons(intersectingIds)
    }
  }

  const handleDesktopPointerUp = () => {
    dragStartRef.current = null
    setSelectionRect(null)
  }

  const handleDesktopContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return
    e.preventDefault()
    setContextMenuPos({ x: e.clientX, y: e.clientY })
  }

  const handleIconClick = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setContextMenuPos(null)

    if (e.shiftKey || e.metaKey) {
      setSelectedIcons((prev) =>
        prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
      )
    } else {
      setSelectedIcons([appId])
    }
  }

  const handleIconDoubleClick = (appId: string) => {
    openOrActivateWindow(appId)
  }

  // Keyboard navigation for desktop icons
  useEffect(() => {
    if (isMobile || isLocked) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedIcons([])
        setContextMenuPos(null)
      } else if (e.key === "Enter") {
        selectedIcons.forEach((id) => openOrActivateWindow(id))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMobile, isLocked, selectedIcons, openOrActivateWindow])

  if (!mounted) return null

  if (isLoading) {
    return (
      <AnimatePresence>
        <LoadingScreen
          isLoaded={isAssetsLoaded}
          onDismiss={handleLoadingDismiss}
        />
      </AnimatePresence>
    )
  }

  if (isShuttingDown) {
    return (
      <AnimatePresence>
        <ShutdownScreen
          action={shutdownAction}
          onShutdownComplete={handleShutdownComplete}
        />
      </AnimatePresence>
    )
  }

  return (
    <div
      className="h-screen w-full overflow-hidden font-sans transition-colors duration-300 text-white relative select-none"
      style={{
        backgroundImage: `url(/assets/${theme === 'dark' ? 'v-light.jpg' : 'v-dark.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <AnimatePresence mode="wait">
        <LockScreen
          key="lockscreen"
          isLocked={isLocked}
          onUnlock={handleUnlock}
        />
      </AnimatePresence>
      {!isLocked && (
        <>
          <MenuBar
            onLockScreen={handleLockScreen}
            onShutdown={handleShutdown}
            onRestart={handleRestart}
            activeApp={activeWindow}
          />

          <AnimatePresence>
            {showWelcomeNotification && (
              <motion.div
                key="welcome-notification"
                className="fixed right-4 top-12 z-[120] w-[min(360px,calc(100vw-2rem))]"
                initial={{ opacity: 0, x: 80, scale: 0.92 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: { type: "spring", stiffness: 340, damping: 28 },
                }}
                exit={welcomeNotificationExitAnimation(welcomeNotificationExit)}
                drag={isMobile}
                dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
                dragElastic={0.2}
                dragMomentum={false}
                onDragEnd={isMobile ? handleWelcomeSwipeEnd : undefined}
                onMouseEnter={!isMobile ? () => setIsWelcomeHovered(true) : undefined}
                onMouseLeave={!isMobile ? () => setIsWelcomeHovered(false) : undefined}
                onClick={handleWelcomeNotificationOpen}
              >
                <div
                  data-widget="true"
                  onPointerDown={(e) => e.stopPropagation()}
                  className="relative cursor-pointer overflow-visible rounded-2xl border border-gray-200/90 bg-white/90 px-4 py-3 text-gray-800 shadow-2xl transition-transform duration-200"
                  style={{
                    backdropFilter: "blur(26px) saturate(180%)",
                    WebkitBackdropFilter: "blur(26px) saturate(180%)",
                  }}
                >
                  {!isMobile && (
                    <button
                      aria-label="Dismiss welcome notification"
                      onClick={handleWelcomeNotificationClose}
                      className={`absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 shadow-md transition-all duration-200 ${isWelcomeHovered ? "opacity-100" : "pointer-events-none opacity-0"
                        }`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gray-900/10">
                      <img
                        src="/favicon.ico"
                        alt="Avadhoot Portfolio"
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold tracking-wide">Welcome to Avadhoot&apos;s Portfolio</p>
                      <p className="text-xs leading-5 text-gray-600">
                        Click this notification to know more about me.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            ref={desktopAreaRef}
            className="relative h-screen w-full overflow-hidden p-4 pt-14 pb-24"
            onPointerDown={handleDesktopPointerDown}
            onPointerMove={handleDesktopPointerMove}
            onPointerUp={handleDesktopPointerUp}
            onContextMenu={handleDesktopContextMenu}
          >
            {isMobile ? (
              /* Mobile Grid View (unchanged) */
              <motion.div
                className="grid gap-3 p-3 md:gap-4 md:p-4 md:grid-cols-6 grid-cols-4 max-w-md md:max-w-none mx-auto mt-0 md:mt-0 pt-48 md:pt-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
              >
                {desktopApps.map((app) => (
                  <AppIcon
                    key={app.id}
                    id={app.id}
                    name={app.name}
                    icon={app.icon}
                    onClick={() => openOrActivateWindow(app.id)}
                  />
                ))}
              </motion.div>
            ) : (
              /* Desktop macOS Layout View */
              <div className="absolute inset-0 pt-14 pb-24 pointer-events-auto">
                <SelectionBox rect={selectionRect} />
                <ContextMenu
                  position={contextMenuPos}
                  onClose={() => setContextMenuPos(null)}
                  onCleanUp={handleCleanUp}
                  onSortByName={handleSortByName}
                  onOpenAbout={() => openOrActivateWindow("about")}
                />
                {desktopApps.map((app) => {
                  const pos = iconPositions[app.id] || { x: 0, y: 0 }
                  return (
                    <AppIcon
                      key={app.id}
                      id={app.id}
                      name={app.name}
                      icon={app.icon}
                      x={pos.x}
                      y={pos.y}
                      isSelected={selectedIcons.includes(app.id)}
                      onClick={(e) => handleIconClick(app.id, e)}
                      onDoubleClick={() => handleIconDoubleClick(app.id)}
                      onDragEnd={handleIconDragEnd}
                    />
                  )
                })}
              </div>
            )}

            <AnimatePresence>
              {openWindows.includes("finder") && (
                <Window
                  key="finder"
                  title="Finder"
                  isActive={activeWindow === "finder"}
                  onActivate={() => activateWindow("finder")}
                  onClose={() => toggleWindow("finder")}
                  initialPosition={{ x: 100, y: 100 }}
                  initialSize={{ width: 600, height: 400 }}
                >
                  <FinderApp />
                </Window>
              )}

              {openWindows.includes("safari") && (
                <Window
                  key="safari"
                  title="Safari"
                  isActive={activeWindow === "safari"}
                  onActivate={() => activateWindow("safari")}
                  onClose={() => toggleWindow("safari")}
                  initialPosition={{ x: 150, y: 150 }}
                  initialSize={{ width: 800, height: 600 }}
                >
                  <SafariApp />
                </Window>
              )}

              {openWindows.includes("messages") && (
                <Window
                  key="messages"
                  title="Messages"
                  isActive={activeWindow === "messages"}
                  onActivate={() => activateWindow("messages")}
                  onClose={() => toggleWindow("messages")}
                  initialPosition={{ x: 200, y: 200 }}
                  initialSize={{ width: 900, height: 600 }}
                >
                  <MessagesApp onOpenApp={openOrActivateWindow} />
                </Window>
              )}

              {openWindows.includes("photos") && (
                <Window
                  key="photos"
                  title="Photos"
                  isActive={activeWindow === "photos"}
                  onActivate={() => activateWindow("photos")}
                  onClose={() => toggleWindow("photos")}
                  initialPosition={{ x: 250, y: 150 }}
                  initialSize={{ width: 750, height: 600 }}
                >
                  <PhotosApp />
                </Window>
              )}

              {openWindows.includes("about") && (
                <Window
                  key="about"
                  title="About Me"
                  isActive={activeWindow === "about"}
                  onActivate={() => activateWindow("about")}
                  onClose={() => toggleWindow("about")}
                  initialPosition={{ x: 50, y: 80 }}
                  initialSize={{ width: 650, height: 680 }}
                >
                  <AboutApp onOpenApp={openOrActivateWindow} />
                </Window>
              )}

              {openWindows.includes("projects") && (
                <Window
                  key="projects"
                  title="Projects"
                  isActive={activeWindow === "projects"}
                  onActivate={() => activateWindow("projects")}
                  onClose={() => toggleWindow("projects")}
                  initialPosition={{ x: 200, y: 120 }}
                  initialSize={{ width: 700, height: 550 }}
                >
                  <ProjectsApp initialFilter={projectsFilter} />
                </Window>
              )}

              {openWindows.includes("achievements") && (
                <Window
                  key="achievements"
                  title="Achievements"
                  isActive={activeWindow === "achievements"}
                  onActivate={() => activateWindow("achievements")}
                  onClose={() => toggleWindow("achievements")}
                  initialPosition={{ x: 240, y: 140 }}
                  initialSize={{ width: 820, height: 560 }}
                >
                  <AchievementsApp />
                </Window>
              )}

              {openWindows.includes("education") && (
                <Window
                  key="education"
                  title="Education"
                  isActive={activeWindow === "education"}
                  onActivate={() => activateWindow("education")}
                  onClose={() => toggleWindow("education")}
                  initialPosition={{ x: 180, y: 140 }}
                  initialSize={{ width: 750, height: 600 }}
                >
                  <EducationApp />
                </Window>
              )}

              {openWindows.includes("experience") && (
                <Window
                  key="experience"
                  title="Experience"
                  isActive={activeWindow === "experience"}
                  onActivate={() => activateWindow("experience")}
                  onClose={() => toggleWindow("experience")}
                  initialPosition={{ x: 220, y: 160 }}
                  initialSize={{ width: 1000, height: 550 }}
                >
                  <ExperienceApp />
                </Window>
              )}

              {openWindows.includes("tictactoe") && (
                <Window
                  key="tictactoe"
                  title="Tic Tac Toe"
                  isActive={activeWindow === "tictactoe"}
                  onActivate={() => activateWindow("tictactoe")}
                  onClose={() => toggleWindow("tictactoe")}
                  initialPosition={{ x: 300, y: 100 }}
                  initialSize={{ width: 500, height: 600 }}
                >
                  <TicTacToeApp />
                </Window>
              )}

              {openWindows.includes("2048") && (
                <Window
                  key="2048"
                  title="2048"
                  isActive={activeWindow === "2048"}
                  onActivate={() => activateWindow("2048")}
                  onClose={() => toggleWindow("2048")}
                  initialPosition={{ x: 350, y: 80 }}
                  initialSize={{ width: 550, height: 700 }}
                >
                  <Game2048App />
                </Window>
              )}

              {openWindows.includes("flappybird") && (
                <Window
                  key="flappybird"
                  title="Flappy Bird"
                  isActive={activeWindow === "flappybird"}
                  onActivate={() => activateWindow("flappybird")}
                  onClose={() => toggleWindow("flappybird")}
                  initialPosition={{ x: 380, y: 90 }}
                  initialSize={{ width: 520, height: 700 }}
                >
                  <FlappyBirdApp />
                </Window>
              )}

              {openWindows.includes("terminal") && (
                <Window
                  key="terminal"
                  title="Terminal"
                  isActive={activeWindow === "terminal"}
                  onActivate={() => activateWindow("terminal")}
                  onClose={() => {
                    toggleWindow("terminal")
                    setTerminalCommand(undefined)
                  }}
                  initialPosition={{ x: 720, y: 80 }}
                  initialSize={{ width: 650, height: 600 }}
                >
                  <TerminalApp
                    onClose={() => {
                      toggleWindow("terminal")
                      setTerminalCommand(undefined)
                    }}
                    onOpenApp={openOrActivateWindow}
                    initialCommand={terminalCommand}
                  />
                </Window>
              )}
            </AnimatePresence>

            <Widgets />
          </div>

          <Dock
            apps={[
              { id: "finder", icon: finderIcon, isOpen: openWindows.includes("finder") },
              { id: "about", icon: profileIcon, isOpen: openWindows.includes("about") },
              { id: "experience", icon: experienceIcon, isOpen: openWindows.includes("experience") },
              { id: "projects", icon: projectsIcon, isOpen: openWindows.includes("projects") },
              { id: "education", icon: educationIcon, isOpen: openWindows.includes("education") },
              { id: "safari", icon: safariIcon, isOpen: openWindows.includes("safari") },
              { id: "terminal", icon: terminalIcon, isOpen: openWindows.includes("terminal") },
              {
                id: "gmail", icon: (
                  <div className="flex h-[88%] w-[88%] items-center justify-center rounded-[22%] bg-white shadow-sm">
                    <SiGmail className="h-3/5 w-3/5 text-[#EA4335]" />
                  </div>
                ), isOpen: false
              },
              {
                id: "github", icon: (
                  <div className="flex h-[88%] w-[88%] items-center justify-center rounded-[22%] bg-[#181717] shadow-sm border border-white/10">
                    <SiGithub className="h-3/5 w-3/5 text-white" />
                  </div>
                ), isOpen: false
              },
              {
                id: "linkedin", icon: (
                  <div className="flex h-[88%] w-[88%] items-center justify-center rounded-[22%] bg-[#0A66C2] shadow-sm">
                    <SiLinkedin className="h-3/5 w-3/5 text-white" />
                  </div>
                ), isOpen: false
              },
              {
                id: "leetcode", icon: (
                  <div className="flex h-[88%] w-[88%] items-center justify-center rounded-[22%] bg-[#282828] shadow-sm">
                    <SiLeetcode className="h-3/5 w-3/5 text-[#FFA116]" />
                  </div>
                ), isOpen: false
              },
              {
                id: "medium", icon: (
                  <div className="flex h-[88%] w-[88%] items-center justify-center rounded-[22%] bg-black shadow-sm border border-white/10">
                    <SiMedium className="h-3/5 w-3/5 text-white" />
                  </div>
                ), isOpen: false
              },
            ]}
            onAppClick={openOrActivateWindow}
          />
        </>
      )}
    </div>
  )
}
