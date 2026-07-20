"use client"

import React, { ReactElement, useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import gsap from "gsap"
import { Draggable } from "gsap/all"

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
  const [isDragging, setIsDragging] = useState(false)
  const wasDraggedRef = useRef(false)
  const iconRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)
  const isDraggingRef = useRef(false)
  const draggableRef = useRef<Draggable[] | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const isDesktopPositioned = !isMobile && typeof x === "number" && typeof y === "number"

  useEffect(() => {
    if (isMobile || !isDesktopPositioned || !iconRef.current || typeof x !== "number" || typeof y !== "number") return

    if (!isInitializedRef.current) {
      gsap.set(iconRef.current, { x, y })
      isInitializedRef.current = true
    } else if (!isDraggingRef.current) {
      gsap.to(iconRef.current, {
        x,
        y,
        duration: 0.38,
        ease: "power3.out",
        overwrite: "auto",
      })
    }
  }, [x, y, isMobile, isDesktopPositioned])

  useEffect(() => {
    if (isMobile || typeof window === "undefined" || !iconRef.current || !isDesktopPositioned) return

    gsap.registerPlugin(Draggable)

    const draggable = Draggable.create(iconRef.current, {
      type: "x,y",
      edgeResistance: 0.75,
      cursor: "pointer",
      activeCursor: "grabbing",
      onPress: function () {
        wasDraggedRef.current = false
        isDraggingRef.current = true
        setIsDragging(true)
        gsap.to(iconRef.current, {
          scale: 1.05,
          zIndex: 40,
          duration: 0.15,
          ease: "power2.out",
          overwrite: "auto",
        })
      },
      onDragStart: function () {
        wasDraggedRef.current = false
      },
      onRelease: function () {
        isDraggingRef.current = false
        setIsDragging(false)
        gsap.to(iconRef.current, {
          scale: 1,
          zIndex: isSelected ? 30 : 10,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
        })

        const dist = Math.hypot(this.x - this.startX, this.y - this.startY)
        if (dist > 5) {
          wasDraggedRef.current = true
          if (onDragEnd && typeof x === "number" && typeof y === "number") {
            onDragEnd(id, this.x, this.y)
          }
        } else {
          gsap.to(iconRef.current, {
            x,
            y,
            duration: 0.3,
            ease: "power3.out",
            overwrite: "auto",
          })
        }
      },
    })

    draggableRef.current = draggable

    return () => {
      draggable.forEach((d) => d.kill())
      draggableRef.current = null
    }
  }, [isMobile, isDesktopPositioned, id, isSelected, x, y, onDragEnd])

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
        data-app-icon={id}
        onPointerDown={(e) => e.stopPropagation()}
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
    <div
      ref={iconRef}
      data-app-icon={id}
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute flex w-[88px] flex-col items-center select-none cursor-pointer group"
      style={{
        left: 0,
        top: 0,
        zIndex: isSelected || isDragging ? 30 : 10,
        transform: `translate3d(${x ?? 0}px, ${y ?? 0}px, 0px)`,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerEnter={() => {
        if (!isDraggingRef.current && iconRef.current && typeof y === "number") {
          gsap.to(iconRef.current, { y: y - 2, duration: 0.2, ease: "power2.out", overwrite: "auto" })
        }
      }}
      onPointerLeave={() => {
        if (!isDraggingRef.current && iconRef.current && typeof y === "number") {
          gsap.to(iconRef.current, { y, duration: 0.2, ease: "power2.out", overwrite: "auto" })
        }
      }}
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
    </div>
  )
})

AppIcon.displayName = "AppIcon"
