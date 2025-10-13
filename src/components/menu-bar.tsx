"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { SiApple } from "react-icons/si"

export function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMenu = (menu: string) => {
    if (activeMenu === menu) {
      setActiveMenu(null)
    } else {
      setActiveMenu(menu)
    }
  }

  if (!mounted) return null

  return (
    <motion.div
      className={`flex h-10 w-full items-center px-4 backdrop-blur-xl fixed top-0 left-0 z-[10000] border-b ${
        theme === "dark" 
          ? "bg-black/20 text-white border-white/10" 
          : "bg-white/20 text-black border-black/10"
      }`}
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)'
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
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Sleep
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Restart...
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Shut Down...
              </div>
              <div className={`my-1 border-t ${theme === "dark" ? "border-gray-700" : ""}`}></div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Lock Screen
              </div>
              <div
                className={`rounded px-3 py-1 ${theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-500 hover:text-white"}`}
              >
                Log Out...
              </div>
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
