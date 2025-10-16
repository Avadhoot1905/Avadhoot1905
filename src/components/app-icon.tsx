"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { ReactElement, useState, useEffect } from "react"

interface AppIconProps {
  name: string
  icon: ReactElement
  onClick: () => void
}

export function AppIcon({ name, icon, onClick }: AppIconProps) {
  const { theme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer select-none"
      onClick={onClick}
      whileHover={{ scale: isMobile ? 1 : 1.05 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className={`mb-1 shadow-xl backdrop-blur-xl border ${
          isMobile 
            ? 'rounded-2xl p-2' 
            : 'rounded-xl p-2'
        } ${
          theme === "dark" 
            ? "bg-black/20 hover:bg-black/30 border-white/10" 
            : "bg-white/20 hover:bg-white/30 border-black/10"
        }`}
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}
        whileHover={isMobile ? {} : { y: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className={`flex items-center justify-center ${
          isMobile ? 'h-11 w-11 text-3xl' : 'h-12 w-12 text-3xl'
        }`}>
          {icon}
        </div>
      </motion.div>
      <div
        className={`rounded px-1 py-0.5 text-center ${
          isMobile ? 'text-[10px] max-w-[60px] leading-tight' : 'text-xs'
        } ${
          theme === "dark" ? "text-white" : "text-black"
        } truncate`}
        style={{
          textShadow: isMobile 
            ? theme === "dark" 
              ? '0 1px 2px rgba(0,0,0,0.8)' 
              : '0 1px 2px rgba(255,255,255,0.8)'
            : 'none'
        }}
      >
        {name}
      </div>
    </motion.div>
  )
}
