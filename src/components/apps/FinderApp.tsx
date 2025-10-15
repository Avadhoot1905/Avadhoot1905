"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { FaFilePdf } from "react-icons/fa"

export function FinderApp() {
  const { theme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b dark:border-gray-700">
        {/* Sidebar - Hidden on mobile */}
        {!isMobile && (
          <div
            className={`w-48 border-r p-2 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-100"}`}
          >
            <div className={`mb-1 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>Favorites</div>
            <div className={`pl-2 text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
              <div className="mb-1">Applications</div>
              <div className="mb-1">Documents</div>
              <div className="mb-1">Downloads</div>
              <div className="mb-1">Pictures</div>
            </div>
          </div>
        )}
        <div className="flex-1 p-2">
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-4'}`}>
            <div 
              className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open("https://drive.google.com/file/d/167McD9-TBCpfFsy8p4Iv-8T1dOKvGkO_/view?usp=drive_link", "_blank")}
            >
              <div className="h-16 w-16 rounded flex items-center justify-center">
                <FaFilePdf className="text-4xl text-red-500" />
              </div>
              <div className={`mt-1 text-xs ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>Resume.pdf</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
