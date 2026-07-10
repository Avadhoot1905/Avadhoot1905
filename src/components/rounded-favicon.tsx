"use client"

import { useEffect } from "react"

export function RoundedFavicon() {
  useEffect(() => {
    const makeRounded = () => {
      const img = new Image()
      img.crossOrigin = "Anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        // Use a standard size for favicons
        const size = Math.min(img.width || 32, img.height || 32, 64)
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Create a circular clipping path
        ctx.beginPath()
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()

        // Draw the image inside the circle
        ctx.drawImage(img, 0, 0, size, size)

        // Find existing favicon or create a new one
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
        if (!link) {
          link = document.createElement("link")
          link.rel = "icon"
          document.head.appendChild(link)
        }
        
        // Update the href with the rounded image data
        link.href = canvas.toDataURL("image/png")
      }
      
      // Load the original square favicon
      img.src = "/favicon.ico"
    }

    makeRounded()
  }, [])

  return null
}
