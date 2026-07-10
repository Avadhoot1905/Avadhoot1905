"use client"

import React, { ReactElement, useState, useEffect, useRef } from "react"
import { motion, PanInfo } from "framer-motion"
import { useTheme } from "next-themes"

export interface AppIconProps {
  id?: string
  name: string
  icon: ReactElement
  onClick?: (e: React.MouseEvent) => void
  onDoubleClick?: (e: React.MouseEvent) => void
  isSelected?: boolean
  x?: number
  y?: number
  onDragEnd?: (id: string, newX: number, newY: number) => void
}

export const AppIcon: React.FC<AppIconProps> = React.memo(({
  id = "",
  name,
  icon,
  onClick,
  onDoubleClick,
  isSelected = false,
  x,
  y,
  onDragEnd,
}) => {
  const { theme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)
  const wasDraggedRef = useRef(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const isDesktopPositioned = !isMobile && typeof x === "number" && typeof y === "number"

  const handleDragStart = () => {
    wasDraggedRef.current = false
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dist = Math.hypot(info.offset.x, info.offset.y)
    if (dist > 5) {
      wasDraggedRef.current = true
      if (isDesktopPositioned && onDragEnd && typeof x === "number" && typeof y === "number") {
        onDragEnd(id, x + info.offset.x, y + info.offset.y)
      }
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false
      return
    }
    if (isMobile) {
      // On mobile, single tap opens the app directly
      if (onDoubleClick) {
        onDoubleClick(e)
      } else if (onClick) {
        onClick(e)
      }
      return
    }
    // On desktop, single click selects
    onClick?.(e)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isMobile) return
    e.stopPropagation()
    onDoubleClick?.(e)
  }

  // Mobile layout - preserve exact original mobile behavior and styling
  if (isMobile || !isDesktopPositioned) {
    return (
      <motion.div
        className="flex flex-col items-center cursor-pointer select-none"
        onClick={handleClick}
        whileHover={{ scale: isMobile ? 1 : 1.05 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          className="mb-1 drop-shadow-xl"
          whileHover={isMobile ? {} : { y: -5, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div
            className={`flex items-center justify-center ${
              isMobile ? "h-14 w-14 text-4xl" : "h-14 w-14 text-4xl"
            }`}
          >
            {icon}
          </div>
        </motion.div>
        <div
          className={`rounded px-1 py-0.5 text-center ${
            isMobile ? "text-[10px] max-w-[60px] leading-tight" : "text-xs"
          } ${theme === "dark" ? "text-white" : "text-black"} truncate`}
          style={{
            textShadow: isMobile
              ? theme === "dark"
                ? "0 1px 2px rgba(0,0,0,0.8)"
                : "0 1px 2px rgba(255,255,255,0.8)"
              : "none",
          }}
        >
          {name}
        </div>
      </motion.div>
    )
  }

  // Desktop macOS Sonoma/Sequoia icon layout
  return (
    <motion.div
      className="absolute flex w-[88px] flex-col items-center select-none cursor-pointer group"
      style={{
        left: 0,
        top: 0,
        zIndex: isSelected ? 30 : 10,
      }}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      drag
      dragMomentum={false}
      dragElastic={0.08}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      whileHover={{ y: y - 2 }}
    >
      <div
        className={`relative mb-1.5 flex h-[60px] w-[60px] items-center justify-center transition-all duration-200 drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] group-hover:scale-105 group-hover:brightness-105 group-hover:drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)] ${
          isSelected ? "ring-2 ring-blue-500/70 rounded-[14px] brightness-105" : ""
        }`}
        style={{ width: 60, height: 60 }}
      >
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          {icon}
        </div>
      </div>

      {/* App Name Label */}
      <div
        className={`max-w-[86px] truncate rounded-[5px] px-1.5 py-0.5 text-center text-[11px] leading-tight transition-colors duration-150 ${
          isSelected
            ? "bg-[#0058d0] font-medium text-white shadow-sm"
            : "font-normal text-white drop-shadow-[0_1px_2.5px_rgba(0,0,0,0.85)]"
        }`}
      >
        {name}
      </div>
    </motion.div>
  )
})

AppIcon.displayName = "AppIcon"
