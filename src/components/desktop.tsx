"use client"

import { useState, useEffect, useCallback } from "react"
import { MenuBar } from "@/components/menu-bar"
import { Dock } from "@/components/dock"
import { Window } from "@/components/window"
import { AppIcon } from "@/components/app-icon"
import { LoadingScreen } from "@/components/loading-screen"
import { ShutdownScreen } from "@/components/shutdown-screen"
import { LockScreen } from "@/components/lock-screen"
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

import { PiBirdFill } from "react-icons/pi";

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
const MOBILE_WELCOME_TIMEOUT_MS = 9000

type WelcomeNotificationExit = "right" | "left" | "up" | "pop-open" | "pop-close"

const finderIcon = (
  <img
    src="/assets/macos/finder-svgrepo-com.svg"
    alt="Finder"
    className="h-9 w-9 object-contain"
    draggable={false}
  />
)

export function MacOSDesktop() {
  const [openWindows, setOpenWindows] = useState<string[]>([])
  const [activeWindow, setActiveWindow] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false)
  const [isShuttingDown, setIsShuttingDown] = useState(false)
  const [shutdownAction, setShutdownAction] = useState<'shutdown' | 'restart'>('shutdown')
  const [isLocked, setIsLocked] = useState(true) // Start with lock screen
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [projectsFilter, setProjectsFilter] = useState<string>("all")
  const [terminalCommand, setTerminalCommand] = useState<string | undefined>(undefined)
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(true)
  const [isWelcomeHovered, setIsWelcomeHovered] = useState(false)
  const [welcomeNotificationExit, setWelcomeNotificationExit] = useState<WelcomeNotificationExit>("right")
  const { theme } = useTheme()

  // Prevent hydration mismatch
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

    // Persist as soon as startup flow begins so subsequent reloads skip it.
    localStorage.setItem(LOADING_SEEN_STORAGE_KEY, "1")

    setIsLoading(true)
    setIsAssetsLoaded(false)

    // Mark assets as loaded after animation placeholder completes.
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

  // Reset terminal command after it's been processed
  useEffect(() => {
    if (openWindows.includes("terminal") && terminalCommand) {
      // Reset after a short delay to ensure the command is processed
      const timer = setTimeout(() => {
        setTerminalCommand(undefined)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [terminalCommand, openWindows])

  // Activity tracking
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now())
    if (isLocked) {
      setIsLocked(false)
    }
  }, [isLocked])

  // Inactivity detection
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

  // Auto-lock after 5 minutes of inactivity
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > 300000) { // 300 seconds (5 minutes)
        setIsLocked(true)
      }
    }, 5000) // Check every 5 seconds

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
    if (shutdownAction === 'restart') {
      // For restart, show loading screen again
      setIsShuttingDown(false)
      setIsLoading(true)
      setIsLocked(true)
    } else {
      // For shutdown, you could redirect or show a different screen
      // For now, we'll just restart the loading sequence
      setIsShuttingDown(false)
      setIsLoading(true)
      setIsLocked(true)
    }
  }

  const toggleWindow = (appId: string) => {
    // Handle external links for social media apps
    if (appId === "gmail") {
      window.open("mailto:arcsmo19@gmail.com", "_blank")
      return
    }
    if (appId === "linkedin") {
      window.open("https://www.linkedin.com/in/avadhoot-mahadik-125362295/", "_blank")
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
    
    // Handle regular window toggling
    if (openWindows.includes(appId)) {
      setOpenWindows(openWindows.filter((id) => id !== appId))
      setActiveWindow(openWindows.length > 1 ? openWindows[0] : null)
    } else {
      setOpenWindows([...openWindows, appId])
      setActiveWindow(appId)
    }
  }

  const activateWindow = (appId: string) => {
    setActiveWindow(appId)
  }

  const openOrActivateWindow = useCallback((appId: string, params?: { filter?: string; command?: string }) => {
    console.log('🚀 openOrActivateWindow called!')
    console.log('  appId:', appId)
    console.log('  params:', params)
    
    // Handle projects filter if provided
    if (appId === 'projects' && params?.filter) {
      console.log('  Setting projects filter:', params.filter)
      setProjectsFilter(params.filter)
    }
    
    // Handle terminal command if provided
    if (appId === 'terminal' && params?.command) {
      console.log('  Setting terminal command:', params.command)
      setTerminalCommand(params.command)
    }
    
    // Use functional update to avoid stale closure
    setOpenWindows((prevWindows) => {
      console.log('  prevWindows:', prevWindows)
      
      // If window is already open, just bring it to front
      if (prevWindows.includes(appId)) {
        console.log('  Window already open, activating:', appId)
        setActiveWindow(appId)
        // If terminal command provided and window is already open, update the command
        if (appId === 'terminal' && params?.command) {
          setTerminalCommand(params.command)
        }
        return prevWindows // No change to openWindows
      } else {
        console.log('  Opening new window:', appId)
        setActiveWindow(appId)
        return [...prevWindows, appId]
      }
    })
  }, []) // Remove dependency on openWindows

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
    if (!isMobile) {
      return
    }

    const offsetX = info.offset.x
    const offsetY = info.offset.y
    const absX = Math.abs(offsetX)
    const absY = Math.abs(offsetY)
    const threshold = 80

    if (absX < threshold && offsetY > -threshold) {
      return
    }

    if (absX > absY && absX >= threshold) {
      dismissWelcomeNotification(offsetX > 0 ? "right" : "left")
      return
    }

    if (offsetY <= -threshold) {
      dismissWelcomeNotification("up")
    }
  }, [dismissWelcomeNotification, isMobile])

  const welcomeNotificationExitAnimation = useCallback((direction: WelcomeNotificationExit) => {
    if (direction === "left") {
      return { x: -220, opacity: 0, scale: 0.92, transition: { duration: 0.22 } }
    }

    if (direction === "up") {
      return { y: -160, opacity: 0, scale: 0.94, transition: { duration: 0.22 } }
    }

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

  useEffect(() => {
    console.log('✅ Desktop component mounted')
    console.log('  openOrActivateWindow type:', typeof openOrActivateWindow)
    console.log('  openOrActivateWindow value:', openOrActivateWindow)
  }, [openOrActivateWindow])

  if (!mounted) return null

  // Show loading screen first
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

  // Show shutdown screen
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
      className="h-screen w-full overflow-hidden font-sans transition-colors duration-300 text-white relative"
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
                      className={`absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 shadow-md transition-all duration-200 ${
                        isWelcomeHovered ? "opacity-100" : "pointer-events-none opacity-0"
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
                        className="h-6 w-6 object-contain"
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

          <div className="relative h-screen w-full overflow-hidden p-4 pt-14 pb-24">
        <motion.div
          className="grid gap-3 p-3 md:gap-4 md:p-4 md:grid-cols-6 grid-cols-4 max-w-md md:max-w-none mx-auto mt-0 md:mt-0 pt-48 md:pt-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          <AppIcon
            name="Finder"
            icon={finderIcon}
            onClick={() => toggleWindow("finder")}
          />
          <AppIcon
            name="Safari"
            icon={<FaSafari className="text-blue-600" />}
            onClick={() => toggleWindow("safari")}
          />
          <AppIcon
            name="Messages"
            icon={<FaCommentDots className="text-green-500" />}
            onClick={() => toggleWindow("messages")}
          />
          <AppIcon
            name="Photos"
            icon={<FaImages className="text-yellow-500" />}
            onClick={() => toggleWindow("photos")}
          />
          <AppIcon
            name="About Me"
            icon={<FaUser className="text-purple-500" />}
            onClick={() => toggleWindow("about")}
          />
          <AppIcon
            name="Projects"
            icon={<FaCode className="text-green-600" />}
            onClick={() => toggleWindow("projects")}
          />
          <AppIcon
            name="Achievements"
            icon={<AchievementsAppIcon />}
            onClick={() => toggleWindow("achievements")}
          />
          <AppIcon
            name="Education"
            icon={<FaGraduationCap className="text-blue-700" />}
            onClick={() => toggleWindow("education")}
          />
          <AppIcon
            name="Experience"
            icon={<FaBriefcase className="text-gray-700" />}
            onClick={() => toggleWindow("experience")}
          />
          <AppIcon
            name="Tic Tac Toe"
            icon={<GiTicTacToe className="text-pink-500" />}
            onClick={() => toggleWindow("tictactoe")}
          />
          <AppIcon
            name="2048"
            icon={<FaGamepad className="text-amber-500" />}
            onClick={() => toggleWindow("2048")}
          />
          <AppIcon
            name="Flappy Bird"
            icon={<PiBirdFill className="text-yellow-400" />}
            onClick={() => toggleWindow("flappybird")}
          />
          <AppIcon
            name="Terminal"
            icon={<FaTerminal className="text-gray-300" />}
            onClick={() => toggleWindow("terminal")}
          />
        </motion.div>

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

        {/* Widgets */}
        <Widgets />
      </div>

      <Dock
        apps={[
          { id: "finder", icon: finderIcon, isOpen: openWindows.includes("finder") },
          { id: "about", icon: <FaUser className="text-purple-500" />, isOpen: openWindows.includes("about") },
          { id: "experience", icon: <FaBriefcase className="text-gray-700" />, isOpen: openWindows.includes("experience") },
          { id: "projects", icon: <FaCode className="text-green-600" />, isOpen: openWindows.includes("projects") },
          { id: "education", icon: <FaGraduationCap className="text-blue-700" />, isOpen: openWindows.includes("education") },
          { id: "safari", icon: <FaSafari className="text-blue-600" />, isOpen: openWindows.includes("safari") },
          { id: "terminal", icon: <FaTerminal className="text-gray-300" />, isOpen: openWindows.includes("terminal") },
          { id: "gmail", icon: <SiGmail className="text-red-500" />, isOpen: false },
          { id: "github", icon: <SiGithub className={theme === "dark" ? "text-white" : "text-gray-800"} />, isOpen: false },
          { id: "linkedin", icon: <SiLinkedin className="text-blue-500" />, isOpen: false },
          { id: "leetcode", icon: <SiLeetcode className="text-orange-500" />, isOpen: false },
          { id: "medium", icon: <SiMedium className={theme === "dark" ? "text-white" : "text-gray-800"} />, isOpen: false },
        ]}
        onAppClick={toggleWindow}
      />
        </>
      )}
    </div>
  )
}
