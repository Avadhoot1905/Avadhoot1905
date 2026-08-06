"use client"

import { useState, useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { SpeakerHigh, Lightbulb, CellSignalHigh, Lock, ArrowsCounterClockwise, Flashlight, Airplane, ArrowsOutSimple, ArrowsInSimple, IconContext, Bell, Moon, Play, FastForward, Rewind, Camera, WifiHigh, Bluetooth, Broadcast, Sun, SpeakerLow, Screencast, Copy, Airplay } from "phosphor-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { SiApple } from "react-icons/si"
import { LiquidGlassSurface } from "./liquid-glass-surface"

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
                        <div className={`relative overflow-hidden w-1/2 h-full rounded-[2rem] p-[14px] grid grid-cols-2 gap-[14px] ${theme === "dark" ? "bg-white/10" : "bg-white/30"}`}>
                          <LiquidGlassSurface
                            radius={30}
                            strength={0.06}
                            edgeHighlight={0.16}
                            glow={0.03}
                            specular={0.5}
                            panelClassName={theme === "dark"
                              ? "bg-gradient-to-br from-white/[0.06] to-transparent"
                              : "bg-gradient-to-br from-white/10 to-transparent"}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); setAirplaneMode(!airplaneMode) }}
                            className={`relative z-10 w-full h-full rounded-full flex items-center justify-center transition-colors ${airplaneMode ? 'bg-orange-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-white/50')}`}
                          >
                            <Airplane weight="fill" size={24} className="text-white" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setCellular(!cellular) }}
                            className={`relative z-10 w-full h-full rounded-full flex items-center justify-center transition-colors ${cellular ? 'bg-green-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-white/50')}`}
                          >
                            <CellSignalHigh weight="fill" size={22} className="text-white" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setWifi(!wifi) }}
                            className={`relative z-10 w-full h-full rounded-full flex items-center justify-center transition-colors ${wifi ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-white/50')}`}
                          >
                            <img src="/assets/macos/icons8-wi-fi-100-white.svg" className="w-[22px] h-[22px]" alt="Wi-Fi" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setBluetooth(!bluetooth) }}
                            className={`relative z-10 w-full h-full rounded-full flex items-center justify-center transition-colors ${bluetooth ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-white/50')}`}
                          >
                            <img src="/assets/macos/icons8-bluetooth-100.svg" className="w-[20px] h-[20px]" alt="Bluetooth" />
                          </button>
                        </div>

                        {/* Media Player */}
                        <div className={`w-1/2 h-full rounded-[2rem] p-4 flex flex-col justify-between relative overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-white/30"}`}>
                          <LiquidGlassSurface
                            radius={30}
                            strength={0.06}
                            edgeHighlight={0.16}
                            glow={0.03}
                            specular={0.5}
                            panelClassName={theme === "dark"
                              ? "bg-gradient-to-br from-white/[0.06] to-transparent"
                              : "bg-gradient-to-br from-white/10 to-transparent"}
                          />
                          <div className="relative z-10 flex justify-between items-start w-full">
                            <div className="text-white/70 text-[13px] font-medium tracking-wide">Not Playing</div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-white/20" : "bg-white/50"}`}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2L22 20H2L12 2Z" /></svg>
                            </div>
                          </div>
                          <div className="relative z-10 flex items-center justify-center gap-5 mt-2">
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
                              className={`relative overflow-hidden w-1/2 h-full rounded-[1.5rem] flex items-center justify-center transition-colors ${rotationLock ? 'bg-white text-red-500' : `${theme === "dark" ? "bg-white/10" : "bg-white/30"} text-white`}`}
                            >
                              {!rotationLock && <LiquidGlassSurface radius={24} strength={0.05} chromaticAberration={0.1} edgeHighlight={0.16} glow={0.03} specular={0.5} quality={256} panelClassName={theme === "dark" ? "bg-gradient-to-br from-white/[0.06] to-transparent" : "bg-gradient-to-br from-white/10 to-transparent"} />}
                              <ArrowsCounterClockwise weight="bold" size={24} className="relative z-10" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSilentMode(!silentMode) }}
                              className={`relative overflow-hidden w-1/2 h-full rounded-[1.5rem] flex items-center justify-center transition-colors ${silentMode ? 'bg-white text-red-500' : `${theme === "dark" ? "bg-white/10" : "bg-white/30"} text-white`}`}
                            >
                              {!silentMode && <LiquidGlassSurface radius={24} strength={0.05} chromaticAberration={0.1} edgeHighlight={0.16} glow={0.03} specular={0.5} quality={256} panelClassName={theme === "dark" ? "bg-gradient-to-br from-white/[0.06] to-transparent" : "bg-gradient-to-br from-white/10 to-transparent"} />}
                              <Bell weight="fill" size={24} className="relative z-10" />
                            </button>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); onLockScreen?.() }}
                            className={`relative overflow-hidden w-full h-[calc(50%-7px)] rounded-[1.5rem] flex items-center px-4 gap-3 ${theme === "dark" ? "bg-white/10" : "bg-white/30"}`}
                          >
                            <LiquidGlassSurface radius={24} strength={0.05} chromaticAberration={0.1} edgeHighlight={0.16} glow={0.03} specular={0.5} quality={256} panelClassName={theme === "dark" ? "bg-gradient-to-br from-white/[0.06] to-transparent" : "bg-gradient-to-br from-white/10 to-transparent"} />
                            <div className="relative z-10 w-[30px] h-[30px] rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                              <Moon weight="fill" size={18} className="text-white" />
                            </div>
                            <span className="relative z-10 text-white font-medium text-[15px]">Focus</span>
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
                          <LiquidGlassSurface radius={32} strength={0.05} chromaticAberration={0.1} edgeHighlight={0.16} glow={0.03} specular={0.5} quality={256} panelClassName={theme === "dark" ? "bg-gradient-to-br from-white/[0.06] to-transparent" : "bg-gradient-to-br from-white/10 to-transparent"} />
                          <div className="relative z-10 bg-white w-full transition-all duration-75" style={{ height: `${brightness}%` }} />
                          <div className="absolute z-10 bottom-5 left-0 right-0 flex justify-center pointer-events-none">
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
                          <LiquidGlassSurface radius={32} strength={0.05} chromaticAberration={0.1} edgeHighlight={0.16} glow={0.03} specular={0.5} quality={256} panelClassName={theme === "dark" ? "bg-gradient-to-br from-white/[0.06] to-transparent" : "bg-gradient-to-br from-white/10 to-transparent"} />
                          <div className="relative z-10 bg-white w-full transition-all duration-75" style={{ height: `${volume}%` }} />
                          <div className="absolute z-10 bottom-5 left-0 right-0 flex justify-center pointer-events-none">
                            <SpeakerHigh weight="fill" size={24} className={volume > 20 ? "text-gray-500" : "text-white"} />
                          </div>
                        </div>
                      </div>

                      {/* Row 5 */}
                      <div className="flex gap-[14px] h-[72px] sm:h-[76px]">
                        <button
                          onClick={(e) => { e.stopPropagation(); setFlashlight(!flashlight) }}
                          className={`relative overflow-hidden flex-1 rounded-[1.5rem] flex items-center justify-center transition-colors ${flashlight ? 'bg-white text-black' : `${theme === "dark" ? "bg-white/10" : "bg-white/30"} text-white`}`}
                        >
                          {!flashlight && <LiquidGlassSurface radius={24} strength={0.05} chromaticAberration={0.1} edgeHighlight={0.16} glow={0.03} specular={0.5} quality={256} panelClassName={theme === "dark" ? "bg-gradient-to-br from-white/[0.06] to-transparent" : "bg-gradient-to-br from-white/10 to-transparent"} />}
                          <Flashlight weight="fill" size={24} className="relative z-10" />
                        </button>
                        <button className={`relative overflow-hidden flex-1 rounded-[1.5rem] flex items-center justify-center text-white ${theme === "dark" ? "bg-white/10" : "bg-white/30"}`}>
                          <LiquidGlassSurface radius={24} strength={0.05} chromaticAberration={0.1} edgeHighlight={0.16} glow={0.03} specular={0.5} quality={256} panelClassName={theme === "dark" ? "bg-gradient-to-br from-white/[0.06] to-transparent" : "bg-gradient-to-br from-white/10 to-transparent"} />
                          <div className="relative z-10 w-[22px] h-[22px]">
                            <div className="absolute top-0 right-0 w-[15px] h-[15px] border-2 border-white rounded-[3px]" />
                            <div className="absolute bottom-0 left-0 w-[15px] h-[15px] border-2 border-white rounded-[3px] bg-black/40 backdrop-blur-md" />
                          </div>
                        </button>
                        <button className={`relative overflow-hidden flex-1 rounded-[1.5rem] flex items-center justify-center text-white ${theme === "dark" ? "bg-white/10" : "bg-white/30"}`}>
                          <LiquidGlassSurface radius={24} strength={0.05} chromaticAberration={0.1} edgeHighlight={0.16} glow={0.03} specular={0.5} quality={256} panelClassName={theme === "dark" ? "bg-gradient-to-br from-white/[0.06] to-transparent" : "bg-gradient-to-br from-white/10 to-transparent"} />
                          <Camera weight="fill" size={24} className="relative z-10" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setTheme(theme === 'dark' ? 'light' : 'dark') }}
                          className={`relative overflow-hidden flex-1 rounded-[1.5rem] flex items-center justify-center transition-colors ${theme === "dark" ? "bg-white text-black" : "bg-white/30 text-white"}`}
                        >
                          {theme !== "dark" && <LiquidGlassSurface radius={24} strength={0.05} chromaticAberration={0.1} edgeHighlight={0.16} glow={0.03} specular={0.5} quality={256} panelClassName="bg-gradient-to-br from-white/10 to-transparent" />}
                          <img
                            src={theme === "dark" ? "/assets/macos/dark-mode-svgrepo-com.svg" : "/assets/macos/dark-mode-svgrepo-com-white.svg"}
                            alt="Theme"
                            className="relative z-10 h-6 w-6"
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
        {/* Liquid-glass material layer — refracts a translucent panel behind the
            menu content; menus/dropdowns stay crisp siblings on top. */}
        <LiquidGlassSurface
          radius={0}
          strength={0.04}
          chromaticAberration={0.1}
          glow={0.025}
          edgeHighlight={0.14}
          specular={0.5}
          depth={7}
          panelClassName={theme === "dark"
            ? "bg-gradient-to-b from-white/[0.06] to-transparent"
            : "bg-gradient-to-b from-white/12 to-transparent"}
        />

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

          <div className="relative">
            <button
              onClick={() => toggleMenu("controlCenter")}
              className={`flex h-6 w-6 items-center justify-center rounded-md p-1 transition-all duration-200 ease-out ${activeMenu === "controlCenter"
                ? theme === "dark" ? "bg-white/15 opacity-100" : "bg-black/10 opacity-100"
                : `opacity-80 hover:opacity-100 ${theme === "dark" ? "hover:bg-white/15" : "hover:bg-black/10"}`
                }`}
              title="Control Center"
            >
              <img
                src="/assets/macos/apple-control-center.svg"
                alt="Control Center"
                className={`h-[16px] w-[16px] ${theme === "dark" ? "invert" : ""}`}
              />
            </button>
            {createPortal(
              <AnimatePresence>
                {activeMenu === "controlCenter" && (
                  <>
                    {/* Click-away catcher */}
                    <motion.div
                      className="fixed inset-0 z-[99998]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setActiveMenu(null)}
                    />
                    <motion.div
                      className={`fixed right-2.5 top-[38px] z-[99999] rounded-[2rem] p-4 shadow-2xl ${theme === "dark"
                        ? "bg-black/10 text-white"
                        : "bg-white/20 text-black"
                        }`}
                      style={{
                        width: '320px',
                        backdropFilter: 'blur(2px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(2px) saturate(160%)'
                      }}
                      initial={{ opacity: 0, scale: 0.96, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: -4 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <div className="relative z-10 flex flex-col gap-3.5">
                        {/* Row 1: Connectivity & Media */}
                        <div className="flex gap-3.5 h-[155px]">
                          {/* Left Column: Connectivity */}
                          <div className={`w-[145px] flex flex-col justify-between rounded-[1.8rem] p-3.5 ${theme === "dark" ? "bg-white/20" : "bg-black/10"}`}>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-[#0A84FF] flex items-center justify-center flex-shrink-0">
                                <WifiHigh weight="bold" size={16} className="text-white" />
                              </div>
                              <div className="flex flex-col justify-center overflow-hidden">
                                <span className="font-semibold text-[13px] leading-tight">Wi-Fi</span>
                                <span className="text-[11px] opacity-70 leading-tight truncate">T-VIT</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-[#0A84FF] flex items-center justify-center flex-shrink-0">
                                <Bluetooth weight="bold" size={16} className="text-white" />
                              </div>
                              <div className="flex flex-col justify-center overflow-hidden">
                                <span className="font-semibold text-[13px] leading-tight">Bluetooth</span>
                                <span className="text-[11px] opacity-70 leading-tight truncate">On</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-[#0A84FF] flex items-center justify-center flex-shrink-0">
                                <Broadcast weight="bold" size={16} className="text-white" />
                              </div>
                              <div className="flex flex-col justify-center overflow-hidden">
                                <span className="font-semibold text-[13px] leading-tight">AirDrop</span>
                                <span className="text-[11px] opacity-70 leading-tight truncate">Everyone</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Media + Utils */}
                          <div className="flex-1 flex flex-col gap-3.5">
                            {/* Media */}
                            <div className={`h-[100px] rounded-[1.8rem] p-3 flex flex-col justify-between ${theme === "dark" ? "bg-white/20" : "bg-black/10"}`}>
                              <div className="flex items-start gap-3">
                                <div className="w-[42px] h-[42px] rounded-[0.8rem] bg-gray-500/30"></div>
                                <span className="text-[13px] font-semibold mt-1">Not Playing</span>
                              </div>
                              <div className="flex items-center justify-center gap-3.5 pb-1">
                                <Rewind weight="fill" size={18} className="opacity-50" />
                                <Play weight="fill" size={24} />
                                <FastForward weight="fill" size={18} className="opacity-50" />
                              </div>
                            </div>
                            {/* Two Utils */}
                            <div className="flex gap-3.5 flex-1">
                              <div className={`flex-1 rounded-[1.2rem] flex items-center justify-center ${theme === "dark" ? "bg-white/20" : "bg-black/10"}`}>
                                <Screencast weight="bold" size={18} />
                              </div>
                              <div className={`flex-1 rounded-[1.2rem] flex items-center justify-center ${theme === "dark" ? "bg-white/20" : "bg-black/10"}`}>
                                <Copy weight="bold" size={18} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Row 2: Circles & Pill */}
                        <div className="flex gap-3.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setTheme(theme === 'dark' ? 'light' : 'dark') }}
                            className={`h-[52px] w-[52px] rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${theme === "dark" ? "bg-white/20 hover:bg-white/30" : "bg-black/10 hover:bg-black/15"}`}
                          >
                            <img
                              src={theme === "dark" ? "/assets/macos/dark-mode-svgrepo-com-white.svg" : "/assets/macos/dark-mode-svgrepo-com.svg"}
                              alt="Theme"
                              className="h-[22px] w-[22px]"
                            />
                          </button>
                          <div className={`h-[52px] w-[52px] rounded-full flex-shrink-0 flex items-center justify-center ${theme === "dark" ? "bg-white/20" : "bg-black/10"}`}>
                            <Camera weight="bold" size={20} />
                          </div>
                          <div className={`flex-1 h-[52px] rounded-full flex items-center px-3.5 gap-3 ${theme === "dark" ? "bg-white/20" : "bg-black/10"}`}>
                            <div className="h-7 w-7 rounded-full bg-[#5856D6] text-white flex items-center justify-center flex-shrink-0">
                              <Moon weight="fill" size={14} />
                            </div>
                            <div className="flex flex-col justify-center">
                              <span className="font-semibold text-[13px] leading-tight">Do Not Disturb</span>
                              <span className="text-[11px] opacity-70 leading-tight">On</span>
                            </div>
                          </div>
                        </div>

                        {/* Row 3: Display Slider */}
                        <div className={`h-[64px] rounded-[1.8rem] flex flex-col justify-center px-4 relative overflow-hidden ${theme === "dark" ? "bg-white/20" : "bg-black/10"}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[13px] font-semibold">Display</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Sun weight="fill" size={14} className="opacity-70" />
                            <div
                              className="relative flex-1 h-[24px] flex items-center cursor-pointer touch-none"
                              onPointerDownCapture={(e) => {
                                e.stopPropagation();
                                const target = e.currentTarget;
                                target.setPointerCapture(e.pointerId);
                                const rect = target.getBoundingClientRect();
                                const update = (clientX: number) => {
                                  const x = clientX - rect.left;
                                  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                                  setBrightness(Math.round(percentage));
                                };
                                update(e.clientX);
                                const handleMove = (ev: PointerEvent) => update(ev.clientX);
                                const handleUp = (ev: PointerEvent) => {
                                  target.removeEventListener('pointermove', handleMove);
                                  target.removeEventListener('pointerup', handleUp);
                                  target.releasePointerCapture(ev.pointerId);
                                };
                                target.addEventListener('pointermove', handleMove);
                                target.addEventListener('pointerup', handleUp);
                              }}
                            >
                              <div className="w-full h-[5px] bg-black/10 dark:bg-white/20 rounded-full relative pointer-events-none">
                                <div className="absolute left-0 h-full bg-black/70 dark:bg-white rounded-full" style={{ width: `${brightness}%` }}></div>
                                <div className="absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] bg-white border border-black/10 shadow-sm rounded-full -ml-[7px]" style={{ left: `${brightness}%` }}></div>
                              </div>
                            </div>
                            <Sun weight="fill" size={18} />
                          </div>
                        </div>

                        {/* Row 4: Sound Slider */}
                        <div className={`h-[64px] rounded-[1.8rem] flex flex-col justify-center px-4 relative overflow-hidden ${theme === "dark" ? "bg-white/20" : "bg-black/10"}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[13px] font-semibold">Sound</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <SpeakerLow weight="fill" size={14} className="opacity-70" />
                            <div
                              className="relative flex-1 h-[24px] flex items-center cursor-pointer touch-none"
                              onPointerDownCapture={(e) => {
                                e.stopPropagation();
                                const target = e.currentTarget;
                                target.setPointerCapture(e.pointerId);
                                const rect = target.getBoundingClientRect();
                                const update = (clientX: number) => {
                                  const x = clientX - rect.left;
                                  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                                  setVolume(Math.round(percentage));
                                };
                                update(e.clientX);
                                const handleMove = (ev: PointerEvent) => update(ev.clientX);
                                const handleUp = (ev: PointerEvent) => {
                                  target.removeEventListener('pointermove', handleMove);
                                  target.removeEventListener('pointerup', handleUp);
                                  target.releasePointerCapture(ev.pointerId);
                                };
                                target.addEventListener('pointermove', handleMove);
                                target.addEventListener('pointerup', handleUp);
                              }}
                            >
                              <div className="w-full h-[5px] bg-black/10 dark:bg-white/20 rounded-full relative pointer-events-none">
                                <div className="absolute left-0 h-full bg-black/70 dark:bg-white rounded-full" style={{ width: `${volume}%` }}></div>
                                <div className="absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] bg-white border border-black/10 shadow-sm rounded-full -ml-[7px]" style={{ left: `${volume}%` }}></div>
                              </div>
                            </div>
                            <SpeakerHigh weight="fill" size={18} />
                            <div className="w-[22px] h-[22px] rounded-full bg-[#0A84FF]/20 text-[#0A84FF] dark:text-[#0A84FF] flex items-center justify-center flex-shrink-0 ml-1">
                              <Airplay weight="bold" size={12} />
                            </div>
                          </div>
                        </div>

                        {/* Row 5: Edit Button */}
                        <div className="flex justify-center mt-1">
                          <button className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors ${theme === "dark" ? "bg-white/20 hover:bg-white/30" : "bg-black/10 hover:bg-black/15"}`}>
                            Edit Controls
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>,
              document.body
            )}
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
