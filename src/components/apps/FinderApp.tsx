"use client"

import { useTheme } from "next-themes"
import { FaFilePdf, FaFileExcel, FaFilePowerpoint } from "react-icons/fa"

export function FinderApp() {
  const { theme } = useTheme()

  return (
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
              <div className="h-16 w-16 rounded flex items-center justify-center">
                <FaFilePdf className="text-4xl text-red-500" />
              </div>
              <div className="mt-1 text-xs">Document.pdf</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded flex items-center justify-center">
                <FaFileExcel className="text-4xl text-green-500" />
              </div>
              <div className="mt-1 text-xs">Spreadsheet.xlsx</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded flex items-center justify-center">
                <FaFilePowerpoint className="text-4xl text-orange-500" />
              </div>
              <div className="mt-1 text-xs">Presentation.pptx</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
