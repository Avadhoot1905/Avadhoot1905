"use client"

import { useState, useEffect } from "react"
import { MenuBar } from "@/components/menu-bar"
import { Dock } from "@/components/dock"
import { Window } from "@/components/window"
import { AppIcon } from "@/components/app-icon"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

export function MacOSDesktop() {
  const [openWindows, setOpenWindows] = useState<string[]>([])
  const [activeWindow, setActiveWindow] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleWindow = (appId: string) => {
    if (openWindows.includes(appId)) {
      setOpenWindows(openWindows.filter((id) => id !== appId))
      setActiveWindow(openWindows.length > 1 ? openWindows[0] : null)
    } else {
      setOpenWindows([...openWindows, appId])
      setActiveWindow(appId)
    }
  }

  const activateWindow = (appId: string) => {
    setActiveWindow(appId)
  }

  if (!mounted) return null

  return (
    <div
      className={`h-screen w-full overflow-hidden font-sans transition-colors duration-300
        ${
          theme === "dark"
            ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white"
            : "bg-gradient-to-b from-blue-100 to-blue-200 text-black"
        }`}
    >
      <MenuBar />

      <div className="relative h-[calc(100vh-2.5rem-4rem)] w-full overflow-hidden p-4">
        <motion.div
          className="grid grid-cols-6 gap-4 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          <AppIcon
            id="finder"
            name="Finder"
            icon="/placeholder.svg?height=60&width=60"
            onClick={() => toggleWindow("finder")}
          />
          <AppIcon
            id="safari"
            name="Safari"
            icon="/placeholder.svg?height=60&width=60"
            onClick={() => toggleWindow("safari")}
          />
          <AppIcon
            id="messages"
            name="Messages"
            icon="/placeholder.svg?height=60&width=60"
            onClick={() => toggleWindow("messages")}
          />
          <AppIcon
            id="photos"
            name="Photos"
            icon="/placeholder.svg?height=60&width=60"
            onClick={() => toggleWindow("photos")}
          />
        </motion.div>

        <AnimatePresence>
          {openWindows.includes("finder") && (
            <Window
              key="finder"
              id="finder"
              title="Finder"
              isActive={activeWindow === "finder"}
              onActivate={() => activateWindow("finder")}
              onClose={() => toggleWindow("finder")}
              initialPosition={{ x: 100, y: 100 }}
              initialSize={{ width: 600, height: 400 }}
            >
              <div className="flex h-full flex-col">
                <div className="flex border-b dark:border-gray-700">
                  <div
                    className={`w-48 border-r p-2 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-100"}`}
                  >
                    <div className="mb-1 font-semibold">Favorites</div>
                    <div className={`pl-2 text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                      <div className="mb-1">Applications</div>
                      <div className="mb-1">Documents</div>
                      <div className="mb-1">Downloads</div>
                      <div className="mb-1">Pictures</div>
                    </div>
                  </div>
                  <div className="flex-1 p-2">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-16 w-16 rounded bg-blue-500"></div>
                        <div className="mt-1 text-xs">Document.pdf</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-16 w-16 rounded bg-green-500"></div>
                        <div className="mt-1 text-xs">Spreadsheet.xlsx</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-16 w-16 rounded bg-yellow-500"></div>
                        <div className="mt-1 text-xs">Presentation.pptx</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Window>
          )}

          {openWindows.includes("safari") && (
            <Window
              key="safari"
              id="safari"
              title="Safari"
              isActive={activeWindow === "safari"}
              onActivate={() => activateWindow("safari")}
              onClose={() => toggleWindow("safari")}
              initialPosition={{ x: 150, y: 150 }}
              initialSize={{ width: 700, height: 500 }}
            >
              <div className="flex h-full flex-col">
                <div className={`flex items-center border-b p-2 ${theme === "dark" ? "border-gray-700" : ""}`}>
                  <div
                    className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                  >
                    <span className={theme === "dark" ? "text-gray-300" : "text-gray-500"}>←</span>
                  </div>
                  <div
                    className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                  >
                    <span className={theme === "dark" ? "text-gray-300" : "text-gray-500"}>→</span>
                  </div>
                  <div
                    className={`flex-1 rounded-full px-4 py-1 text-sm ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-500"}`}
                  >
                    https://www.example.com
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <h1 className="mb-4 text-2xl font-bold">Welcome to Example.com</h1>
                  <p className="mb-4">This is a sample webpage displayed in our macOS Safari browser simulation.</p>
                  <div className={`rounded p-4 ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.</p>
                  </div>
                </div>
              </div>
            </Window>
          )}

          {openWindows.includes("messages") && (
            <Window
              key="messages"
              id="messages"
              title="Messages"
              isActive={activeWindow === "messages"}
              onActivate={() => activateWindow("messages")}
              onClose={() => toggleWindow("messages")}
              initialPosition={{ x: 200, y: 200 }}
              initialSize={{ width: 500, height: 400 }}
            >
              <div className="flex h-full">
                <div className={`w-1/3 border-r ${theme === "dark" ? "border-gray-700" : ""}`}>
                  <div className={`border-b p-2 ${theme === "dark" ? "border-gray-700" : ""}`}>
                    <input
                      type="text"
                      placeholder="Search"
                      className={`w-full rounded-full px-3 py-1 text-sm ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100"}`}
                    />
                  </div>
                  <div className="p-2">
                    <div className={`mb-2 rounded p-2 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                      <div className="font-semibold">John Doe</div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Hey, how are you?
                      </div>
                    </div>
                    <div className={`mb-2 rounded p-2 ${theme === "dark" ? "bg-gray-700" : "bg-blue-50"}`}>
                      <div className="font-semibold">Jane Smith</div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Did you see the new update?
                      </div>
                    </div>
                    <div className={`mb-2 rounded p-2 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                      <div className="font-semibold">Team Chat</div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Meeting at 3pm
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col">
                  <div className={`border-b p-2 text-center ${theme === "dark" ? "border-gray-700" : ""}`}>
                    <div className="font-semibold">Jane Smith</div>
                    <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Online</div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-4 flex justify-start">
                      <div
                        className={`max-w-[70%] rounded-lg p-2 text-sm ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                      >
                        Hey there! How's your project going?
                      </div>
                    </div>
                    <div className="mb-4 flex justify-end">
                      <div className="max-w-[70%] rounded-lg bg-blue-500 p-2 text-sm text-white">
                        It's going well! Just working on the macOS interface.
                      </div>
                    </div>
                    <div className="mb-4 flex justify-start">
                      <div
                        className={`max-w-[70%] rounded-lg p-2 text-sm ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                      >
                        Did you see the new update?
                      </div>
                    </div>
                  </div>
                  <div className={`border-t p-2 ${theme === "dark" ? "border-gray-700" : ""}`}>
                    <input
                      type="text"
                      placeholder="iMessage"
                      className={`w-full rounded-full px-3 py-2 text-sm ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100"}`}
                    />
                  </div>
                </div>
              </div>
            </Window>
          )}

          {openWindows.includes("photos") && (
            <Window
              key="photos"
              id="photos"
              title="Photos"
              isActive={activeWindow === "photos"}
              onActivate={() => activateWindow("photos")}
              onClose={() => toggleWindow("photos")}
              initialPosition={{ x: 250, y: 150 }}
              initialSize={{ width: 650, height: 450 }}
            >
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
            </Window>
          )}
        </AnimatePresence>
      </div>

      <Dock
        apps={[
          { id: "finder", icon: "/placeholder.svg?height=50&width=50", isOpen: openWindows.includes("finder") },
          { id: "safari", icon: "/placeholder.svg?height=50&width=50", isOpen: openWindows.includes("safari") },
          { id: "messages", icon: "/placeholder.svg?height=50&width=50", isOpen: openWindows.includes("messages") },
          { id: "photos", icon: "/placeholder.svg?height=50&width=50", isOpen: openWindows.includes("photos") },
          { id: "mail", icon: "/placeholder.svg?height=50&width=50", isOpen: false },
          { id: "music", icon: "/placeholder.svg?height=50&width=50", isOpen: false },
        ]}
        onAppClick={toggleWindow}
      />
    </div>
  )
}
