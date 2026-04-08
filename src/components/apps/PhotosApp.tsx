"use client"

import { useMemo, useState } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes } from "react-icons/fa"

type PhotoItem = {
  src: string
  alt: string
}

type AlbumMap = Record<string, PhotoItem[]>

const albumImages: AlbumMap = {
  camera: [
    { src: "/assets/images/camera/acm_merch.jpeg", alt: "Acm Merch" },
    { src: "/assets/images/camera/acm_ocs.jpeg", alt: "Acm Ocs" },
    { src: "/assets/images/camera/cookoff.jpeg", alt: "Cookoff" },
    { src: "/assets/images/camera/devjams.jpeg", alt: "Devjams" },
    { src: "/assets/images/camera/hack_formal.jpeg", alt: "Hack Formal" },
    { src: "/assets/images/camera/marathon.jpeg", alt: "Marathon" },
    { src: "/assets/images/camera/riviera.jpeg", alt: "Riviera" },
    { src: "/assets/images/camera/vit.jpeg", alt: "Vit" },
    { src: "/assets/images/camera/yantra.jpeg", alt: "Yantra" },
    { src: "/assets/images/camera/yantra_winners.jpeg", alt: "Yantra Winners" },
  ],
  informal: [
    { src: "/assets/images/informal/bruh_alien.jpeg", alt: "Bruh Alien" },
    { src: "/assets/images/informal/hack_informal.jpeg", alt: "Hack Informal" },
    { src: "/assets/images/informal/mcd_boys.jpeg", alt: "Mcd Boys" },
    { src: "/assets/images/informal/mcd_gng.jpeg", alt: "Mcd Gng" },
    { src: "/assets/images/informal/sami.jpeg", alt: "Sami" },
  ],
  leetcode: [
    { src: "/assets/images/leetcode/100.png", alt: "Leetcode 100" },
    { src: "/assets/images/leetcode/50.png", alt: "Leetcode 50" },
    { src: "/assets/images/leetcode/feb.png", alt: "Leetcode Feb" },
  ],
  random: [
    { src: "/assets/images/random/legacy_vit.jpeg", alt: "Legacy Vit" },
    { src: "/assets/images/random/library.jpeg", alt: "Library" },
    { src: "/assets/images/random/room.jpeg", alt: "Room" },
    { src: "/assets/images/random/sunset.jpeg", alt: "Sunset" },
  ],
}

function shufflePhotos(photos: PhotoItem[]) {
  const shuffled = [...photos]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function formatAlbumTitle(albumName: string) {
  return albumName.charAt(0).toUpperCase() + albumName.slice(1)
}

type ActiveTab = "photos" | "memories" | "albums"

export function PhotosApp() {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<ActiveTab>("photos")
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<PhotoItem | null>(null)

  const allPhotos = useMemo(() => Object.values(albumImages).flat(), [])
  const shuffledPhotos = useMemo(() => shufflePhotos(allPhotos), [allPhotos])
  const memoryPhotos = albumImages.camera
  const albumNames = Object.keys(albumImages)

  const photosToRender =
    activeTab === "photos"
      ? shuffledPhotos
      : activeTab === "memories"
        ? memoryPhotos
        : activeAlbum
          ? albumImages[activeAlbum]
          : []

  const isAlbumsList = activeTab === "albums" && !activeAlbum

  const tabClassName = (tab: ActiveTab) =>
    `text-sm ${
      activeTab === tab
        ? theme === "dark"
          ? "font-medium text-blue-400"
          : "font-medium text-blue-500"
        : theme === "dark"
          ? "text-gray-300"
          : "text-gray-700"
    }`

  return (
    <div className="flex h-full flex-col">
      <div className={`border-b p-2 ${theme === "dark" ? "border-gray-700" : ""}`}>
        <div className="flex space-x-4">
          <button
            type="button"
            className={tabClassName("photos")}
            onClick={() => {
              setActiveTab("photos")
              setActiveAlbum(null)
            }}
          >
            Photos
          </button>
          <button
            type="button"
            className={tabClassName("memories")}
            onClick={() => {
              setActiveTab("memories")
              setActiveAlbum(null)
            }}
          >
            Memories
          </button>
          <button
            type="button"
            className={tabClassName("albums")}
            onClick={() => {
              setActiveTab("albums")
              setActiveAlbum(null)
            }}
          >
            Albums
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className={`mb-2 text-lg font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
          {activeTab === "photos" && "Recents"}
          {activeTab === "memories" && "Memories"}
          {activeTab === "albums" && (activeAlbum ? formatAlbumTitle(activeAlbum) : "Albums")}
        </h2>

        {isAlbumsList ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {albumNames.map((albumName) => {
              const coverPhoto = albumImages[albumName][0]
              return (
                <button
                  key={albumName}
                  type="button"
                  className={`rounded-lg border p-2 text-left transition-opacity hover:opacity-80 ${
                    theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                  }`}
                  onClick={() => setActiveAlbum(albumName)}
                >
                  <div
                    className={`mb-2 aspect-square overflow-hidden rounded ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  >
                    <Image
                      src={coverPhoto.src}
                      alt={`${formatAlbumTitle(albumName)} cover`}
                      width={240}
                      height={240}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className={`text-sm font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                    {formatAlbumTitle(albumName)}
                  </div>
                  <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {albumImages[albumName].length} photos
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <>
            {activeTab === "albums" && activeAlbum && (
              <button
                type="button"
                className={`mb-3 text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                onClick={() => setActiveAlbum(null)}
              >
                Back to Albums
              </button>
            )}

            <div className="grid grid-cols-3 gap-2">
              {photosToRender.map((image) => (
                <div
                  key={image.src}
                  className={`aspect-square cursor-pointer overflow-hidden rounded transition-opacity hover:opacity-80 ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </>
        )}
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
                src={selectedImage.src}
                alt={selectedImage.alt}
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
