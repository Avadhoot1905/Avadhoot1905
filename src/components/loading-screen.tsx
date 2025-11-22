"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { SiApple } from "react-icons/si"

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Preload background images and other assets
    const imagesToPreload = [
      '/assets/v-dark.jpg',
      '/assets/v-light.jpg',
      '/assets/lock-screen-phone.jpeg',
      '/assets/tahoejpg.webp'
    ]

    imagesToPreload.forEach(src => {
      const img = new Image()
      img.src = src
    })

    // Progress animation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer)
          return 100
        }
        return prev + 2 // Increase by 2% every 160ms to reach 100% in ~8 seconds
      })
    }, 160)

    // Complete loading after 8 seconds
    const loadingTimer = setTimeout(() => {
      onLoadingComplete()
    }, 8000)

    return () => {
      clearInterval(progressTimer)
      clearTimeout(loadingTimer)
      window.removeEventListener('resize', checkMobile)
    }
  }, [onLoadingComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Apple Logo */}
      <motion.div
        className="mb-16"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <SiApple className={`text-white ${isMobile ? 'text-8xl' : 'text-9xl'}`} />
      </motion.div>

      {/* Loading Bar Container */}
      <motion.div
        className={`relative ${isMobile ? 'w-64' : 'w-80'} h-1 bg-gray-800 rounded-full overflow-hidden`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        {/* Loading Bar */}
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-300 to-white rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
        
        {/* Shimmer Effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: progress > 0 ? ["-100%", "200%"] : "-100%"
          }}
          transition={{
            duration: 1.5,
            repeat: progress < 100 ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Boot Text */}
      <motion.div
        className={`mt-8 text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} font-mono tracking-wider`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        {progress < 30 && "Initializing System..."}
        {progress >= 30 && progress < 60 && "Loading Resources..."}
        {progress >= 60 && progress < 90 && "Preparing Interface..."}
        {progress >= 90 && "Starting macOS..."}
      </motion.div>

      {/* Progress Percentage */}
      <motion.div
        className={`mt-2 text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'} font-mono`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.5 }}
      >
        {Math.round(progress)}%
      </motion.div>
    </motion.div>
  )
}
