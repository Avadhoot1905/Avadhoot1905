"use client"

import { useTheme } from "next-themes"

export function PhotosApp() {
  const { theme } = useTheme()

  return (
    <div className="flex h-full flex-col">
      <div className={`border-b p-2 ${theme === "dark" ? "border-gray-700" : ""}`}>
        <div className="flex space-x-4">
          <div className={`text-sm font-medium ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`}>
            Photos
          </div>
          <div className="text-sm">Memories</div>
          <div className="text-sm">Albums</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="mb-2 text-lg font-semibold">Recents</h2>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}
