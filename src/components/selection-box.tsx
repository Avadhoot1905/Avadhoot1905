"use client"

import React from "react"

export interface SelectionRect {
  left: number
  top: number
  width: number
  height: number
}

interface SelectionBoxProps {
  rect: SelectionRect | null
}

export const SelectionBox: React.FC<SelectionBoxProps> = React.memo(({ rect }) => {
  if (!rect || (rect.width <= 2 && rect.height <= 2)) {
    return null
  }

  return (
    <div
      className="pointer-events-none absolute z-40 rounded-sm border border-blue-400/60 bg-blue-500/20 backdrop-blur-[1px] transition-none"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }}
    />
  )
})

SelectionBox.displayName = "SelectionBox"
