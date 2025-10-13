"use client"

import { useTheme } from "next-themes"

export function MessagesApp() {
  const { theme } = useTheme()

  return (
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
  )
}
