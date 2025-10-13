"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { ReactElement } from "react"

interface AppIconProps {
  id: string
  name: string
  icon: ReactElement
  onClick: () => void
}

export function AppIcon({ id, name, icon, onClick }: AppIconProps) {
  const { theme } = useTheme()

  return (
    <motion.div
      className="flex flex-col items-center"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`mb-1 rounded-xl p-2 shadow-sm backdrop-blur-sm ${
          theme === "dark" ? "bg-gray-800/50 hover:bg-gray-700/70" : "bg-white/50 hover:bg-white/70"
        }`}
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="h-12 w-12 flex items-center justify-center text-3xl">
          {icon}
        </div>
      </motion.div>
      <div
        className={`rounded px-2 py-0.5 text-center text-xs backdrop-blur-sm ${
          theme === "dark" ? "bg-black/40 text-white" : "bg-black/20 text-white"
        }`}
      >
        {name}
      </div>
    </motion.div>
  )
}
