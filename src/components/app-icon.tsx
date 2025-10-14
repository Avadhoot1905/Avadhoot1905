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
        className={`mb-1 rounded-xl p-2 shadow-xl backdrop-blur-xl border ${
          theme === "dark" 
            ? "bg-black/20 hover:bg-black/30 border-white/10" 
            : "bg-white/20 hover:bg-white/30 border-black/10"
        }`}
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="h-12 w-12 flex items-center justify-center text-3xl">
          {icon}
        </div>
      </motion.div>
      <div
        className={`rounded px-2 py-0.5 text-center text-xs ${
          theme === "dark" ? "text-white" : "text-black"
        }`}
      >
        {name}
      </div>
    </motion.div>
  )
}
