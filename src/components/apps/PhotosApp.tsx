"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes } from "react-icons/fa"

// Array of images from assets/images folder
const images = [
  { src: "/assets/images/50.png", alt: "Photo 1" },
  { src: "/assets/images/feb.png", alt: "Photo 2" },
  { src: "/assets/images/100.png", alt: "Photo 3" },
]

export function PhotosApp() {
  const { theme } = useTheme()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <div className="flex h-full flex-col">
      <div className={`border-b p-2 ${theme === "dark" ? "border-gray-700" : ""}`}>
        <div className="flex space-x-4">
          <div className={`text-sm font-medium ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`}>
            Photos
          </div>
          <div className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Memories</div>
          <div className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Albums</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className={`mb-2 text-lg font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>Recents</h2>
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, i) => (
            <div
              key={i}
              className={`aspect-square rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }`}
              onClick={() => setSelectedImage(image.src)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(null)
              }}
            >
              <FaTimes className="text-2xl" />
            </button>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Full size image"
                fill
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
