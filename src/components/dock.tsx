"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

interface DockProps {
  apps: {
    id: string
    icon: string
    isOpen: boolean
  }[]
  onAppClick: (appId: string) => void
}

export function Dock({ apps, onAppClick }: DockProps) {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)
  const { theme } = useTheme()

  return (
    <div className="fixed bottom-0 left-0 right-0 flex h-16 items-end justify-center">
      <motion.div
        className={`mb-2 flex h-16 items-end rounded-2xl p-1 backdrop-blur-lg ${
          theme === "dark" ? "bg-gray-800/20" : "bg-white/20"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence>
          {apps.map((app) => (
            <motion.div
              key={app.id}
              className="relative mx-1 flex items-center justify-center"
              whileHover={{ scale: 1.2, y: -10 }}
              onClick={() => onAppClick(app.id)}
              onMouseEnter={() => setHoveredApp(app.id)}
              onMouseLeave={() => setHoveredApp(null)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative">
                <img src={app.icon || "/placeholder.svg"} alt={app.id} className="h-12 w-12 rounded-xl" />
                {app.isOpen && (
                  <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gray-400"></div>
                )}
              </div>
              {hoveredApp === app.id && (
                <motion.div
                  className={`absolute -top-8 whitespace-nowrap rounded px-2 py-1 text-xs ${
                    theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-800/80 text-white"
                  }`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                >
                  {app.id.charAt(0).toUpperCase() + app.id.slice(1)}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
