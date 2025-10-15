"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { ReactElement } from "react"

interface DockProps {
  apps: {
    id: string
    icon: ReactElement
    isOpen: boolean
  }[]
  onAppClick: (appId: string) => void
}

export function Dock({ apps, onAppClick }: DockProps) {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Filter apps for mobile: only gmail, github, linkedin, leetcode
  const displayApps = isMobile 
    ? apps.filter(app => ['gmail', 'github', 'linkedin', 'leetcode'].includes(app.id))
    : apps

  return (
    <div className={`fixed bottom-0 left-0 right-0 flex items-end justify-center z-50 ${
      isMobile ? 'h-20 pb-2' : 'h-16'
    }`}>
      <motion.div
        className={`flex items-end backdrop-blur-xl border ${
          theme === "dark" 
            ? "bg-black/20 border-white/10" 
            : "bg-white/20 border-black/10"
        } ${isMobile ? 'rounded-3xl px-4 py-2 mb-2' : 'rounded-2xl p-1 mb-2 h-16'}`}
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence>
          {displayApps.map((app) => (
            <motion.div
              key={app.id}
              className={`relative flex items-center justify-center ${
                isMobile ? 'mx-2' : 'mx-1'
              }`}
              whileHover={{ scale: isMobile ? 1.1 : 1.2, y: isMobile ? -5 : -10 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onAppClick(app.id)}
              onMouseEnter={() => setHoveredApp(app.id)}
              onMouseLeave={() => setHoveredApp(null)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative">
                <div 
                  className={`flex items-center justify-center backdrop-blur-xl border ${
                    theme === "dark" 
                      ? "bg-black/30 border-white/20" 
                      : "bg-white/30 border-black/20"
                  } ${isMobile ? 'h-14 w-14 rounded-2xl text-2xl' : 'h-12 w-12 rounded-xl text-3xl'}`}
                  style={{
                    backdropFilter: 'blur(15px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(15px) saturate(160%)'
                  }}
                >
                  {app.icon}
                </div>
                {app.isOpen && (
                  <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gray-400"></div>
                )}
              </div>
              {!isMobile && hoveredApp === app.id && (
                <motion.div
                  className={`absolute -top-8 whitespace-nowrap rounded px-2 py-1 text-xs backdrop-blur-xl border ${
                    theme === "dark" 
                      ? "bg-black/40 text-white border-white/20" 
                      : "bg-white/40 text-black border-black/20"
                  }`}
                  style={{
                    backdropFilter: 'blur(15px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(15px) saturate(160%)'
                  }}
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
