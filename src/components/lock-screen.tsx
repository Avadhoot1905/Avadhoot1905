"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

interface LockScreenProps {
  isLocked: boolean
  onUnlock: () => void
}

export function LockScreen({ isLocked, onUnlock }: LockScreenProps) {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleClick = () => {
    onUnlock()
  }

  if (!mounted) return null

  if (!isLocked) return null

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <motion.div
      className="fixed inset-0 z-[20000] flex flex-col items-center justify-center cursor-pointer"
      style={{
        backgroundImage: 'url(/assets/tahoejpg.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      initial={{ y: '-100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 20,
        duration: 0.8 
      }}
      onClick={handleClick}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Time display at top */}
      <motion.div
        className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="text-8xl font-bold tracking-wide text-white/80 mb-2">
          {formatTime(currentTime)}
        </div>
        <div className="text-2xl font-bold text-white/70">
          {formatDate(currentTime)}
        </div>
      </motion.div>

      {/* Bottom section with unlock prompt and macOS branding */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-white z-10">
        {/* Unlock instruction */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="text-lg font-light mb-2">
            Click anywhere to unlock
          </div>
          <motion.div
            className="inline-block"
            animate={{ y: [0, -5, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2" />
            </div>
          </motion.div>
        </motion.div>

        {/* Glassmorphic branding panel */}
        <div 
          className="px-6 py-3 rounded-2xl backdrop-blur-xl border border-white/20"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)'
          }}
        >
          <div className="text-white/80 text-sm font-light">
            macOS Tahoe
          </div>
        </div>
      </div>
    </motion.div>
  )
}
