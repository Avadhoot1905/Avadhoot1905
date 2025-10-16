"use client"

import { useState, useEffect, useCallback } from "react"
import { MenuBar } from "@/components/menu-bar"
import { Dock } from "@/components/dock"
import { Window } from "@/components/window"
import { AppIcon } from "@/components/app-icon"
import { LockScreen } from "@/components/lock-screen"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FaFolder, 
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
import { TerminalApp } from "@/components/apps/TerminalApp"
import { Widgets } from "@/components/widgets"

export function MacOSDesktop() {
  const [openWindows, setOpenWindows] = useState<string[]>(["terminal", "about"])
  const [activeWindow, setActiveWindow] = useState<string | null>("about")
  const [mounted, setMounted] = useState(false)
  const [isLocked, setIsLocked] = useState(true) // Start with lock screen
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [projectsFilter, setProjectsFilter] = useState<string>("all")
  const { theme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

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

  const openOrActivateWindow = (appId: string, params?: { filter?: string }) => {
    // Handle projects filter if provided
    if (appId === 'projects' && params?.filter) {
      setProjectsFilter(params.filter)
    }
    
    // If window is already open, just bring it to front
    if (openWindows.includes(appId)) {
      setActiveWindow(appId)
    } else {
      // Otherwise open it and make it active immediately
      // React will batch these updates and render them together
      setOpenWindows((prev) => [...prev, appId])
      setActiveWindow(appId)
    }
  }

  if (!mounted) return null

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
          <MenuBar onLockScreen={handleLockScreen} />

          <div className="relative h-screen w-full overflow-hidden p-4 pt-14 pb-24">
        <motion.div
          className="grid gap-3 p-3 md:gap-4 md:p-4 md:grid-cols-6 grid-cols-4 max-w-md md:max-w-none mx-auto mt-0 md:mt-0 pt-48 md:pt-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          <AppIcon
            id="finder"
            name="Finder"
            icon={<FaFolder className="text-blue-500" />}
            onClick={() => toggleWindow("finder")}
          />
          <AppIcon
            id="safari"
            name="Safari"
            icon={<FaSafari className="text-blue-600" />}
            onClick={() => toggleWindow("safari")}
          />
          <AppIcon
            id="messages"
            name="Messages"
            icon={<FaCommentDots className="text-green-500" />}
            onClick={() => toggleWindow("messages")}
          />
          <AppIcon
            id="photos"
            name="Photos"
            icon={<FaImages className="text-yellow-500" />}
            onClick={() => toggleWindow("photos")}
          />
          <AppIcon
            id="about"
            name="About Me"
            icon={<FaUser className="text-purple-500" />}
            onClick={() => toggleWindow("about")}
          />
          <AppIcon
            id="projects"
            name="Projects"
            icon={<FaCode className="text-green-600" />}
            onClick={() => toggleWindow("projects")}
          />
          <AppIcon
            id="education"
            name="Education"
            icon={<FaGraduationCap className="text-blue-700" />}
            onClick={() => toggleWindow("education")}
          />
          <AppIcon
            id="experience"
            name="Experience"
            icon={<FaBriefcase className="text-gray-700" />}
            onClick={() => toggleWindow("experience")}
          />
          <AppIcon
            id="tictactoe"
            name="Tic Tac Toe"
            icon={<FaGamepad className="text-pink-500" />}
            onClick={() => toggleWindow("tictactoe")}
          />
          <AppIcon
            id="2048"
            name="2048"
            icon={<FaGamepad className="text-amber-500" />}
            onClick={() => toggleWindow("2048")}
          />
          <AppIcon
            id="terminal"
            name="Terminal"
            icon={<FaTerminal className="text-gray-300" />}
            onClick={() => toggleWindow("terminal")}
          />
        </motion.div>

        <AnimatePresence>
          {openWindows.includes("finder") && (
            <Window
              key="finder"
              id="finder"
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
              id="safari"
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
              id="messages"
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
              id="photos"
              title="Photos"
              isActive={activeWindow === "photos"}
              onActivate={() => activateWindow("photos")}
              onClose={() => toggleWindow("photos")}
              initialPosition={{ x: 250, y: 150 }}
              initialSize={{ width: 650, height: 450 }}
            >
              <PhotosApp />
            </Window>
          )}

          {openWindows.includes("about") && (
            <Window
              key="about"
              id="about"
              title="About Me"
              isActive={activeWindow === "about"}
              onActivate={() => activateWindow("about")}
              onClose={() => toggleWindow("about")}
              initialPosition={{ x: 50, y: 80 }}
              initialSize={{ width: 650, height: 550 }}
            >
              <AboutApp />
            </Window>
          )}

          {openWindows.includes("projects") && (
            <Window
              key="projects"
              id="projects"
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

          {openWindows.includes("education") && (
            <Window
              key="education"
              id="education"
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
              id="experience"
              title="Experience"
              isActive={activeWindow === "experience"}
              onActivate={() => activateWindow("experience")}
              onClose={() => toggleWindow("experience")}
              initialPosition={{ x: 220, y: 160 }}
              initialSize={{ width: 700, height: 550 }}
            >
              <ExperienceApp />
            </Window>
          )}

          {openWindows.includes("tictactoe") && (
            <Window
              key="tictactoe"
              id="tictactoe"
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
              id="2048"
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

          {openWindows.includes("terminal") && (
            <Window
              key="terminal"
              id="terminal"
              title="Terminal"
              isActive={activeWindow === "terminal"}
              onActivate={() => activateWindow("terminal")}
              onClose={() => toggleWindow("terminal")}
              initialPosition={{ x: 720, y: 80 }}
              initialSize={{ width: 650, height: 550 }}
            >
              <TerminalApp 
                onClose={() => toggleWindow("terminal")} 
                onOpenApp={openOrActivateWindow}
              />
            </Window>
          )}
        </AnimatePresence>

        {/* Widgets */}
        <Widgets />
      </div>

      <Dock
        apps={[
          { id: "finder", icon: <FaFolder className="text-blue-500" />, isOpen: openWindows.includes("finder") },
          { id: "about", icon: <FaUser className="text-purple-500" />, isOpen: openWindows.includes("about") },
          { id: "experience", icon: <FaBriefcase className="text-gray-700" />, isOpen: openWindows.includes("experience") },
          { id: "projects", icon: <FaCode className="text-green-600" />, isOpen: openWindows.includes("projects") },
          { id: "education", icon: <FaGraduationCap className="text-blue-700" />, isOpen: openWindows.includes("education") },
          { id: "safari", icon: <FaSafari className="text-blue-600" />, isOpen: openWindows.includes("safari") },
          { id: "terminal", icon: <FaTerminal className="text-gray-300" />, isOpen: openWindows.includes("terminal") },
          { id: "gmail", icon: <SiGmail className="text-red-500" />, isOpen: false },
          { id: "github", icon: <SiGithub className="text-gray-800 dark:text-white" />, isOpen: false },
          { id: "linkedin", icon: <SiLinkedin className="text-blue-500" />, isOpen: false },
          { id: "leetcode", icon: <SiLeetcode className="text-orange-500" />, isOpen: false },
          { id: "medium", icon: <SiMedium className="text-gray-800 dark:text-white" />, isOpen: false },
        ]}
        onAppClick={toggleWindow}
      />
        </>
      )}
    </div>
  )
}
