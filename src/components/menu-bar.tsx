"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

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
      className={`flex h-10 w-full items-center px-4 backdrop-blur-md ${
        theme === "dark" ? "bg-gray-900/80 text-white" : "bg-gray-100/80 text-black"
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative mr-4">
        <button
          onClick={() => toggleMenu("apple")}
          className="flex h-6 w-6 items-center justify-center rounded-full text-xl font-bold"
        ></button>
        {activeMenu === "apple" && (
          <motion.div
            className={`absolute left-0 top-full z-50 mt-1 w-56 rounded-md shadow-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
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
          className={`flex items-center rounded px-2 py-1 text-sm font-medium ${
            activeMenu === "file"
              ? "bg-blue-500 text-white"
              : theme === "dark"
                ? "hover:bg-gray-700"
                : "hover:bg-gray-200"
          }`}
        >
          File <ChevronDown className="ml-1 h-3 w-3" />
        </button>
        {activeMenu === "file" && (
          <motion.div
            className={`absolute left-0 top-full z-50 mt-1 w-56 rounded-md shadow-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
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
          className={`flex items-center rounded px-2 py-1 text-sm font-medium ${
            activeMenu === "edit"
              ? "bg-blue-500 text-white"
              : theme === "dark"
                ? "hover:bg-gray-700"
                : "hover:bg-gray-200"
          }`}
        >
          Edit <ChevronDown className="ml-1 h-3 w-3" />
        </button>
        {activeMenu === "edit" && (
          <motion.div
            className={`absolute left-0 top-full z-50 mt-1 w-56 rounded-md shadow-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
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
          className={`flex items-center rounded px-2 py-1 text-sm font-medium ${
            activeMenu === "view"
              ? "bg-blue-500 text-white"
              : theme === "dark"
                ? "hover:bg-gray-700"
                : "hover:bg-gray-200"
          }`}
        >
          View <ChevronDown className="ml-1 h-3 w-3" />
        </button>
        {activeMenu === "view" && (
          <motion.div
            className={`absolute left-0 top-full z-50 mt-1 w-56 rounded-md shadow-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
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
          className={`flex items-center rounded-full p-1 ${
            theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-700"
          }`}
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
            className={`absolute right-0 top-full z-50 mt-1 w-32 rounded-md shadow-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
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
        <div className={`rounded-full px-2 py-1 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>100%</div>
        <div>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
      </div>
    </motion.div>
  )
}
