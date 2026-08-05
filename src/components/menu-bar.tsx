"use client"

import { useState, useEffect, type ReactNode } from "react"
import { SpeakerHigh, Lightbulb, CellSignalHigh, Lock, ArrowsCounterClockwise, Flashlight, Airplane, ArrowsOutSimple, ArrowsInSimple, IconContext, Bell, Moon, Play, FastForward, Rewind, Camera } from "phosphor-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { SiApple } from "react-icons/si"

interface MenuBarProps {
  onLockScreen?: () => void
  onShutdown?: () => void
  onRestart?: () => void
  activeApp?: string | null
}

/**
 * Self-contained clock leaf. Holds its own 1s interval so only the time/date
 * text re-renders each second — the surrounding MenuBar (and its many
 * backdrop-filter layers) is never re-reconciled by the tick.
 */
function Clock({ children }: { children: (now: Date) => ReactNode }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return <>{children(now)}</>
}

export function MenuBar({ onLockScreen, onShutdown, onRestart, activeApp }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [brightness, setBrightness] = useState(70)
  const [volume, setVolume] = useState(60)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // iOS Control Center States
  const [airplaneMode, setAirplaneMode] = useState(false)
  const [cellular, setCellular] = useState(true)
  const [wifi, setWifi] = useState(true)
  const [bluetooth, setBluetooth] = useState(true)
  const [rotationLock, setRotationLock] = useState(false)
  const [silentMode, setSilentMode] = useState(false)
  const [flashlight, setFlashlight] = useState(false)

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
      <IconContext.Provider value={{ weight: "fill" }}>
        <>
          {/* iOS Status Bar - Fixed position, non-draggable */}
          <motion.div
            className={`flex h-12 w-full items-center px-4 backdrop-blur-xl fixed top-0 left-0 z-[10000] ${theme === "dark"
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
              <Clock>{(now) => now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Clock>
            </div>

            <div className="flex-1"></div>

            {/* Status Icons */}
            <div className="flex items-center space-x-3.5">
              <img
                src={theme === "dark" ? "/assets/macos/icons8-bluetooth-100.svg" : "/assets/macos/bluetooth-svgrepo-com.svg"}
                alt="Bluetooth"
                className={theme === "dark" ? "h-[18px] w-[18px]" : "h-[14px] w-[14px]"}
              />
              <img
                src={theme === "dark" ? "/assets/macos/icons8-wi-fi-100-white.svg" : "/assets/macos/icons8-wi-fi-100.svg"}
                alt="Wi-Fi"
                className="h-[20px] w-[20px]"
              />
              <img
                src={theme === "dark" ? "/assets/macos/icons8-personal-hotspot-100-white.svg" : "/assets/macos/icons8-personal-hotspot-100.svg"}
                alt="Personal Hotspot"
                className="h-[20px] w-[20px]"
              />
              <img
                src={theme === "dark" ? "/assets/macos/icons8-full-battery-100-white.svg" : "/assets/macos/icons8-full-battery-100.svg"}
                alt="Battery"
                className="h-[28px] w-[28px]"
              />
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
                  className={`fixed inset-0 z-[9999] shadow-2xl ${theme === "dark"
                    ? "bg-black/50 text-white"
                    : "bg-black/30 text-white"
                    }`}
                  style={{
                    backdropFilter: 'blur(40px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(150%)',
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
                  <div className="p-6 pt-[60px] pb-10 h-full flex flex-col justify-start">
                    
                    {/* Control Center Grid */}
                    <div className="w-full max-w-[360px] mx-auto flex flex-col gap-[14px]">
                      {/* Row 1 & 2 */}
                      <div className="flex gap-[14px] h-[150px] sm:h-[160px]">
                        {/* Connectivity */}
                        <div className={`w-1/2 h-full rounded-[2rem] p-[14px] grid grid-cols-2 gap-[14px] ${theme === "dark" ? "bg-white/10" : "bg-white/30"}`}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setAirplaneMode(!airplaneMode) }}
                            className={`w-full h-full rounded-full flex items-center justify-center transition-colors ${airplaneMode ? 'bg-orange-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-white/50')}`}
                          >
                            <Airplane weight="fill" size={24} className="text-white" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setCellular(!cellular) }}
                            className={`w-full h-full rounded-full flex items-center justify-center transition-colors ${cellular ? 'bg-green-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-white/50')}`}
                          >
                            <CellSignalHigh weight="fill" size={22} className="text-white" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setWifi(!wifi) }}
                            className={`w-full h-full rounded-full flex items-center justify-center transition-colors ${wifi ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-white/50')}`}
                          >
                            <img src="/assets/macos/icons8-wi-fi-100-white.svg" className="w-[22px] h-[22px]" alt="Wi-Fi" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setBluetooth(!bluetooth) }}
                            className={`w-full h-full rounded-full flex items-center justify-center transition-colors ${bluetooth ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-white/50')}`}
                          >
                            <img src="/assets/macos/icons8-bluetooth-100.svg" className="w-[20px] h-[20px]" alt="Bluetooth" />
                          </button>
                        </div>
                        
                        {/* Media Player */}
                        <div className={`w-1/2 h-full rounded-[2rem] p-4 flex flex-col justify-between relative ${theme === "dark" ? "bg-white/10" : "bg-white/30"}`}>
                          <div className="flex justify-between items-start w-full">
                            <div className="text-white/70 text-[13px] font-medium tracking-wide">Not Playing</div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-white/20" : "bg-white/50"}`}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2L22 20H2L12 2Z"/></svg>
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-5 mt-2">
                            <Rewind weight="fill" size={24} className="text-white/50 hover:text-white transition-colors" />
                            <Play weight="fill" size={32} className="text-white" />
                            <FastForward weight="fill" size={24} className="text-white/50 hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Row 3 & 4 */}
                      <div className="flex gap-[14px] h-[150px] sm:h-[160px]">
                        {/* Left Column (Rotation + Focus) */}
                        <div className="w-1/2 h-full flex flex-col gap-[14px]">
                          <div className="flex gap-[14px] h-[calc(50%-7px)]">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setRotationLock(!rotationLock) }}
                              className={`w-1/2 h-full rounded-[1.5rem] flex items-center justify-center transition-colors ${rotationLock ? 'bg-white text-red-500' : `${theme === "dark" ? "bg-white/10" : "bg-white/30"} text-white`}`}
                            >
                              <ArrowsCounterClockwise weight="bold" size={24} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSilentMode(!silentMode) }}
                              className={`w-1/2 h-full rounded-[1.5rem] flex items-center justify-center transition-colors ${silentMode ? 'bg-white text-red-500' : `${theme === "dark" ? "bg-white/10" : "bg-white/30"} text-white`}`}
                            >
                              <Bell weight="fill" size={24} />
                            </button>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onLockScreen?.() }}
                            className={`w-full h-[calc(50%-7px)] rounded-[1.5rem] flex items-center px-4 gap-3 ${theme === "dark" ? "bg-white/10" : "bg-white/30"}`}
                          >
                            <div className="w-[30px] h-[30px] rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                              <Moon weight="fill" size={18} className="text-white" />
                            </div>
                            <span className="text-white font-medium text-[15px]">Focus</span>
                          </button>
                        </div>
                        
                        {/* Right Column (Sliders) */}
                        <div 
                          className={`w-1/4 h-full rounded-[2rem] relative overflow-hidden flex flex-col justify-end cursor-pointer touch-none ${theme === "dark" ? "bg-white/10" : "bg-white/30"}`}
                          onPointerDownCapture={(e) => {
                            e.stopPropagation();
                            const target = e.currentTarget;
                            target.setPointerCapture(e.pointerId);
                            const rect = target.getBoundingClientRect();
                            const update = (clientY: number) => {
                              const y = rect.bottom - clientY;
                              const percentage = Math.max(0, Math.min(100, (y / rect.height) * 100));
                              setBrightness(Math.round(percentage));
                            };
                            update(e.clientY);
                            const handleMove = (ev: PointerEvent) => update(ev.clientY);
                            const handleUp = (ev: PointerEvent) => {
                              target.removeEventListener('pointermove', handleMove);
                              target.removeEventListener('pointerup', handleUp);
                              target.releasePointerCapture(ev.pointerId);
                            };
                            target.addEventListener('pointermove', handleMove);
                            target.addEventListener('pointerup', handleUp);
                          }}
                        >
                          <div className="bg-white w-full transition-all duration-75" style={{ height: `${brightness}%` }} />
                          <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none">
                            <Lightbulb weight="fill" size={24} className={brightness > 20 ? "text-gray-500" : "text-white"} />
                          </div>
                        </div>
                        
                        <div 
                          className={`w-1/4 h-full rounded-[2rem] relative overflow-hidden flex flex-col justify-end cursor-pointer touch-none ${theme === "dark" ? "bg-white/10" : "bg-white/30"}`}
                          onPointerDownCapture={(e) => {
                            e.stopPropagation();
                            const target = e.currentTarget;
                            target.setPointerCapture(e.pointerId);
                            const rect = target.getBoundingClientRect();
                            const update = (clientY: number) => {
                              const y = rect.bottom - clientY;
                              const percentage = Math.max(0, Math.min(100, (y / rect.height) * 100));
                              setVolume(Math.round(percentage));
                            };
                            update(e.clientY);
                            const handleMove = (ev: PointerEvent) => update(ev.clientY);
                            const handleUp = (ev: PointerEvent) => {
                              target.removeEventListener('pointermove', handleMove);
                              target.removeEventListener('pointerup', handleUp);
                              target.releasePointerCapture(ev.pointerId);
                            };
                            target.addEventListener('pointermove', handleMove);
                            target.addEventListener('pointerup', handleUp);
                          }}
                        >
                          <div className="bg-white w-full transition-all duration-75" style={{ height: `${volume}%` }} />
                          <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none">
                            <SpeakerHigh weight="fill" size={24} className={volume > 20 ? "text-gray-500" : "text-white"} />
                          </div>
                        </div>
                      </div>

                      {/* Row 5 */}
                      <div className="flex gap-[14px] h-[72px] sm:h-[76px]">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setFlashlight(!flashlight) }}
                          className={`flex-1 rounded-[1.5rem] flex items-center justify-center transition-colors ${flashlight ? 'bg-white text-black' : `${theme === "dark" ? "bg-white/10" : "bg-white/30"} text-white`}`}
                        >
                          <Flashlight weight="fill" size={24} />
                        </button>
                        <button className={`flex-1 rounded-[1.5rem] flex items-center justify-center text-white ${theme === "dark" ? "bg-white/10" : "bg-white/30"}`}>
                          <div className="relative w-[22px] h-[22px]">
                            <div className="absolute top-0 right-0 w-[15px] h-[15px] border-2 border-white rounded-[3px]" />
                            <div className="absolute bottom-0 left-0 w-[15px] h-[15px] border-2 border-white rounded-[3px] bg-black/40 backdrop-blur-md" />
                          </div>
                        </button>
                        <button className={`flex-1 rounded-[1.5rem] flex items-center justify-center text-white ${theme === "dark" ? "bg-white/10" : "bg-white/30"}`}>
                          <Camera weight="fill" size={24} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setTheme(theme === 'dark' ? 'light' : 'dark') }}
                          className={`flex-1 rounded-[1.5rem] flex items-center justify-center transition-colors ${theme === "dark" ? "bg-white text-black" : "bg-white/30 text-white"}`}
                        >
                          <img
                            src={theme === "dark" ? "/assets/macos/dark-mode-svgrepo-com.svg" : "/assets/macos/dark-mode-svgrepo-com-white.svg"}
                            alt="Theme"
                            className="h-6 w-6"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      </IconContext.Provider>
    )
  }

  // Desktop Menu Bar
  const menuTriggerClass = `flex items-center rounded-md px-2.5 py-1 text-sm font-medium leading-none transition-all duration-200 ease-out ${theme === "dark"
    ? "hover:bg-white/10"
    : "hover:bg-white/20"
    }`

  const iconTriggerClass = `flex h-6 w-6 items-center justify-center rounded-md p-1 opacity-80 transition-all duration-200 ease-out hover:opacity-100 ${theme === "dark"
    ? "hover:bg-white/15"
    : "hover:bg-black/10"
    }`

  const dropdownClass = `absolute top-full z-[99999] mt-1 w-56 rounded-xl border py-1 text-sm shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-2xl ${theme === "dark"
    ? "border-white/10 bg-black/50 text-white"
    : "border-black/10 bg-white/70 text-black"
    }`

  const dropdownItemClass = "w-full rounded-md px-3 py-1.5 text-left leading-none tracking-tight transition-all duration-200 ease-out hover:bg-blue-500 hover:text-white"
  const dropdownDividerClass = `my-1 border-t ${theme === "dark" ? "border-white/10" : "border-black/5"}`
  const formatDesktopDate = (now: Date) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "numeric",
      month: "long",
    }).formatToParts(now)
    const weekday = parts.find((part) => part.type === "weekday")?.value ?? ""
    const day = parts.find((part) => part.type === "day")?.value ?? ""
    const month = parts.find((part) => part.type === "month")?.value ?? ""
    return `${weekday} ${day} ${month}`.trim()
  }

  return (
    <IconContext.Provider value={{ weight: "fill" }}>
      <motion.div
        className={`fixed left-0 top-0 z-[10000] flex h-9 w-full items-center px-3.5 text-sm backdrop-blur-2xl ${theme === "dark"
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
          className={`pointer-events-none absolute inset-0 ${theme === "dark"
            ? "bg-gradient-to-b from-white/10 to-transparent"
            : "bg-gradient-to-b from-white/20 to-transparent"
            }`}
        />

        <div className="relative z-10 flex min-w-0 items-center gap-3.5 leading-none">
          <div className="relative">
            <button
              onClick={() => toggleMenu("apple")}
              className="flex h-6 w-6 items-center justify-center p-1 text-base opacity-90 transition-all duration-200 ease-out hover:opacity-100"
            >
              <SiApple className="h-4 w-4" />
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

        <div className="relative z-10 flex items-center gap-[18px] leading-none">
          <button
            onClick={toggleFullscreen}
            className={iconTriggerClass}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <ArrowsInSimple className="h-4 w-4" />
            ) : (
              <ArrowsOutSimple className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`flex h-6 w-6 items-center justify-center rounded-md opacity-80 transition-all duration-200 ease-out hover:opacity-100 ${theme === "dark" ? "hover:bg-white/15" : "hover:bg-black/10"
              }`}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <img
              src={theme === "dark" ? "/assets/macos/dark-mode-svgrepo-com-white.svg" : "/assets/macos/dark-mode-svgrepo-com.svg"}
              alt={theme === "dark" ? "Dark Mode" : "Light Mode"}
              className="h-[20px] w-[20px]"
            />
          </button>

          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md opacity-80 transition-all duration-200 ease-out hover:opacity-100 ${theme === "dark" ? "hover:bg-white/15" : "hover:bg-black/10"
              }`}
            title="Bluetooth"
          >
            <img
              src={theme === "dark" ? "/assets/macos/icons8-bluetooth-100.svg" : "/assets/macos/bluetooth-svgrepo-com.svg"}
              alt="Bluetooth"
              className={theme === "dark" ? "h-[18px] w-[18px]" : "h-[14px] w-[14px]"}
            />
          </div>

          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md opacity-80 transition-all duration-200 ease-out hover:opacity-100 ${theme === "dark" ? "hover:bg-white/15" : "hover:bg-black/10"
              }`}
            title="Wi-Fi"
          >
            <img
              src={theme === "dark" ? "/assets/macos/icons8-wi-fi-100-white.svg" : "/assets/macos/icons8-wi-fi-100.svg"}
              alt="Wi-Fi"
              className="h-[20px] w-[20px]"
            />
          </div>

          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md opacity-80 transition-all duration-200 ease-out hover:opacity-100 ${theme === "dark" ? "hover:bg-white/15" : "hover:bg-black/10"
              }`}
            title="Personal Hotspot"
          >
            <img
              src={theme === "dark" ? "/assets/macos/icons8-personal-hotspot-100-white.svg" : "/assets/macos/icons8-personal-hotspot-100.svg"}
              alt="Personal Hotspot"
              className="h-[20px] w-[20px]"
            />
          </div>

          <div
            className={`flex h-6 w-[34px] items-center justify-center rounded-md opacity-80 transition-all duration-200 ease-out hover:opacity-100 ${theme === "dark" ? "hover:bg-white/15" : "hover:bg-black/10"
              }`}
            title="Battery"
          >
            <img
              src={theme === "dark" ? "/assets/macos/icons8-full-battery-100-white.svg" : "/assets/macos/icons8-full-battery-100.svg"}
              alt="Battery"
              className="h-[30px] w-[30px]"
            />
          </div>

          <div className={iconTriggerClass} title="Control Center">
            <img
              src="/assets/macos/apple-control-center.svg"
              alt="Control Center"
              className={`h-[16px] w-[16px] ${theme === "dark" ? "invert" : ""}`}
            />
          </div>

          <Clock>
            {(now) => (
              <>
                <div className={`px-2 py-1 text-sm font-medium leading-none ${theme === "dark" ? "text-white/85" : "text-black/75"}`}>
                  {formatDesktopDate(now)}
                </div>

                <div className={`px-2 py-1 text-sm font-medium leading-none ${theme === "dark" ? "text-white/90" : "text-black/85"}`}>
                  {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </>
            )}
          </Clock>
        </div>
      </motion.div>
    </IconContext.Provider>
  )
}
