"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Rnd } from "react-rnd"
import { X, Minus, Square } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

interface WindowProps {
  title: string
  children: React.ReactNode
  isActive: boolean
  onActivate: () => void
  onClose: () => void
  initialPosition: Position
  initialSize: Size
  
}

export function Window({
  title,
  children,
  isActive,
  onActivate,
  onClose,
  initialPosition,
  initialSize,
}: WindowProps) {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [dragY, setDragY] = useState(0)
  const { theme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle drag to dismiss on mobile
  const handleDragEnd = (_event: unknown, info: { offset: { y: number } }) => {
    // If dragged down more than 150px, close the modal
    if (info.offset.y > 150) {
      onClose()
    } else {
      // Reset position if not enough drag
      setDragY(0)
    }
  }

  if (!mounted) return null

  // Mobile iOS-style modal
  if (isMobile) {
    return (
      <motion.div
        className="fixed inset-0 flex items-end md:items-center justify-center p-0"
        style={{ zIndex: isActive ? 100 : 90 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        {/* Modal Content */}
        <motion.div
          className={`relative w-full h-[90vh] flex flex-col backdrop-blur-xl border-t ${
            theme === "dark"
              ? "border-gray-700 bg-gray-900/95"
              : "border-gray-300 bg-white/95"
          }`}
          style={{
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          }}
          initial={{ y: '100%' }}
          animate={{ y: dragY }}
          exit={{ y: '100%' }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          onClick={(e) => e.stopPropagation()}
        >
          {/* iOS-style handle - Draggable area */}
          <div className="flex justify-center pt-2 pb-3 cursor-grab active:cursor-grabbing touch-none">
            <div className={`w-10 h-1 rounded-full ${
              theme === "dark" ? "bg-gray-600" : "bg-gray-400"
            }`} />
          </div>
          
          {/* Header */}
          <div
            className={`flex h-12 items-center px-4 border-b flex-shrink-0 ${
              theme === "dark" ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <div className="flex-1"></div>
            <div className={`text-base font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>{title}</div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={onClose}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  theme === "dark" 
                    ? "bg-gray-800 hover:bg-gray-700 text-white" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Content - Non-draggable */}
          <div 
            className={`flex-1 overflow-auto ${
              theme === "dark" ? "text-gray-200" : "text-gray-900"
            }`}
            style={{ pointerEvents: 'auto', userSelect: 'auto' }}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Desktop window
  return (
    <Rnd
      default={{
        x: initialPosition.x,
        y: initialPosition.y,
        width: initialSize.width,
        height: initialSize.height,
      }}
      minWidth={300}
      minHeight={200}
      bounds="window"
      dragHandleClassName="window-drag-handle"
      onMouseDown={onActivate}
      style={{ 
        zIndex: isActive ? 20 : 10 
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={{ transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease' }}
        className={`h-full w-full overflow-hidden rounded-2xl border shadow-lg ${
          theme === "dark"
            ? `border-gray-700 bg-gray-800 ${isActive ? "shadow-xl" : ""}`
            : `border-gray-200 bg-white ${isActive ? "shadow-xl" : ""}`
        }`}
      >
        <div
          style={{ transition: 'background-color 0.3s ease' }}
          className={`flex h-8 items-center px-3 ${
            theme === "dark" ? (isActive ? "bg-gray-700" : "bg-gray-800") : isActive ? "bg-gray-200" : "bg-gray-100"
          }`}
        >
          <div className="flex space-x-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-red-500 hover:text-white z-10"
            >
              <X className="h-2 w-2" />
            </button>
            <button className="flex h-3 w-3 items-center justify-center rounded-full bg-yellow-500 text-yellow-500 hover:text-white z-10">
              <Minus className="h-2 w-2" />
            </button>
            <button className="flex h-3 w-3 items-center justify-center rounded-full bg-green-500 text-green-500 hover:text-white z-10">
              <Square className="h-2 w-2" />
            </button>
          </div>
          <div className={`window-drag-handle flex-1 text-center text-xs font-medium cursor-move h-full flex items-center justify-center ${
            theme === "dark" ? "text-gray-200" : "text-gray-700"
          }`}>{title}</div>
          <div className="w-16"></div>
        </div>
        <div 
          className={`h-[calc(100%-2rem)] overflow-auto ${
            theme === "dark" ? "text-gray-200" : "text-gray-900"
          }`}
          style={{ pointerEvents: 'auto', userSelect: 'auto' }}
          onMouseDown={(e) => {
            e.stopPropagation()
            onActivate()
          }}
        >{children}</div>
      </motion.div>
    </Rnd>
  )
}
