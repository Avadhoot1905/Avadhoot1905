"use client"

import React, { useEffect } from "react"
import { useTheme } from "next-themes"

export interface ContextMenuPosition {
  x: number
  y: number
}

interface ContextMenuProps {
  position: ContextMenuPosition | null
  onClose: () => void
  onCleanUp?: () => void
  onSortByName?: () => void
  onOpenAbout?: () => void
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  onClose,
  onCleanUp,
  onSortByName,
  onOpenAbout,
}) => {
  const { theme } = useTheme()

  useEffect(() => {
    if (!position) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    const handleClickOutside = () => {
      onClose()
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("click", handleClickOutside)
    window.addEventListener("contextmenu", handleClickOutside)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("click", handleClickOutside)
      window.removeEventListener("contextmenu", handleClickOutside)
    }
  }, [position, onClose])

  if (!position) return null

  const isDark = theme === "dark"

  return (
    <div
      data-context-menu="true"
      onPointerDown={(e) => e.stopPropagation()}
      className={`fixed z-50 min-w-[210px] select-none rounded-xl border p-1.5 shadow-2xl transition-opacity duration-100 ${
        isDark
          ? "border-white/15 bg-gray-900/80 text-gray-100"
          : "border-black/10 bg-white/80 text-gray-800"
      }`}
      style={{
        left: Math.min(position.x, typeof window !== "undefined" ? window.innerWidth - 230 : position.x),
        top: Math.min(position.y, typeof window !== "undefined" ? window.innerHeight - 240 : position.y),
        backdropFilter: "blur(28px) saturate(190%)",
        WebkitBackdropFilter: "blur(28px) saturate(190%)",
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <div className="flex flex-col space-y-0.5 text-xs font-medium">
        <button
          onClick={() => {
            onClose()
          }}
          className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-blue-500 hover:text-white"
        >
          <span>New Folder</span>
        </button>
        <hr className={`my-1 ${isDark ? "border-white/10" : "border-black/10"}`} />
        <button
          onClick={() => {
            onSortByName?.()
            onClose()
          }}
          className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-blue-500 hover:text-white"
        >
          <span>Sort By Name</span>
        </button>
        <button
          onClick={() => {
            onCleanUp?.()
            onClose()
          }}
          className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-blue-500 hover:text-white"
        >
          <span>Clean Up</span>
        </button>
        <hr className={`my-1 ${isDark ? "border-white/10" : "border-black/10"}`} />
        <button
          onClick={() => {
            onOpenAbout?.()
            onClose()
          }}
          className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-blue-500 hover:text-white"
        >
          <span>About This Portfolio</span>
        </button>
      </div>
    </div>
  )
}
