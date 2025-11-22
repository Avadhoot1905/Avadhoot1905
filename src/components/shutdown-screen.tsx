"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { SiApple } from "react-icons/si"

interface ShutdownScreenProps {
  onShutdownComplete: () => void
  action: 'shutdown' | 'restart'
}

export function ShutdownScreen({ onShutdownComplete, action }: ShutdownScreenProps) {
  const [dots, setDots] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Animate dots
    const dotsTimer = setInterval(() => {
      setDots(prev => (prev + 1) % 4)
    }, 500)

    // Complete shutdown after 3.5 seconds
    const shutdownTimer = setTimeout(() => {
      onShutdownComplete()
    }, 3500)

    return () => {
      clearInterval(dotsTimer)
      clearTimeout(shutdownTimer)
      window.removeEventListener('resize', checkMobile)
    }
  }, [onShutdownComplete])

  const getDotsString = () => {
    return '.'.repeat(dots)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Apple Logo */}
      <motion.div
        className="mb-12"
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 0.9, opacity: 0.8 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <SiApple className={`text-white ${isMobile ? 'text-6xl' : 'text-7xl'}`} />
      </motion.div>

      {/* Shutdown/Restart Text */}
      <motion.div
        className={`text-white ${isMobile ? 'text-lg' : 'text-xl'} font-light tracking-wide text-center`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {action === 'shutdown' ? 'Shutting down' : 'Restarting'}{getDotsString()}
      </motion.div>

      {/* Subtle fade animation */}
      <motion.div
        className="absolute inset-0 bg-black"
        animate={{ opacity: [0, 0.1, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  )
}
