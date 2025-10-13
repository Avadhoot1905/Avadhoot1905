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
  id: string
  title: string
  children: React.ReactNode
  isActive: boolean
  onActivate: () => void
  onClose: () => void
  initialPosition: Position
  initialSize: Size
  
}

export function Window({
  id,
  title,
  children,
  isActive,
  onActivate,
  onClose,
  initialPosition,
  initialSize,
}: WindowProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

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
        zIndex: isActive ? 10 : 5 
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`h-full w-full overflow-hidden rounded-2xl border shadow-lg ${
          theme === "dark"
            ? `border-gray-700 bg-gray-800 ${isActive ? "shadow-xl" : ""}`
            : `border-gray-200 bg-white ${isActive ? "shadow-xl" : ""}`
        }`}
      >
        <div
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
          <div className="window-drag-handle flex-1 text-center text-xs font-medium cursor-move h-full flex items-center justify-center">{title}</div>
          <div className="w-16"></div>
        </div>
        <div className="h-[calc(100%-2rem)] overflow-auto">{children}</div>
      </motion.div>
    </Rnd>
  )
}
