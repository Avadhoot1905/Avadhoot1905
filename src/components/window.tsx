"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Rnd } from "react-rnd"
import { X } from "lucide-react"
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
  onMinimize?: () => void
  isMinimized?: boolean
  initialPosition: Position
  initialSize: Size
  bounds?: string
}

export function Window({
  title,
  children,
  isActive,
  onActivate,
  onClose,
  onMinimize,
  isMinimized = false,
  initialPosition,
  initialSize,
  bounds = "#desktop-window-area",
}: WindowProps) {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [isGame2048Locked, setIsGame2048Locked] = useState(false)
  const [position, setPosition] = useState<Position>(initialPosition)
  const [size, setSize] = useState<Size>(initialSize)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const preFullScreenRectRef = useRef<{ position: Position; size: Size } | null>(null)
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

  useEffect(() => {
    const handle2048LockChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ locked?: boolean }>
      setIsGame2048Locked(Boolean(customEvent.detail?.locked))
    }

    window.addEventListener("game2048-lock-change", handle2048LockChange as EventListener)
    return () => {
      window.removeEventListener("game2048-lock-change", handle2048LockChange as EventListener)
    }
  }, [])

  const toggleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      preFullScreenRectRef.current = { position, size }
      setPosition({ x: 0, y: 36 })
      setSize({
        width: window.innerWidth,
        height: window.innerHeight - 36,
      })
      setIsFullScreen(true)
    } else {
      if (preFullScreenRectRef.current) {
        setPosition(preFullScreenRectRef.current.position)
        setSize(preFullScreenRectRef.current.size)
      } else {
        setPosition(initialPosition)
        setSize(initialSize)
      }
      setIsFullScreen(false)
    }
  }, [isFullScreen, position, size, initialPosition, initialSize])

  useEffect(() => {
    const handleResize = () => {
      if (isFullScreen) {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight - 36,
        })
      } else {
        setSize((prev) => ({
          width: Math.min(prev.width, window.innerWidth - 20),
          height: Math.min(prev.height, window.innerHeight - 60),
        }))
        setPosition((prev) => ({
          x: Math.max(0, Math.min(prev.x, window.innerWidth - Math.min(size.width, window.innerWidth - 20))),
          y: Math.max(36, Math.min(prev.y, window.innerHeight - 80)),
        }))
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isFullScreen, size.width])

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

  if (isMinimized) {
    return (
      <div style={{ display: "none" }}>
        {children}
      </div>
    )
  }

  // Mobile iOS-style modal
  if (isMobile) {
    const disableDrag = title === "2048" && isGame2048Locked

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
          data-window="true"
          onPointerDown={(e) => e.stopPropagation()}
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
          drag={disableDrag ? false : "y"}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          dragMomentum={false}
          onDragEnd={disableDrag ? undefined : handleDragEnd}
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
      position={position}
      size={size}
      onDragStop={(_e, d) => {
        if (!isFullScreen) {
          setPosition({ x: d.x, y: d.y })
        }
      }}
      onResizeStop={(_e, _direction, ref, _delta, pos) => {
        if (!isFullScreen) {
          setSize({ width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) })
          setPosition(pos)
        }
      }}
      minWidth={300}
      minHeight={200}
      bounds={bounds}
      dragHandleClassName="window-drag-handle"
      onMouseDown={onActivate}
      disableDragging={isFullScreen}
      enableResizing={!isFullScreen}
      style={{ 
        zIndex: isFullScreen ? 60 : isActive ? 40 : 20 
      }}
    >
      <motion.div
        data-window="true"
        onPointerDown={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: isActive ? 1 : 0.98, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        style={{ transition: 'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease' }}
        className={`h-full w-full overflow-hidden transition-all duration-200 ${
          isFullScreen ? "rounded-none border-0" : "rounded-2xl border"
        } ${
          isActive
            ? "shadow-[0_22px_55px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
            : "shadow-[0_10px_30px_rgba(0,0,0,0.22)]"
        } ${
          theme === "dark"
            ? `border-gray-700/80 bg-gray-900/95`
            : `border-gray-200/90 bg-white/95`
        }`}
        onMouseDown={onActivate}
      >
        <div
          onDoubleClick={toggleFullScreen}
          style={{ transition: 'background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease' }}
          className={`flex h-9 items-center px-3.5 select-none border-b ${
            theme === "dark"
              ? isActive
                ? "bg-[#1f1f21]/95 text-gray-200 border-gray-700/60"
                : "bg-[#1a1a1c]/70 text-gray-400 border-gray-800/50"
              : isActive
                ? "bg-[#f1f1f3]/95 text-gray-800 border-gray-300/60"
                : "bg-[#e8e8ea]/70 text-gray-500 border-gray-200/50"
          }`}
        >
          <div className="flex items-center gap-2 z-10 group/traffic">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className={`relative flex h-3 w-3 items-center justify-center rounded-full transition-all duration-150 overflow-hidden ${
                isActive
                  ? "bg-[#FF5F56] hover:brightness-105 border border-[#E0443E]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  : "bg-gray-400/60 dark:bg-gray-600/60 border border-gray-400/40 dark:border-gray-500/40 group-hover/traffic:bg-[#FF5F56] group-hover/traffic:border-[#E0443E]/80"
              }`}
              title="Close"
            >
              <svg
                className="w-2 h-2 text-[#4c0000] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150 stroke-current flex-shrink-0"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 3L9 9M9 3L3 9"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onMinimize) {
                  onMinimize()
                } else {
                  onClose()
                }
              }}
              className={`relative flex h-3 w-3 items-center justify-center rounded-full transition-all duration-150 overflow-hidden ${
                isActive
                  ? "bg-[#FFBD2E] hover:brightness-105 border border-[#DEA123]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                  : "bg-gray-400/60 dark:bg-gray-600/60 border border-gray-400/40 dark:border-gray-500/40 group-hover/traffic:bg-[#FFBD2E] group-hover/traffic:border-[#DEA123]/80"
              }`}
              title="Minimize"
            >
              <svg
                className="w-2 h-2 text-[#5c3b00] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150 stroke-current flex-shrink-0"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.5 6H9.5"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFullScreen()
              }}
              className={`relative flex h-3 w-3 items-center justify-center rounded-full transition-all duration-150 overflow-hidden ${
                isActive
                  ? "bg-[#28C840] hover:brightness-105 border border-[#1AAB29]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  : "bg-gray-400/60 dark:bg-gray-600/60 border border-gray-400/40 dark:border-gray-500/40 group-hover/traffic:bg-[#28C840] group-hover/traffic:border-[#1AAB29]/80"
              }`}
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullScreen ? (
                <svg
                  className="w-2 h-2 text-[#003800] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150 fill-current flex-shrink-0"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5.8 5.8H1.8L5.8 1.8V5.8ZM6.2 6.2H10.2L6.2 10.2V6.2Z" />
                </svg>
              ) : (
                <svg
                  className="w-2 h-2 text-[#003800] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150 fill-current flex-shrink-0"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2.2 2.2H6.2L2.2 6.2V2.2ZM9.8 9.8H5.8L9.8 5.8V9.8Z" />
                </svg>
              )}
            </button>
          </div>
          <div className="window-drag-handle flex-1 text-center text-xs font-medium cursor-move h-full flex items-center justify-center tracking-tight">
            {title}
          </div>
          <div className="w-14"></div>
        </div>
        <div 
          className={`h-[calc(100%-2.25rem)] overflow-auto ${
            theme === "dark" ? "text-gray-200" : "text-gray-900"
          }`}
          style={{ pointerEvents: 'auto', userSelect: 'auto' }}
          onMouseDown={(e) => {
            e.stopPropagation()
            onActivate()
          }}
        >
          {children}
        </div>
      </motion.div>
    </Rnd>
  )
}
