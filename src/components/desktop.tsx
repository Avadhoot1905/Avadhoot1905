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
import {
  SiGithub,
  SiLinkedin,
  SiLeetcode,
  SiMedium,
  SiGmail
} from "react-icons/si"
import dynamic from "next/dynamic"
import { Widgets } from "@/components/widgets"

/**
 * ===================================================
 * LAZY-LOADED DESKTOP APPLICATIONS
 * ===================================================
 * Each app window is code-split with next/dynamic so its JavaScript is only
 * downloaded when the user opens (or hovers) that app — instead of shipping
 * every app (and Pixi.js) in the first-paint bundle.
 *
 * `appImport` holds the raw import() thunks. The bundler dedupes these with the
 * dynamic() loaders (same module specifier => same chunk), so we can trigger a
 * preload on hover without a second network request. Flappy Bird (Pixi.js) is
 * intentionally excluded from hover-preload so Pixi is never fetched until the
 * game is actually opened.
 */
const appImport = {
  finder: () => import("@/components/apps/FinderApp"),
  safari: () => import("@/components/apps/SafariApp"),
  about: () => import("@/components/apps/AboutApp"),
  projects: () => import("@/components/apps/ProjectsApp"),
  education: () => import("@/components/apps/EducationApp"),
  experience: () => import("@/components/apps/ExperienceApp"),
  messages: () => import("@/components/apps/MessagesApp"),
  photos: () => import("@/components/apps/PhotosApp"),
  tictactoe: () => import("@/components/apps/TicTacToeApp"),
  "2048": () => import("@/components/apps/Game2048App"),
  flappybird: () => import("@/components/apps/FlappyBirdApp"),
  terminal: () => import("@/components/apps/TerminalApp"),
  achievements: () => import("@/components/apps/AchievementsApp"),
} as const

const FinderApp = dynamic(() => appImport.finder().then((m) => m.FinderApp), { ssr: false })
const SafariApp = dynamic(() => appImport.safari().then((m) => m.SafariApp), { ssr: false })
const AboutApp = dynamic(() => appImport.about().then((m) => m.AboutApp), { ssr: false })
const ProjectsApp = dynamic(() => appImport.projects().then((m) => m.ProjectsApp), { ssr: false })
const EducationApp = dynamic(() => appImport.education().then((m) => m.EducationApp), { ssr: false })
const ExperienceApp = dynamic(() => appImport.experience().then((m) => m.ExperienceApp), { ssr: false })
const MessagesApp = dynamic(() => appImport.messages().then((m) => m.MessagesApp), { ssr: false })
const PhotosApp = dynamic(() => appImport.photos().then((m) => m.PhotosApp), { ssr: false })
const TicTacToeApp = dynamic(() => appImport.tictactoe().then((m) => m.TicTacToeApp), { ssr: false })
const Game2048App = dynamic(() => appImport["2048"]().then((m) => m.Game2048App), { ssr: false })
const FlappyBirdApp = dynamic(() => appImport.flappybird().then((m) => m.FlappyBirdApp), { ssr: false })
const TerminalApp = dynamic(() => appImport.terminal().then((m) => m.TerminalApp), { ssr: false })
const AchievementsApp = dynamic(() => appImport.achievements().then((m) => m.AchievementsApp), { ssr: false })

// Preload an app's chunk ahead of open (on hover) for instant-feel UX.
// Pixi.js-backed Flappy Bird is excluded so Pixi stays off the wire until opened.
const preloadApp = (id: string) => {
  if (id === "flappybird") return
  const loader = (appImport as Record<string, (() => Promise<unknown>) | undefined>)[id]
  loader?.()
}

const LOADING_SEEN_STORAGE_KEY = "macosDesktopLoadingSeen"
const ICON_POSITIONS_STORAGE_KEY = "macos_desktop_icon_positions"
const WELCOME_TIMEOUT_MS = 10000

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
    src="/assets/macos/Apple_Notes_icon.svg"
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
    src="/assets/macos/Terminalicon2.webp"
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
    src="/assets/macos/2048_logo.svg"
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

const isOverlappingWidgetsArea = (x: number, y: number): boolean => {
  return x < 410 && y < 250
}

const findNearestValidGridPosition = (
  targetX: number,
  targetY: number,
  occupiedCells: Set<string>,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } => {
  const availHeight = Math.max(300, containerHeight - 120)
  const maxRows = Math.max(1, Math.floor(availHeight / CELL_HEIGHT))
  const maxCols = Math.max(1, Math.floor((containerWidth - RIGHT_MARGIN) / CELL_WIDTH))

  let bestX = targetX
  let bestY = targetY
  let minDistance = Number.MAX_VALUE

  for (let col = 0; col < maxCols; col++) {
    for (let row = 0; row < maxRows; row++) {
      const x = containerWidth - RIGHT_MARGIN - CELL_WIDTH - col * CELL_WIDTH
      const y = TOP_MARGIN + row * CELL_HEIGHT

      if (x < 10 || y < TOP_MARGIN || y > containerHeight - CELL_HEIGHT - 60) continue
      if (isOverlappingWidgetsArea(x, y)) continue

      const key = `${Math.round(x)},${Math.round(y)}`
      if (occupiedCells.has(key)) continue

      const dist = (x - targetX) ** 2 + (y - targetY) ** 2
      if (dist < minDistance) {
        minDistance = dist
        bestX = x
        bestY = y
      }
    }
  }

  return { x: bestX, y: bestY }
}

const sanitizeIconPositions = (
  positions: Record<string, { x: number; y: number }>,
  containerWidth: number,
  containerHeight: number,
  apps: DesktopAppDefinition[]
): Record<string, { x: number; y: number }> => {
  const clean: Record<string, { x: number; y: number }> = {}
  const occupiedCells = new Set<string>()

  apps.forEach((app) => {
    const raw = positions[app.id] || { x: containerWidth - 120, y: TOP_MARGIN }
    const colFromRight = Math.max(0, Math.round((containerWidth - RIGHT_MARGIN - CELL_WIDTH - raw.x) / CELL_WIDTH))
    const rowFromTop = Math.max(0, Math.round((raw.y - TOP_MARGIN) / CELL_HEIGHT))

    let snappedX = containerWidth - RIGHT_MARGIN - CELL_WIDTH - colFromRight * CELL_WIDTH
    let snappedY = TOP_MARGIN + rowFromTop * CELL_HEIGHT

    snappedX = Math.max(10, Math.min(containerWidth - CELL_WIDTH, snappedX))
    snappedY = Math.max(TOP_MARGIN, Math.min(containerHeight - CELL_HEIGHT - 60, snappedY))

    const cellKey = `${Math.round(snappedX)},${Math.round(snappedY)}`

    if (!isOverlappingWidgetsArea(snappedX, snappedY) && !occupiedCells.has(cellKey)) {
      clean[app.id] = { x: snappedX, y: snappedY }
      occupiedCells.add(cellKey)
    } else {
      const best = findNearestValidGridPosition(snappedX, snappedY, occupiedCells, containerWidth, containerHeight)
      const bestKey = `${Math.round(best.x)},${Math.round(best.y)}`
      clean[app.id] = best
      occupiedCells.add(bestKey)
    }
  })

  return clean
}

export function MacOSDesktop() {
  const [openWindows, setOpenWindows] = useState<string[]>([])
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([])
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

    return sanitizeIconPositions(positions, containerWidth, containerHeight, apps)
  }, [])

  // Desktop selection & layout states
  const [selectedIcons, setSelectedIcons] = useState<string[]>([])
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    if (typeof window === "undefined") return {}
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
        return sanitizeIconPositions(merged, width, height, desktopApps)
      } catch {
        // ignore error and fallback to defaults
      }
    }
    return defaults
  })
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null)
  const [contextMenuPos, setContextMenuPos] = useState<ContextMenuPosition | null>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const desktopAreaRef = useRef<HTMLDivElement>(null)
  // Marquee-selection rAF throttling: coalesce pointer moves to one update/frame
  // and cache the desktop rect for the drag so we avoid a reflow per move event.
  const selectionRafRef = useRef<number | null>(null)
  const pendingPointRef = useRef<{ x: number; y: number } | null>(null)
  const desktopRectRef = useRef<DOMRect | null>(null)

  // Initialize, load saved icon positions, and adjust dynamically on window resize
  const prevSizeRef = useRef({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const updateLayout = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      prevSizeRef.current = { width, height }
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
          setIconPositions(sanitizeIconPositions(merged, width, height, desktopApps))
          return
        } catch {
          // ignore error and fallback to defaults
        }
      }
      setIconPositions(defaults)
    }

    if (Object.keys(iconPositions).length === 0) {
      updateLayout()
    }

    const handleResize = () => {
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight
      const prevWidth = prevSizeRef.current.width || newWidth
      const deltaX = newWidth - prevWidth

      prevSizeRef.current = { width: newWidth, height: newHeight }

      setIconPositions((prev) => {
        const defaults = computeDefaultPositions(newWidth, newHeight, desktopApps)
        const updated: Record<string, { x: number; y: number }> = {}
        desktopApps.forEach((app) => {
          const pos = prev[app.id] || defaults[app.id]
          let newX = pos.x
          // Keep right-aligned icons anchored to the right edge of the viewport
          if (pos.x > prevWidth * 0.45 && deltaX !== 0) {
            newX = pos.x + deltaX
          }
          const maxX = Math.max(10, newWidth - CELL_WIDTH)
          const maxY = Math.max(TOP_MARGIN, newHeight - CELL_HEIGHT - 60)
          updated[app.id] = {
            x: Math.max(10, Math.min(maxX, newX)),
            y: Math.max(TOP_MARGIN, Math.min(maxY, pos.y)),
          }
        })
        return sanitizeIconPositions(updated, newWidth, newHeight, desktopApps)
      })
    }

    updateLayout()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [computeDefaultPositions, desktopApps])

  const savePositionsToStorage = useCallback((newPos: Record<string, { x: number; y: number }>) => {
    setIconPositions(newPos)
    try {
      localStorage.setItem(ICON_POSITIONS_STORAGE_KEY, JSON.stringify(newPos))
    } catch {
      // ignore storage errors
    }
  }, [])

  // Snap an icon to grid on drag end, avoiding widgets and swapping positions on collision like macOS
  const handleIconDragEnd = useCallback((id: string, rawX: number, rawY: number) => {
    const width = window.innerWidth
    const height = window.innerHeight
    const colFromRight = Math.max(0, Math.round((width - RIGHT_MARGIN - CELL_WIDTH - rawX) / CELL_WIDTH))
    const rowFromTop = Math.max(0, Math.round((rawY - TOP_MARGIN) / CELL_HEIGHT))

    const snappedX = Math.max(10, Math.min(width - CELL_WIDTH, width - RIGHT_MARGIN - CELL_WIDTH - colFromRight * CELL_WIDTH))
    const snappedY = Math.max(TOP_MARGIN, Math.min(height - CELL_HEIGHT - 60, TOP_MARGIN + rowFromTop * CELL_HEIGHT))

    const currentPos = iconPositions[id] || { x: snappedX, y: snappedY }
    const updated = { ...iconPositions }

    // If target cell is occupied by another icon and not inside widget area, swap positions macOS-style
    if (!isOverlappingWidgetsArea(snappedX, snappedY)) {
      const occupantId = Object.keys(iconPositions).find((otherId) => {
        if (otherId === id) return false
        const p = iconPositions[otherId]
        return p && Math.abs(p.x - snappedX) < 40 && Math.abs(p.y - snappedY) < 40
      })

      if (occupantId) {
        updated[occupantId] = currentPos
      }
    }

    updated[id] = { x: snappedX, y: snappedY }

    savePositionsToStorage(sanitizeIconPositions(updated, width, height, desktopApps))
  }, [desktopApps, iconPositions, savePositionsToStorage])

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

    // Preload the first-view assets (lock-screen wallpapers + desktop
    // backgrounds) so they're warm in the browser cache before the user
    // dismisses the loading screen — no loading flashes on the lock screen.
    // Only preload what the current form factor actually renders: the mobile
    // lock-screen wallpaper is never shown on desktop (and vice-versa), so
    // fetching both wastes >1MB per visit. Both desktop-theme backgrounds are
    // kept so toggling theme stays flash-free.
    const isMobileViewport = window.innerWidth < 768
    const CRITICAL_ASSETS = isMobileViewport
      ? [
          "/assets/lock-screen-phone.webp", // mobile lock screen
        ]
      : [
          "/assets/tahoejpg.webp", // desktop lock screen
          "/assets/v-dark-c.webp", // desktop background (light theme)
          "/assets/v-light-c.webp", // desktop background (dark theme)
        ]

    let settled = false
    const markLoaded = () => {
      if (settled) return
      settled = true
      setIsAssetsLoaded(true)
    }

    let remaining = CRITICAL_ASSETS.length
    const images: HTMLImageElement[] = []
    CRITICAL_ASSETS.forEach((src) => {
      const img = new Image()
      const onSettle = () => {
        remaining -= 1
        if (remaining <= 0) markLoaded()
      }
      img.onload = onSettle
      img.onerror = onSettle
      img.src = src
      images.push(img)
    })

    // Safety net: never trap the user if a request stalls.
    const timer = setTimeout(markLoaded, 15000)

    return () => {
      clearTimeout(timer)
      images.forEach((img) => {
        img.onload = null
        img.onerror = null
      })
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    if (!showWelcomeNotification || isLocked || isLoading || isShuttingDown) {
      return
    }

    const timer = setTimeout(() => {
      setWelcomeNotificationExit(isMobile ? "up" : "right")
      setShowWelcomeNotification(false)
    }, WELCOME_TIMEOUT_MS)

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

  const lastActivityRef = useRef(Date.now())

  const updateActivity = useCallback((e?: Event) => {
    const now = Date.now()
    if (now - lastActivityRef.current > 10000) {
      lastActivityRef.current = now
      setLastActivity(now)
    } else {
      lastActivityRef.current = now
    }

    if (isLocked) {
      // Only unlock on deliberate actions, not just moving the mouse
      if (e && (e.type === 'click' || e.type === 'keydown' || e.type === 'touchstart' || e.type === 'mousedown')) {
        setIsLocked(false)
      } else if (!e) {
        // e.g. called directly from handleUnlock
        setIsLocked(false)
      }
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
      if (Date.now() - lastActivityRef.current > 300000) {
        setIsLocked(true)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleUnlock = () => {
    setIsLocked(false)
    const now = Date.now()
    lastActivityRef.current = now
    setLastActivity(now)
  }

  const handleLockScreen = () => {
    setIsLocked(true)
    const now = Date.now()
    lastActivityRef.current = now
    setLastActivity(now)
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
    setMinimizedWindows((prev) => prev.filter((id) => id !== appId))
  }, [])

  const minimizeWindow = useCallback((appId: string) => {
    setMinimizedWindows((prev) => (prev.includes(appId) ? prev : [...prev, appId]))
    setActiveWindow((prevActive) => {
      if (prevActive === appId) {
        const remaining = openWindows.filter((id) => id !== appId && !minimizedWindows.includes(id))
        return remaining.length > 0 ? remaining[remaining.length - 1] : null
      }
      return prevActive
    })
  }, [openWindows, minimizedWindows])

  const activateWindow = useCallback((appId: string) => {
    setActiveWindow(appId)
    setMinimizedWindows((prev) => prev.filter((id) => id !== appId))
  }, [])

  const openOrActivateWindow = useCallback((appId: string, params?: { filter?: string; command?: string }) => {
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
    setMinimizedWindows((prev) => prev.filter((id) => id !== appId))
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

  // Compute the marquee rect + icon intersections once per animation frame.
  // Behaviour is identical to running this on every pointermove — it is simply
  // coalesced to the display refresh rate and skips redundant selection updates.
  const flushSelection = useCallback(() => {
    selectionRafRef.current = null
    const pt = pendingPointRef.current
    const rect = desktopRectRef.current
    const start = dragStartRef.current
    if (!pt || !rect || !start) return

    const currentX = pt.x - rect.left
    const currentY = pt.y - rect.top

    const left = Math.min(start.x, currentX)
    const top = Math.min(start.y, currentY)
    const width = Math.abs(currentX - start.x)
    const height = Math.abs(currentY - start.y)

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
      setSelectedIcons((prev) =>
        prev.length === intersectingIds.length && prev.every((id, i) => id === intersectingIds[i])
          ? prev
          : intersectingIds
      )
    }
  }, [desktopApps, iconPositions])

  // Desktop selection box handlers
  const handleDesktopPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isMobile) return
    if (e.button !== 0) return

    // Ensure click is on the desktop background itself
    const target = e.target as Element
    if (
      !target ||
      target.closest(".window-drag-handle") ||
      target.closest(".react-rnd-window-container") ||
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

    // Cache the desktop rect for the duration of the drag (it doesn't move),
    // so pointermove never forces a layout read.
    desktopRectRef.current = rect
    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top

    dragStartRef.current = { x: startX, y: startY }
    setSelectionRect({ left: startX, top: startY, width: 0, height: 0 })
  }, [isMobile])

  const handleDesktopPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isMobile || !dragStartRef.current) return
    pendingPointRef.current = { x: e.clientX, y: e.clientY }
    if (selectionRafRef.current == null) {
      selectionRafRef.current = requestAnimationFrame(flushSelection)
    }
  }, [isMobile, flushSelection])

  const handleDesktopPointerUp = useCallback(() => {
    if (selectionRafRef.current != null) {
      cancelAnimationFrame(selectionRafRef.current)
      selectionRafRef.current = null
    }
    dragStartRef.current = null
    pendingPointRef.current = null
    setSelectionRect(null)
  }, [])

  const handleDesktopContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return
    e.preventDefault()
    setContextMenuPos({ x: e.clientX, y: e.clientY })
  }, [isMobile])

  const handleIconClick = useCallback((appId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setContextMenuPos(null)

    if (e.shiftKey || e.metaKey) {
      setSelectedIcons((prev) =>
        prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
      )
    } else {
      setSelectedIcons([appId])
    }
  }, [])

  const handleIconDoubleClick = useCallback((appId: string) => {
    openOrActivateWindow(appId)
  }, [openOrActivateWindow])

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

  // Stable Dock app list — only rebuilt when window open-state changes, so the
  // memoized <Dock> doesn't re-render on unrelated desktop state updates
  // (selection, welcome notification, activity, etc.).
  const dockApps = React.useMemo(() => [
    { id: "finder", icon: finderIcon, isOpen: openWindows.includes("finder") },
    { id: "about", icon: profileIcon, isOpen: openWindows.includes("about") },
    { id: "experience", icon: experienceIcon, isOpen: openWindows.includes("experience") },
    { id: "projects", icon: projectsIcon, isOpen: openWindows.includes("projects") },
    { id: "education", icon: educationIcon, isOpen: openWindows.includes("education") },
    { id: "safari", icon: safariIcon, isOpen: openWindows.includes("safari") },
    { id: "terminal", icon: terminalIcon, isOpen: openWindows.includes("terminal") },
    { id: "flappybird", name: "Flappy Bird", icon: flappyBirdIcon, isOpen: openWindows.includes("flappybird"), isPinned: false },
    { id: "tictactoe", name: "Tic Tac Toe", icon: ticTacToeIcon, isOpen: openWindows.includes("tictactoe"), isPinned: false },
    { id: "2048", name: "2048", icon: game2048Icon, isOpen: openWindows.includes("2048"), isPinned: false },
    { id: "messages", name: "Messages", icon: messagesIcon, isOpen: openWindows.includes("messages"), isPinned: false },
    { id: "photos", name: "Photos", icon: photosIcon, isOpen: openWindows.includes("photos"), isPinned: false },
    { id: "achievements", name: "Achievements", icon: achievementsIcon, isOpen: openWindows.includes("achievements"), isPinned: false },
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
  ], [openWindows])

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
        backgroundImage: `url(/assets/${theme === 'dark' ? 'v-light-c.webp' : 'v-dark-c.webp'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      <LockScreen
        key="lockscreen"
        isLocked={isLocked}
        onUnlock={handleUnlock}
      />
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
            className={`relative h-screen w-full pt-14 pb-24 ${isMobile ? 'overflow-y-auto px-0' : 'p-4 overflow-hidden'}`}
            onPointerDown={handleDesktopPointerDown}
            onPointerMove={handleDesktopPointerMove}
            onPointerUp={handleDesktopPointerUp}
            onContextMenu={handleDesktopContextMenu}
            onDragStart={(e) => e.preventDefault()}
          >
            {/* Boundary element keeping app windows below the 36px menu bar */}
            <div id="desktop-window-area" className="absolute top-9 bottom-0 left-0 right-0 pointer-events-none" />

            <Widgets />
            {isMobile ? (
              /* Mobile Grid View (unchanged) */
              <motion.div
                className="grid gap-x-4 gap-y-8 px-6 pt-2 md:gap-4 md:p-4 md:grid-cols-6 grid-cols-4 max-w-md md:max-w-none mx-auto mt-0 md:mt-0 md:pt-0"
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
                    onPreload={() => preloadApp(app.id)}
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
                      onPreload={() => preloadApp(app.id)}
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
                  onMinimize={() => minimizeWindow("finder")}
                  isMinimized={minimizedWindows.includes("finder")}
                  initialPosition={{ x: 80, y: 60 }}
                  initialSize={{ width: 860, height: 560 }}
                >
                  <FinderApp onOpenApp={(id) => openOrActivateWindow(id)} initialTab="documents" />
                </Window>
              )}

              {openWindows.includes("safari") && (
                <Window
                  key="safari"
                  title="Safari"
                  isActive={activeWindow === "safari"}
                  onActivate={() => activateWindow("safari")}
                  onClose={() => toggleWindow("safari")}
                  onMinimize={() => minimizeWindow("safari")}
                  isMinimized={minimizedWindows.includes("safari")}
                  initialPosition={{ x: 120, y: 80 }}
                  initialSize={{ width: 960, height: 680 }}
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
                  onMinimize={() => minimizeWindow("messages")}
                  isMinimized={minimizedWindows.includes("messages")}
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
                  onMinimize={() => minimizeWindow("photos")}
                  isMinimized={minimizedWindows.includes("photos")}
                  initialPosition={{ x: 250, y: 150 }}
                  initialSize={{ width: 750, height: 600 }}
                >
                  <PhotosApp />
                </Window>
              )}

              {openWindows.includes("about") && (
                <Window
                  key="about"
                  title="Contacts - About Me"
                  isActive={activeWindow === "about"}
                  onActivate={() => activateWindow("about")}
                  onClose={() => toggleWindow("about")}
                  onMinimize={() => minimizeWindow("about")}
                  isMinimized={minimizedWindows.includes("about")}
                  initialPosition={{ x: 70, y: 60 }}
                  initialSize={{ width: 840, height: 630 }}
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
                  onMinimize={() => minimizeWindow("projects")}
                  isMinimized={minimizedWindows.includes("projects")}
                  initialPosition={{ x: 80, y: 50 }}
                  initialSize={{ width: 940, height: 640 }}
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
                  onMinimize={() => minimizeWindow("achievements")}
                  isMinimized={minimizedWindows.includes("achievements")}
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
                  onMinimize={() => minimizeWindow("education")}
                  isMinimized={minimizedWindows.includes("education")}
                  initialPosition={{ x: 70, y: 110 }}
                  initialSize={{ width: 960, height: 680 }}
                >
                  <EducationApp />
                </Window>
              )}

              {openWindows.includes("experience") && (
                <Window
                  key="experience"
                  title="Mail — Experiences"
                  isActive={activeWindow === "experience"}
                  onActivate={() => activateWindow("experience")}
                  onClose={() => toggleWindow("experience")}
                  onMinimize={() => minimizeWindow("experience")}
                  isMinimized={minimizedWindows.includes("experience")}
                  initialPosition={{ x: 100, y: 70 }}
                  initialSize={{ width: 1150, height: 680 }}
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
                  onMinimize={() => minimizeWindow("tictactoe")}
                  isMinimized={minimizedWindows.includes("tictactoe")}
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
                  onMinimize={() => minimizeWindow("2048")}
                  isMinimized={minimizedWindows.includes("2048")}
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
                  onMinimize={() => minimizeWindow("flappybird")}
                  isMinimized={minimizedWindows.includes("flappybird")}
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
                  onMinimize={() => minimizeWindow("terminal")}
                  isMinimized={minimizedWindows.includes("terminal")}
                  initialPosition={{ x: 720, y: 80 }}
                  initialSize={{ width: 700, height: 550 }}
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

          </div>

          <Dock
            apps={dockApps}
            onAppClick={openOrActivateWindow}
            onPreload={preloadApp}
          />
        </>
      )}
    </div>
  )
}
