"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Moon, Sun, Monitor, Wifi, Battery, BatteryCharging, Volume2, Lightbulb, Signal, Bluetooth, Lock, RotateCcw, Flashlight, Plane } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { SiApple } from "react-icons/si"

interface MenuBarProps {
  onLockScreen?: () => void
}

export function MenuBar({ onLockScreen }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [brightness, setBrightness] = useState(70)
  const [volume, setVolume] = useState(60)
  const { theme, setTheme } = useTheme()

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

    return () => {
      clearInterval(timer)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

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
    const handleDragEnd = (_event: any, info: any) => {
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
                className={`fixed top-0 left-0 right-0 z-[9999] backdrop-blur-xl border-b shadow-2xl ${
                  theme === "dark" 
                    ? "bg-black/90 text-white border-white/10" 
                    : "bg-white/90 text-black border-black/10"
                }`}
                style={{
                  backdropFilter: 'blur(30px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(30px) saturate(180%)',
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
              <div className="p-4 pt-16 pb-8">
                {/* Date */}
                <div className="text-center mb-5">
                  <div className="text-3xl font-thin mb-0.5">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                  <div className="text-base text-gray-500">
                    {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </div>
                </div>

                {/* Main Control Section */}
                <div className="flex flex-col gap-2 mb-4">
                  {/* Icon Grid - 1x4 Top, 1x4 Bottom */}
                  <div className="flex flex-col gap-2">
                    {/* Top 4 icons - Single Horizontal Row */}
                    <div className="grid grid-cols-4 gap-2 max-w-[280px] mx-auto">
                      {/* Airplane Mode */}
                      <button
                        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center backdrop-blur-xl border transition-all ${
                          theme === "dark" 
                            ? "bg-gray-700/80 border-gray-600 hover:bg-gray-600/80" 
                            : "bg-gray-200/80 border-gray-300 hover:bg-gray-300/80"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Plane className="h-4 w-4 mb-0.5" />
                        <span className="text-[7px] font-medium">Airplane</span>
                      </button>

                      {/* Mobile Data */}
                      <button
                        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center backdrop-blur-xl border transition-all ${
                          theme === "dark" 
                            ? "bg-blue-600/80 border-blue-500 hover:bg-blue-500/80" 
                            : "bg-blue-500/80 border-blue-400 hover:bg-blue-400/80"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Signal className="h-4 w-4 mb-0.5" />
                        <span className="text-[7px] font-medium">Cellular</span>
                      </button>

                      {/* WiFi */}
                      <button
                        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center backdrop-blur-xl border transition-all ${
                          theme === "dark" 
                            ? "bg-blue-600/80 border-blue-500 hover:bg-blue-500/80" 
                            : "bg-blue-500/80 border-blue-400 hover:bg-blue-400/80"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Wifi className="h-4 w-4 mb-0.5" />
                        <span className="text-[7px] font-medium">Wi-Fi</span>
                      </button>

                      {/* Bluetooth */}
                      <button
                        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center backdrop-blur-xl border transition-all ${
                          theme === "dark" 
                            ? "bg-blue-600/80 border-blue-500 hover:bg-blue-500/80" 
                            : "bg-blue-500/80 border-blue-400 hover:bg-blue-400/80"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Bluetooth className="h-4 w-4 mb-0.5" />
                        <span className="text-[7px] font-medium">Bluetooth</span>
                      </button>
                    </div>

                    {/* Bottom 4 icons - Single Row */}
                    <div className="grid grid-cols-4 gap-2 max-w-[280px] mx-auto">
                      {/* Lock Orientation - Active (Blue) */}
                      <button
                        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center backdrop-blur-xl border transition-all ${
                          theme === "dark" 
                            ? "bg-blue-600/80 border-blue-500 hover:bg-blue-500/80" 
                            : "bg-blue-500/80 border-blue-400 hover:bg-blue-400/80"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RotateCcw className="h-4 w-4 mb-0.5" />
                        <span className="text-[7px] font-medium">Rotation</span>
                      </button>

                      {/* Flashlight */}
                      <button
                        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center backdrop-blur-xl border transition-all ${
                          theme === "dark" 
                            ? "bg-gray-700/80 border-gray-600 hover:bg-gray-600/80" 
                            : "bg-gray-200/80 border-gray-300 hover:bg-gray-300/80"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Flashlight className="h-4 w-4 mb-0.5" />
                        <span className="text-[7px] font-medium">Torch</span>
                      </button>

                      {/* Theme Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setTheme(theme === 'dark' ? 'light' : 'dark')
                        }}
                        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center backdrop-blur-xl border transition-all ${
                          theme === "dark" 
                            ? "bg-gray-700/80 border-gray-600 hover:bg-gray-600/80" 
                            : "bg-gray-200/80 border-gray-300 hover:bg-gray-300/80"
                        }`}
                      >
                        {theme === "dark" ? <Moon className="h-4 w-4 mb-0.5" /> : <Sun className="h-4 w-4 mb-0.5" />}
                        <span className="text-[7px] font-medium">
                          {theme === "dark" ? "Dark" : "Light"}
                        </span>
                      </button>

                      {/* Screen Lock */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onLockScreen?.()
                          setShowNotificationPanel(false)
                        }}
                        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center backdrop-blur-xl border transition-all ${
                          theme === "dark" 
                            ? "bg-gray-700/80 border-gray-600 hover:bg-gray-600/80" 
                            : "bg-gray-200/80 border-gray-300 hover:bg-gray-300/80"
                        }`}
                      >
                        <Lock className="h-4 w-4 mb-0.5" />
                        <span className="text-[7px] font-medium">Lock</span>
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Sliders */}
                  <div className="flex flex-col gap-2">
                    {/* Brightness Slider - Horizontal */}
                    <div 
                      className={`rounded-2xl backdrop-blur-xl border p-2 flex items-center justify-between cursor-pointer ${
                        theme === "dark" 
                          ? "bg-gray-800/80 border-gray-700" 
                          : "bg-gray-200/80 border-gray-300"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = e.clientX - rect.left
                        const width = rect.width
                        const percentage = Math.max(0, Math.min(100, (x / width) * 100))
                        setBrightness(Math.round(percentage))
                      }}
                    >
                      <Sun className="h-4 w-4 flex-shrink-0 mr-2" />
                      <div className="flex-1 h-2 bg-gray-400/30 rounded-full overflow-hidden relative">
                        <div className="absolute left-0 top-0 bottom-0 bg-blue-500 rounded-full transition-all" style={{ width: `${brightness}%` }} />
                      </div>
                      <Sun className="h-4 w-4 flex-shrink-0 ml-2" />
                    </div>

                    {/* Volume Slider - Horizontal */}
                    <div 
                      className={`rounded-2xl backdrop-blur-xl border p-2 flex items-center justify-between cursor-pointer ${
                        theme === "dark" 
                          ? "bg-gray-800/80 border-gray-700" 
                          : "bg-gray-200/80 border-gray-300"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = e.clientX - rect.left
                        const width = rect.width
                        const percentage = Math.max(0, Math.min(100, (x / width) * 100))
                        setVolume(Math.round(percentage))
                      }}
                    >
                      <Volume2 className="h-4 w-4 flex-shrink-0 mr-2" />
                      <div className="flex-1 h-2 bg-gray-400/30 rounded-full overflow-hidden relative">
                        <div className="absolute left-0 top-0 bottom-0 bg-blue-500 rounded-full transition-all" style={{ width: `${volume}%` }} />
                      </div>
                      <Volume2 className="h-4 w-4 flex-shrink-0 ml-2" />
                    </div>
                  </div>
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
  return (
    <motion.div
      className={`flex h-10 w-full items-center px-4 backdrop-blur-xl fixed top-0 left-0 z-[10000] border-b ${
        theme === "dark" 
          ? "bg-black/20 text-white border-white/10" 
          : "bg-white/20 text-black border-black/10"
      }`}
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative mr-4">
        <button
          onClick={() => toggleMenu("apple")}
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xl font-bold backdrop-blur-xl border transition-all duration-200 ${
            activeMenu === "apple"
              ? theme === "dark" 
                ? "bg-white/20 border-white/30" 
                : "bg-black/20 border-black/30"
              : theme === "dark"
                ? "hover:bg-white/10 hover:border-white/20 border-transparent"
                : "hover:bg-black/10 hover:border-black/20 border-transparent"
          }`}
          style={{
            backdropFilter: 'blur(15px) saturate(160%)',
            WebkitBackdropFilter: 'blur(15px) saturate(160%)'
          }}
        >
          <SiApple className="h-4 w-4" />
        </button>
        {activeMenu === "apple" && (
          <motion.div
            className={`absolute left-0 top-full z-[99999] mt-1 w-56 rounded-md shadow-xl border backdrop-blur-xl ${
              theme === "dark" 
                ? "bg-black/30 border-white/20" 
                : "bg-white/30 border-black/20"
            }`}
            style={{ 
              position: 'absolute', 
              zIndex: 99999,
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)'
            }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2">
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                About This Mac
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                System Preferences...
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                App Store...
              </div>
              <div className={`my-1 border-t ${theme === "dark" ? "border-gray-700" : ""}`}></div>
              <button
                onClick={() => {
                  setActiveMenu(null)
                  onLockScreen?.()
                }}
                className={`w-full text-left rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Sleep
              </button>
              <button
                onClick={() => {
                  setActiveMenu(null)
                  onLockScreen?.()
                }}
                className={`w-full text-left rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Restart...
              </button>
              <button
                onClick={() => {
                  setActiveMenu(null)
                  onLockScreen?.()
                }}
                className={`w-full text-left rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Shut Down...
              </button>
              <div className={`my-1 border-t ${theme === "dark" ? "border-gray-700" : ""}`}></div>
              <button
                onClick={() => {
                  setActiveMenu(null)
                  onLockScreen?.()
                }}
                className={`w-full text-left rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Lock Screen
              </button>
              <button
                onClick={() => {
                  setActiveMenu(null)
                  onLockScreen?.()
                }}
                className={`w-full text-left rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Log Out...
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="relative mr-4">
        <button
          onClick={() => toggleMenu("file")}
          className={`flex items-center rounded px-2 py-1 text-sm font-medium backdrop-blur-xl border transition-all duration-200 ${
            activeMenu === "file"
              ? theme === "dark" 
                ? "bg-white/20 border-white/30 text-white" 
                : "bg-black/20 border-black/30 text-black"
              : "border-transparent hover:bg-white/10 hover:border-white/20"
          }`}
          style={{
            backdropFilter: 'blur(15px) saturate(160%)',
            WebkitBackdropFilter: 'blur(15px) saturate(160%)'
          }}
        >
          File
        </button>
        {activeMenu === "file" && (
          <motion.div
            className={`absolute left-0 top-full z-[99999] mt-1 w-56 rounded-md shadow-xl border backdrop-blur-xl ${
              theme === "dark" 
                ? "bg-black/30 border-white/20" 
                : "bg-white/30 border-black/20"
            }`}
            style={{ 
              position: 'absolute', 
              zIndex: 99999,
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)'
            }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2">
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                New Window
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                New Tab
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Open...
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Close
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="relative mr-4">
        <button
          onClick={() => toggleMenu("edit")}
          className={`flex items-center rounded px-2 py-1 text-sm font-medium backdrop-blur-xl border transition-all duration-200 ${
            activeMenu === "edit"
              ? theme === "dark" 
                ? "bg-white/20 border-white/30 text-white" 
                : "bg-black/20 border-black/30 text-black"
              : "border-transparent hover:bg-white/10 hover:border-white/20"
          }`}
          style={{
            backdropFilter: 'blur(15px) saturate(160%)',
            WebkitBackdropFilter: 'blur(15px) saturate(160%)'
          }}
        >
          Edit
        </button>
        {activeMenu === "edit" && (
          <motion.div
            className={`absolute left-0 top-full z-[99999] mt-1 w-56 rounded-md shadow-xl border backdrop-blur-xl ${
              theme === "dark" 
                ? "bg-black/30 border-white/20" 
                : "bg-white/30 border-black/20"
            }`}
            style={{ 
              position: 'absolute', 
              zIndex: 99999,
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)'
            }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2">
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Undo
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Redo
              </div>
              <div className={`my-1 border-t ${theme === "dark" ? "border-gray-700" : ""}`}></div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Cut
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Copy
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Paste
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Select All
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="relative mr-4">
        <button
          onClick={() => toggleMenu("view")}
          className={`flex items-center rounded px-2 py-1 text-sm font-medium backdrop-blur-xl border transition-all duration-200 ${
            activeMenu === "view"
              ? theme === "dark" 
                ? "bg-white/20 border-white/30 text-white" 
                : "bg-black/20 border-black/30 text-black"
              : "border-transparent hover:bg-white/10 hover:border-white/20"
          }`}
          style={{
            backdropFilter: 'blur(15px) saturate(160%)',
            WebkitBackdropFilter: 'blur(15px) saturate(160%)'
          }}
        >
          View
        </button>
        {activeMenu === "view" && (
          <motion.div
            className={`absolute left-0 top-full z-[99999] mt-1 w-56 rounded-md shadow-xl border backdrop-blur-xl ${
              theme === "dark" 
                ? "bg-black/30 border-white/20" 
                : "bg-white/30 border-black/20"
            }`}
            style={{ 
              position: 'absolute', 
              zIndex: 99999,
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)'
            }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2">
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                as Icons
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                as List
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                as Columns
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                as Gallery
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex-1"></div>

      <div className="relative mr-4">
        <button
          onClick={() => toggleMenu("theme")}
          className={`flex items-center rounded-full p-1 backdrop-blur-xl border transition-all duration-200 ${
            activeMenu === "theme"
              ? theme === "dark" 
                ? "bg-white/20 border-white/30 text-white" 
                : "bg-black/20 border-black/30 text-black"
              : theme === "dark"
                ? "bg-white/10 border-white/20 text-gray-200 hover:bg-white/15 hover:border-white/30"
                : "bg-black/10 border-black/20 text-gray-700 hover:bg-black/15 hover:border-black/30"
          }`}
          style={{
            backdropFilter: 'blur(15px) saturate(160%)',
            WebkitBackdropFilter: 'blur(15px) saturate(160%)'
          }}
        >
          {theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
        </button>
        {activeMenu === "theme" && (
          <motion.div
            className={`absolute right-0 top-full z-[99999] mt-1 w-32 rounded-md shadow-xl border backdrop-blur-xl ${
              theme === "dark" 
                ? "bg-black/30 border-white/20" 
                : "bg-white/30 border-black/20"
            }`}
            style={{ 
              position: 'absolute', 
              zIndex: 99999,
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)'
            }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2">
              <div
                className={`flex items-center rounded px-3 py-1 ${theme === "light" ? "bg-blue-500 text-white" : theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
                onClick={() => {
                  setTheme("light")
                  setActiveMenu(null)
                }}
              >
                <Sun className="mr-2 h-4 w-4" /> Light
              </div>
              <div
                className={`flex items-center rounded px-3 py-1 ${theme === "dark" ? "bg-blue-500 text-white" : theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
                onClick={() => {
                  setTheme("dark")
                  setActiveMenu(null)
                }}
              >
                <Moon className="mr-2 h-4 w-4" /> Dark
              </div>
              <div
                className={`flex items-center rounded px-3 py-1 ${theme === "system" ? "bg-blue-500 text-white" : theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
                onClick={() => {
                  setTheme("system")
                  setActiveMenu(null)
                }}
              >
                <Monitor className="mr-2 h-4 w-4" /> System
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex items-center space-x-2 text-sm">
        <div 
          className={`rounded-full px-2 py-1 backdrop-blur-xl border border-transparent transition-all duration-200 ${
            theme === "dark" 
              ? "hover:bg-white/10 hover:border-white/20" 
              : "hover:bg-black/10 hover:border-black/20"
          }`}
          style={{
            backdropFilter: 'blur(15px) saturate(160%)',
            WebkitBackdropFilter: 'blur(15px) saturate(160%)'
          }}
        >
          100%
        </div>
        <div 
          className={`rounded px-2 py-1 backdrop-blur-xl border border-transparent transition-all duration-200 ${
            theme === "dark" 
              ? "hover:bg-white/10 hover:border-white/20" 
              : "hover:bg-black/10 hover:border-black/20"
          }`}
          style={{
            backdropFilter: 'blur(15px) saturate(160%)',
            WebkitBackdropFilter: 'blur(15px) saturate(160%)'
          }}
        >
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </motion.div>
  )
}
