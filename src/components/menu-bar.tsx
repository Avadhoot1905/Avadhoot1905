"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Moon, Sun, Monitor, Wifi, Battery, BatteryCharging } from "lucide-react"
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
        {/* iOS Status Bar - Always visible, draggable to pull down panel */}
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
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 1 }}
          onDragEnd={(_event, info) => {
            // If dragged down more than 50px, open the panel
            if (info.offset.y > 50) {
              setShowNotificationPanel(true)
            }
          }}
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
              <div className="p-6 pt-16">
                {/* Date */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-thin mb-1">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                  <div className="text-lg text-gray-500">
                    {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </div>
                </div>

                {/* Quick Settings */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setTheme(theme === 'dark' ? 'light' : 'dark')
                    }}
                    className={`p-4 rounded-2xl backdrop-blur-xl border flex flex-col items-start ${
                      theme === "dark" 
                        ? "bg-blue-600/50 border-blue-500" 
                        : "bg-blue-500/50 border-blue-400"
                    }`}
                  >
                    {theme === "dark" ? <Moon className="h-6 w-6 mb-2" /> : <Sun className="h-6 w-6 mb-2" />}
                    <span className="text-sm font-medium">
                      {theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onLockScreen?.()
                      setShowNotificationPanel(false)
                    }}
                    className={`p-4 rounded-2xl backdrop-blur-xl border flex flex-col items-start ${
                      theme === "dark" 
                        ? "bg-gray-700/50 border-gray-600" 
                        : "bg-gray-300/50 border-gray-400"
                    }`}
                  >
                    <div className="text-2xl mb-2">🔒</div>
                    <span className="text-sm font-medium">Lock</span>
                  </button>

                  <button
                    className={`p-4 rounded-2xl backdrop-blur-xl border flex flex-col items-start ${
                      theme === "dark" 
                        ? "bg-blue-600/50 border-blue-500" 
                        : "bg-blue-500/50 border-blue-400"
                    }`}
                  >
                    <Wifi className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Wi-Fi</span>
                  </button>

                  <button
                    className={`p-4 rounded-2xl backdrop-blur-xl border flex flex-col items-start ${
                      theme === "dark" 
                        ? "bg-green-600/50 border-green-500" 
                        : "bg-green-500/50 border-green-400"
                    }`}
                  >
                    <Battery className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Battery</span>
                  </button>
                </div>

                {/* Notification */}
                <div 
                  className={`p-4 rounded-2xl backdrop-blur-xl border ${
                    theme === "dark" 
                      ? "bg-gray-800/50 border-gray-700" 
                      : "bg-gray-200/50 border-gray-300"
                  }`}
                >
                  <div className="font-semibold mb-1">Welcome!</div>
                  <div className="text-sm opacity-80">
                    Pull down from the status bar to open. Swipe up to close.
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
