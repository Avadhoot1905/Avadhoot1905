"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Monitor, Wifi, BatteryCharging, Volume2, Lightbulb, Signal, Bluetooth, Lock, RotateCcw, Flashlight, Plane, Maximize, Minimize } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { SiApple } from "react-icons/si"

interface MenuBarProps {
  onLockScreen?: () => void
  onShutdown?: () => void
  onRestart?: () => void
  activeApp?: string | null
}

const ControlCenterIcon = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-black dark:text-white ${className}`}
    >
      <rect
        x="2"
        y="5"
        width="20"
        height="6"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="5" cy="8" r="1.5" fill="currentColor" />

      <rect
        x="2"
        y="13"
        width="20"
        height="6"
        rx="3"
        fill="currentColor"
      />
      <circle
        cx="19"
        cy="16"
        r="1.5"
        className="fill-white dark:fill-neutral-950"
      />
    </svg>
  )
}

export function MenuBar({ onLockScreen, onShutdown, onRestart, activeApp }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [brightness, setBrightness] = useState(70)
  const [volume, setVolume] = useState(60)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { theme, setTheme } = useTheme()

  // Map app IDs to display names
  const appNames: Record<string, string> = {
    finder: "Finder",
    safari: "Safari",
    messages: "Messages",
    photos: "Photos",
    about: "About Me",
    projects: "Projects",
    education: "Education",
    experience: "Experience",
    tictactoe: "Tic Tac Toe",
    "2048": "2048",
    terminal: "Terminal"
  }

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Check fullscreen state
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      clearInterval(timer)
      window.removeEventListener('resize', checkMobile)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const toggleMenu = (menu: string) => {
    if (activeMenu === menu) {
      setActiveMenu(null)
    } else {
      setActiveMenu(menu)
    }
  }

  if (!mounted) return null

  // Mobile Notification Panel
  if (isMobile) {
    const handleDragEnd = (_event: unknown, info: { offset: { y: number } }) => {
      // If dragged up more than 100px, close the panel
      if (info.offset.y < -100) {
        setShowNotificationPanel(false)
      }
    }

    return (
      <>
        {/* iOS Status Bar - Fixed position, non-draggable */}
        <motion.div
          className={`flex h-12 w-full items-center px-4 backdrop-blur-xl fixed top-0 left-0 z-[10000] ${
            theme === "dark" 
              ? "bg-black/30 text-white" 
              : "bg-white/30 text-black"
          }`}
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Time */}
          <div className="text-sm font-semibold">
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          
          <div className="flex-1"></div>
          
          {/* Status Icons */}
          <div className="flex items-center space-x-2">
            <Wifi className="h-4 w-4" />
            <BatteryCharging className="h-4 w-4" />
          </div>
        </motion.div>

        {/* Invisible draggable overlay for pull-down gesture */}
        <motion.div
          className="fixed top-0 left-0 w-full h-12 z-[10001]"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 1 }}
          onDragEnd={(_event, info) => {
            // If dragged down more than 50px, open the panel
            if (info.offset.y > 50) {
              setShowNotificationPanel(true)
            }
          }}
          style={{ cursor: 'grab' }}
        />

        {/* Notification Panel Shade - Draggable to slide up/down */}
        <AnimatePresence>
          {showNotificationPanel && (
            <>
              {/* Backdrop - click to close */}
              <motion.div
                className="fixed inset-0 z-[9998] bg-black/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowNotificationPanel(false)}
              />
              
              {/* Draggable Panel */}
              <motion.div
                className={`fixed top-0 left-0 right-0 z-[9999] backdrop-blur-2xl shadow-2xl ${
                  theme === "dark" 
                    ? "bg-black/40 text-white" 
                    : "bg-white/40 text-black"
                }`}
                style={{
                  backdropFilter: 'blur(40px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                  borderBottomLeftRadius: '24px',
                  borderBottomRightRadius: '24px',
                }}
                initial={{ y: '-100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.5, bottom: 0 }}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                onClick={(e) => e.stopPropagation()}
              >
              <div className="p-6 pt-16 pb-6">
                {/* Date */}
                <div className="text-center mb-6">
                  <div className="text-2xl font-semibold mb-1">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                  <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </div>
                </div>

                {/* Main Control Section */}
                <div className="flex flex-col gap-3 mb-4">
                  {/* Icon Grid - 1x4 Top, 1x4 Bottom */}
                  <div className="flex flex-col gap-3">
                    {/* Top 4 icons - Single Horizontal Row */}
                    <div className="grid grid-cols-4 gap-3 max-w-[300px] mx-auto">
                      {/* Airplane Mode */}
                      <button
                        className={`w-[70px] h-[70px] rounded-3xl flex flex-col items-center justify-center backdrop-blur-xl transition-all active:scale-95 ${
                          theme === "dark" 
                            ? "bg-white/10 hover:bg-white/15" 
                            : "bg-black/10 hover:bg-black/15"
                        }`}
                        style={{
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Plane className="h-5 w-5 mb-1" />
                        <span className="text-[9px] font-medium">Airplane</span>
                      </button>

                      {/* Mobile Data */}
                      <button
                        className={`w-[70px] h-[70px] rounded-3xl flex flex-col items-center justify-center backdrop-blur-xl transition-all active:scale-95 ${
                          theme === "dark" 
                            ? "bg-blue-500/30 hover:bg-blue-500/40" 
                            : "bg-blue-500/30 hover:bg-blue-500/40"
                        }`}
                        style={{
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Signal className="h-5 w-5 mb-1" />
                        <span className="text-[9px] font-medium">Cellular</span>
                      </button>

                      {/* WiFi */}
                      <button
                        className={`w-[70px] h-[70px] rounded-3xl flex flex-col items-center justify-center backdrop-blur-xl transition-all active:scale-95 ${
                          theme === "dark" 
                            ? "bg-blue-500/30 hover:bg-blue-500/40" 
                            : "bg-blue-500/30 hover:bg-blue-500/40"
                        }`}
                        style={{
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Wifi className="h-5 w-5 mb-1" />
                        <span className="text-[9px] font-medium">Wi-Fi</span>
                      </button>

                      {/* Bluetooth */}
                      <button
                        className={`w-[70px] h-[70px] rounded-3xl flex flex-col items-center justify-center backdrop-blur-xl transition-all active:scale-95 ${
                          theme === "dark" 
                            ? "bg-blue-500/30 hover:bg-blue-500/40" 
                            : "bg-blue-500/30 hover:bg-blue-500/40"
                        }`}
                        style={{
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Bluetooth className="h-5 w-5 mb-1" />
                        <span className="text-[9px] font-medium">Bluetooth</span>
                      </button>
                    </div>

                    {/* Bottom 4 icons - Single Row */}
                    <div className="grid grid-cols-4 gap-3 max-w-[300px] mx-auto">
                      {/* Lock Orientation - Active (Blue) */}
                      <button
                        className={`w-[70px] h-[70px] rounded-3xl flex flex-col items-center justify-center backdrop-blur-xl transition-all active:scale-95 ${
                          theme === "dark" 
                            ? "bg-blue-500/30 hover:bg-blue-500/40" 
                            : "bg-blue-500/30 hover:bg-blue-500/40"
                        }`}
                        style={{
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RotateCcw className="h-5 w-5 mb-1" />
                        <span className="text-[9px] font-medium">Rotation</span>
                      </button>

                      {/* Flashlight */}
                      <button
                        className={`w-[70px] h-[70px] rounded-3xl flex flex-col items-center justify-center backdrop-blur-xl transition-all active:scale-95 ${
                          theme === "dark" 
                            ? "bg-white/10 hover:bg-white/15" 
                            : "bg-black/10 hover:bg-black/15"
                        }`}
                        style={{
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Flashlight className="h-5 w-5 mb-1" />
                        <span className="text-[9px] font-medium">Torch</span>
                      </button>

                      {/* Theme Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setTheme(theme === 'dark' ? 'light' : 'dark')
                        }}
                        className={`w-[70px] h-[70px] rounded-3xl flex flex-col items-center justify-center backdrop-blur-xl transition-all active:scale-95 ${
                          theme === "dark" 
                            ? "bg-white/10 hover:bg-white/15" 
                            : "bg-black/10 hover:bg-black/15"
                        }`}
                        style={{
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        }}
                      >
                        {theme === "dark" ? <Moon className="h-5 w-5 mb-1" /> : <Sun className="h-5 w-5 mb-1" />}
                        <span className="text-[9px] font-medium">
                          {theme === "dark" ? "Dark" : theme === "light" ? "Light" : "Auto"}
                        </span>
                      </button>

                      {/* Screen Lock */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onLockScreen?.()
                          setShowNotificationPanel(false)
                        }}
                        className={`w-[70px] h-[70px] rounded-3xl flex flex-col items-center justify-center backdrop-blur-xl transition-all active:scale-95 ${
                          theme === "dark" 
                            ? "bg-white/10 hover:bg-white/15" 
                            : "bg-black/10 hover:bg-black/15"
                        }`}
                        style={{
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        }}
                      >
                        <Lock className="h-5 w-5 mb-1" />
                        <span className="text-[9px] font-medium">Lock</span>
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Sliders */}
                  <div className="flex flex-col gap-3 max-w-[300px] mx-auto w-full">
                    {/* Brightness Slider - Horizontal */}
                    <div 
                      className={`rounded-3xl backdrop-blur-xl p-4 flex items-center cursor-pointer ${
                        theme === "dark" 
                          ? "bg-white/10" 
                          : "bg-black/10"
                      }`}
                      style={{
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        const rect = e.currentTarget.getBoundingClientRect()
                        const iconWidth = 20 + 12 // icon + margin
                        const padding = 16
                        const x = e.clientX - rect.left - padding - iconWidth
                        const width = rect.width - (2 * padding) - (2 * iconWidth)
                        const percentage = Math.max(0, Math.min(100, (x / width) * 100))
                        setBrightness(Math.round(percentage))
                      }}
                    >
                      <Lightbulb className="h-5 w-5 flex-shrink-0 mr-3" />
                      <div className={`flex-1 h-3 rounded-full overflow-hidden relative ${
                        theme === "dark" ? "bg-white/10" : "bg-black/10"
                      }`}>
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all" 
                          style={{ width: `${brightness}%` }} 
                        />
                      </div>
                      <Lightbulb className="h-5 w-5 flex-shrink-0 ml-3" />
                    </div>

                    {/* Volume Slider - Horizontal */}
                    <div 
                      className={`rounded-3xl backdrop-blur-xl p-4 flex items-center cursor-pointer ${
                        theme === "dark" 
                          ? "bg-white/10" 
                          : "bg-black/10"
                      }`}
                      style={{
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        const rect = e.currentTarget.getBoundingClientRect()
                        const iconWidth = 20 + 12 // icon + margin
                        const padding = 16
                        const x = e.clientX - rect.left - padding - iconWidth
                        const width = rect.width - (2 * padding) - (2 * iconWidth)
                        const percentage = Math.max(0, Math.min(100, (x / width) * 100))
                        setVolume(Math.round(percentage))
                      }}
                    >
                      <Volume2 className="h-5 w-5 flex-shrink-0 mr-3" />
                      <div className={`flex-1 h-3 rounded-full overflow-hidden relative ${
                        theme === "dark" ? "bg-white/10" : "bg-black/10"
                      }`}>
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all" 
                          style={{ width: `${volume}%` }} 
                        />
                      </div>
                      <Volume2 className="h-5 w-5 flex-shrink-0 ml-3" />
                    </div>
                  </div>
                </div>

                {/* Drag Handle at Bottom */}
                <div className="flex justify-center pt-4 pb-2">
                  <div className={`w-10 h-1 rounded-full ${
                    theme === "dark" ? "bg-white/30" : "bg-black/30"
                  }`} />
                </div>
              </div>
            </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Desktop Menu Bar
  const menuTriggerClass = `flex items-center rounded-md px-2 py-0.5 text-sm font-medium leading-none tracking-tight transition-all duration-200 ease-out ${
    theme === "dark"
      ? "hover:bg-white/10"
      : "hover:bg-white/20"
  }`

  const iconTriggerClass = `flex items-center justify-center rounded-md p-1 opacity-80 transition-all duration-200 ease-out hover:opacity-100 ${
    theme === "dark"
      ? "hover:bg-white/15"
      : "hover:bg-black/10"
  }`

  const dropdownClass = `absolute top-full z-[99999] mt-1 w-56 rounded-xl border py-1 text-sm shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-2xl ${
    theme === "dark"
      ? "border-white/10 bg-black/50 text-white"
      : "border-black/10 bg-white/70 text-black"
  }`

  const dropdownItemClass = "w-full rounded-md px-3 py-1.5 text-left leading-none tracking-tight transition-all duration-200 ease-out hover:bg-blue-500 hover:text-white"
  const dropdownDividerClass = `my-1 border-t ${theme === "dark" ? "border-white/10" : "border-black/5"}`
  const desktopDateParts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
  }).formatToParts(currentTime)
  const desktopWeekday = desktopDateParts.find((part) => part.type === "weekday")?.value ?? ""
  const desktopDay = desktopDateParts.find((part) => part.type === "day")?.value ?? ""
  const desktopMonth = desktopDateParts.find((part) => part.type === "month")?.value ?? ""
  const desktopDate = `${desktopWeekday} ${desktopDay} ${desktopMonth}`.trim()
  const desktopTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <motion.div
      className={`fixed left-0 top-0 z-[10000] flex h-8 w-full items-center px-3 text-sm backdrop-blur-2xl ${
        theme === "dark" 
          ? "bg-black/40 text-white"
          : "bg-white/60 text-black"
      }`}
      style={{
        backdropFilter: 'blur(20px) saturate(190%)',
        WebkitBackdropFilter: 'blur(20px) saturate(190%)',
        boxShadow: theme === "dark"
          ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 1px 10px rgba(0,0,0,0.18)'
          : 'inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 10px rgba(0,0,0,0.08)',
        transition: 'background-color 0.2s ease-out, color 0.2s ease-out, box-shadow 0.2s ease-out'
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          theme === "dark"
            ? "bg-gradient-to-b from-white/10 to-transparent"
            : "bg-gradient-to-b from-white/20 to-transparent"
        }`}
      />

      <div className="relative z-10 flex min-w-0 items-center gap-3 leading-none">
        <div className="relative">
          <button
            onClick={() => toggleMenu("apple")}
            className="flex items-center justify-center p-1 text-base opacity-90 transition-all duration-200 ease-out hover:opacity-100"
          >
            <SiApple className="h-3.5 w-3.5" />
          </button>
          <AnimatePresence>
            {activeMenu === "apple" && (
              <motion.div
                className={`left-0 ${dropdownClass}`}
                style={{
                  position: 'absolute',
                  zIndex: 99999,
                  backdropFilter: 'blur(24px) saturate(190%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(190%)'
                }}
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="px-1 py-0.5">
                  <div className={dropdownItemClass}>About This Mac</div>
                  <div className={dropdownItemClass}>System Preferences...</div>
                  <div className={dropdownItemClass}>App Store...</div>
                  <div className={dropdownDividerClass}></div>
                  <button
                    onClick={() => {
                      setActiveMenu(null)
                      onLockScreen?.()
                    }}
                    className={dropdownItemClass}
                  >
                    Sleep
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null)
                      onRestart?.()
                    }}
                    className={dropdownItemClass}
                  >
                    Restart...
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null)
                      onShutdown?.()
                    }}
                    className={dropdownItemClass}
                  >
                    Shut Down...
                  </button>
                  <div className={dropdownDividerClass}></div>
                  <button
                    onClick={() => {
                      setActiveMenu(null)
                      onLockScreen?.()
                    }}
                    className={dropdownItemClass}
                  >
                    Lock Screen
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null)
                      onLockScreen?.()
                    }}
                    className={dropdownItemClass}
                  >
                    Log Out...
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-sm font-semibold leading-none tracking-tight">
          {activeApp && appNames[activeApp] ? appNames[activeApp] : "Finder"}
        </div>

        <div className="relative">
          <button onClick={() => toggleMenu("file")} className={menuTriggerClass}>
            File
          </button>
          <AnimatePresence>
            {activeMenu === "file" && (
              <motion.div
                className={`left-0 ${dropdownClass}`}
                style={{
                  position: 'absolute',
                  zIndex: 99999,
                  backdropFilter: 'blur(24px) saturate(190%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(190%)'
                }}
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="px-1 py-0.5">
                  <div className={dropdownItemClass}>New Window</div>
                  <div className={dropdownItemClass}>New Tab</div>
                  <div className={dropdownItemClass}>Open...</div>
                  <div className={dropdownItemClass}>Close</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button onClick={() => toggleMenu("edit")} className={menuTriggerClass}>
            Edit
          </button>
          <AnimatePresence>
            {activeMenu === "edit" && (
              <motion.div
                className={`left-0 ${dropdownClass}`}
                style={{
                  position: 'absolute',
                  zIndex: 99999,
                  backdropFilter: 'blur(24px) saturate(190%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(190%)'
                }}
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="px-1 py-0.5">
                  <div className={dropdownItemClass}>Undo</div>
                  <div className={dropdownItemClass}>Redo</div>
                  <div className={dropdownDividerClass}></div>
                  <div className={dropdownItemClass}>Cut</div>
                  <div className={dropdownItemClass}>Copy</div>
                  <div className={dropdownItemClass}>Paste</div>
                  <div className={dropdownItemClass}>Select All</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button onClick={() => toggleMenu("view")} className={menuTriggerClass}>
            View
          </button>
          <AnimatePresence>
            {activeMenu === "view" && (
              <motion.div
                className={`left-0 ${dropdownClass}`}
                style={{
                  position: 'absolute',
                  zIndex: 99999,
                  backdropFilter: 'blur(24px) saturate(190%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(190%)'
                }}
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="px-1 py-0.5">
                  <div className={dropdownItemClass}>as Icons</div>
                  <div className={dropdownItemClass}>as List</div>
                  <div className={dropdownItemClass}>as Columns</div>
                  <div className={dropdownItemClass}>as Gallery</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="relative z-10 flex items-center gap-2.5 leading-none">
        <button
          onClick={toggleFullscreen}
          className={iconTriggerClass}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize className="h-3.5 w-3.5" />
          ) : (
            <Maximize className="h-3.5 w-3.5" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => toggleMenu("theme")}
            className={iconTriggerClass}
            title="Theme"
          >
            {theme === "dark" ? (
              <Moon className="h-3.5 w-3.5" />
            ) : theme === "light" ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Monitor className="h-3.5 w-3.5" />
            )}
          </button>
          <AnimatePresence>
            {activeMenu === "theme" && (
              <motion.div
                className={`right-0 w-36 ${dropdownClass}`}
                style={{
                  position: 'absolute',
                  zIndex: 99999,
                  backdropFilter: 'blur(24px) saturate(190%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(190%)'
                }}
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="px-1 py-0.5">
                  <button
                    className={`${dropdownItemClass} flex items-center gap-2 ${theme === "light" ? "bg-blue-500 text-white" : ""}`}
                    onClick={() => {
                      setTheme("light")
                      setActiveMenu(null)
                    }}
                  >
                    <Sun className="h-3.5 w-3.5" /> Light
                  </button>
                  <button
                    className={`${dropdownItemClass} flex items-center gap-2 ${theme === "dark" ? "bg-blue-500 text-white" : ""}`}
                    onClick={() => {
                      setTheme("dark")
                      setActiveMenu(null)
                    }}
                  >
                    <Moon className="h-3.5 w-3.5" /> Dark
                  </button>
                  <button
                    className={`${dropdownItemClass} flex items-center gap-2 ${theme === "system" ? "bg-blue-500 text-white" : ""}`}
                    onClick={() => {
                      setTheme("system")
                      setActiveMenu(null)
                    }}
                  >
                    <Monitor className="h-3.5 w-3.5" /> System
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={iconTriggerClass} title="Wi-Fi">
          <Wifi className="h-3.5 w-3.5" />
        </div>

        <div className={iconTriggerClass} title="Battery">
          <BatteryCharging className="h-3.5 w-3.5" />
        </div>

        <div className={iconTriggerClass} title="Volume">
          <Volume2 className="h-3.5 w-3.5" />
        </div>

        <div className={iconTriggerClass} title="Control Center">
          <ControlCenterIcon className="h-3.5 w-3.5" />
        </div>

        <div className={`px-2 py-0.5 text-sm font-medium leading-none tracking-tight ${theme === "dark" ? "text-white/85" : "text-black/75"}`}>
          {desktopDate}
        </div>

        <div className={`px-2 py-0.5 text-sm font-medium leading-none tracking-tight ${theme === "dark" ? "text-white/90" : "text-black/85"}`}>
          {desktopTime}
        </div>
      </div>
    </motion.div>
  )
}
