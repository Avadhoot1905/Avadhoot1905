"use client"

import { useState, useEffect, useRef, useCallback, ReactElement } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import gsap from "gsap"

export interface DockApp {
  id: string
  name?: string
  icon: ReactElement
  isOpen: boolean
  isPinned?: boolean
}

export interface DockProps {
  apps: DockApp[]
  onAppClick: (appId: string) => void
}

type DockItem =
  | { type: "app"; app: DockApp; id: string }
  | { type: "separator"; id: string }

const appIdToName: Record<string, string> = {
  finder: "Finder",
  about: "About Me",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  safari: "Safari",
  terminal: "Terminal",
  flappybird: "Flappy Bird",
  tictactoe: "Tic Tac Toe",
  "2048": "2048",
  messages: "Messages",
  photos: "Photos",
  achievements: "Achievements",
  gmail: "Gmail",
  github: "GitHub",
  linkedin: "LinkedIn",
  leetcode: "LeetCode",
  medium: "Medium",
}


export function Dock({ apps, onAppClick }: DockProps) {
  const [isMobile, setIsMobile] = useState(false)
  const { theme } = useTheme()
  const socialAppIds = ["gmail", "github", "linkedin", "leetcode", "medium"]

  // DOM Refs
  const dockContainerRef = useRef<HTMLDivElement | null>(null)
  const shelfRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const iconRefs = useRef<(HTMLDivElement | null)[]>([])
  const shadowRefs = useRef<(HTMLDivElement | null)[]>([])
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])

  // Measurements & GSAP Setters
  const dockRectRef = useRef<DOMRect | null>(null)
  const baseXRef = useRef<number[]>([])
  const baseWidthRef = useRef<number[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const wasInDockRef = useRef(false)
  const hoveredAppRef = useRef<string | null>(null)

  const xQuickToRef = useRef<((value: number) => void)[]>([])
  const scaleXQuickToRef = useRef<((value: number) => void)[]>([])
  const scaleYQuickToRef = useRef<((value: number) => void)[]>([])
  const shadowQuickToRef = useRef<((value: number) => void)[]>([])
  const shelfScaleXQuickToRef = useRef<((value: number) => void) | null>(null)
  const shelfScaleYQuickToRef = useRef<((value: number) => void) | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const isAppUnpinned = useCallback((app: DockApp) => {
    if (app.isPinned !== undefined) {
      return !app.isPinned
    }
    const unpinnedAppIds = [
      "flappybird",
      "tictactoe",
      "2048",
      "messages",
      "photos",
      "achievements",
      "dinogame",
    ]
    return unpinnedAppIds.includes(app.id.toLowerCase())
  }, [])

  // Filter apps so unpinned apps only appear when they are open
  const visibleApps = apps.filter((app) => {
    if (isAppUnpinned(app) && !app.isOpen) {
      return false
    }
    return true
  })

  // Filter apps for mobile vs desktop
  const displayApps = isMobile
    ? visibleApps.filter((app) => socialAppIds.includes(app.id))
    : visibleApps

  const finderApp = displayApps.find((app) => app.id === "finder")
  const socialApps = displayApps.filter((app) => socialAppIds.includes(app.id))
  const regularApps = displayApps.filter(
    (app) => app.id !== "finder" && !socialAppIds.includes(app.id)
  )

  const pinnedRegularApps = regularApps.filter((app) => !isAppUnpinned(app))
  const unpinnedRegularApps = regularApps.filter((app) => isAppUnpinned(app))
  const orderedRegularApps = [...pinnedRegularApps, ...unpinnedRegularApps]

  const showFinderSeparator = Boolean(finderApp && orderedRegularApps.length > 0)
  const showSocialSeparator = Boolean(
    socialApps.length > 0 && (finderApp || orderedRegularApps.length > 0)
  )

  const dockItems: DockItem[] = []
  if (finderApp) {
    dockItems.push({ type: "app", app: finderApp, id: finderApp.id })
  }
  if (showFinderSeparator) {
    dockItems.push({ type: "separator", id: "finder-separator" })
  }
  orderedRegularApps.forEach((app) => {
    dockItems.push({ type: "app", app, id: app.id })
  })
  if (showSocialSeparator) {
    dockItems.push({ type: "separator", id: "social-separator" })
  }
  socialApps.forEach((app) => {
    dockItems.push({ type: "app", app, id: app.id })
  })

  // Keep stable reference of dockItems inside callbacks
  const dockItemsRef = useRef<DockItem[]>(dockItems)
  dockItemsRef.current = dockItems

  // Measure base geometry without layout thrashing
  const measureDock = useCallback(() => {
    if (!dockContainerRef.current || isMobile) return
    const items = dockItemsRef.current
    dockRectRef.current = dockContainerRef.current.getBoundingClientRect()

    items.forEach((_, i) => {
      const el = itemRefs.current[i]
      if (!el) return
      const prevX = Number(gsap.getProperty(el, "x")) || 0
      const rect = el.getBoundingClientRect()
      baseXRef.current[i] = rect.left - prevX + rect.width / 2
      baseWidthRef.current[i] = rect.width
    })
  }, [isMobile])

  // Initialize GSAP quickTo setters for inertia
  const initQuickTos = useCallback(() => {
    if (isMobile) return
    const items = dockItemsRef.current

    xQuickToRef.current = []
    scaleXQuickToRef.current = []
    scaleYQuickToRef.current = []
    shadowQuickToRef.current = []

    items.forEach((item, i) => {
      const itemEl = itemRefs.current[i]
      const iconEl = iconRefs.current[i]
      const shadowEl = shadowRefs.current[i]

      if (itemEl) {
        gsap.set(itemEl, { x: 0 })
        xQuickToRef.current[i] = gsap.quickTo(itemEl, "x", {
          duration: 0.2,
          ease: "power3.out",
        })
      }
      if (iconEl) {
        gsap.set(iconEl, {
          scaleX: 1,
          scaleY: 1,
          transformOrigin: "50% 100%",
        })
        scaleXQuickToRef.current[i] = gsap.quickTo(iconEl, "scaleX", {
          duration: 0.2,
          ease: "power3.out",
        })
        scaleYQuickToRef.current[i] = gsap.quickTo(iconEl, "scaleY", {
          duration: 0.2,
          ease: "power3.out",
        })
      }
      if (shadowEl) {
        gsap.set(shadowEl, { opacity: 0 })
        shadowQuickToRef.current[i] = gsap.quickTo(shadowEl, "opacity", {
          duration: 0.2,
          ease: "power3.out",
        })
      }
    })

    if (shelfRef.current) {
      shelfScaleXQuickToRef.current = gsap.quickTo(shelfRef.current, "scaleX", {
        duration: 0.2,
        ease: "power3.out",
      })
      shelfScaleYQuickToRef.current = gsap.quickTo(shelfRef.current, "scaleY", {
        duration: 0.2,
        ease: "power3.out",
      })
    }
  }, [isMobile])

  // Smooth label fade in / rise / fade out
  const updateLabels = useCallback(
    (activeAppId: string | null) => {
      if (activeAppId === hoveredAppRef.current) return
      hoveredAppRef.current = activeAppId
      const items = dockItemsRef.current

      items.forEach((item, idx) => {
        if (item.type !== "app") return
        const labelEl = labelRefs.current[idx]
        if (!labelEl) return

        if (item.app.id === activeAppId) {
          gsap.to(labelEl, {
            opacity: 1,
            y: 0,
            duration: 0.18,
            ease: "power2.out",
            overwrite: true,
          })
        } else {
          gsap.to(labelEl, {
            opacity: 0,
            y: 4,
            duration: 0.15,
            ease: "power2.in",
            overwrite: true,
          })
        }
      })
    },
    []
  )

  const dockItemIdsKey = dockItems.map((item) => item.id).join(",")

  useEffect(() => {
    if (isMobile) return

    measureDock()
    initQuickTos()

    // Continuously measure during spring appearance/disappearance transition
    let frameId: number
    const startTime = performance.now()
    const trackLayout = () => {
      if (!wasInDockRef.current) {
        measureDock()
      }
      if (performance.now() - startTime < 520) {
        frameId = requestAnimationFrame(trackLayout)
      }
    }
    trackLayout()

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    const handleResize = () => {
      if (!wasInDockRef.current) {
        measureDock()
      }
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("resize", handleResize)

    // Continuous 60 FPS GSAP Ticker Loop
    const updateDock = () => {
      if (isMobile) return

      const items = dockItemsRef.current
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const N = items.length
      if (N === 0 || !dockContainerRef.current) return

      if (!wasInDockRef.current) {
        dockRectRef.current = dockContainerRef.current.getBoundingClientRect()
      }
      const dockRect = dockRectRef.current
      if (!dockRect || dockRect.width === 0) {
        measureDock()
        return
      }

      // Proximity boundary check around dock
      const inDockZone =
        mx >= dockRect.left &&
        mx <= dockRect.right &&
        my >= dockRect.top &&
        my <= window.innerHeight

      if (inDockZone) {
        if (!wasInDockRef.current) {
          measureDock()
          wasInDockRef.current = true
        }

        const scales = new Array(N).fill(1.0)
        let closestAppId: string | null = null
        let minDist = Infinity

        for (let i = 0; i < N; i++) {
          const item = items[i]
          if (item.type === "separator") {
            scales[i] = 1.0
            continue
          }
          const baseCenter = baseXRef.current[i]
          if (typeof baseCenter !== "number" || isNaN(baseCenter)) continue

          const dx = mx - baseCenter
          const d = Math.abs(dx)

          if (d < minDist) {
            minDist = d
            closestAppId = item.app.id
          }

          // Pure Gaussian magnification curve for authentic macOS Dock interaction
          // scale = 1 + amplitude * exp(-(distance²) / (2 * σ²))
          const amplitude = 0.85
          const sigma = 62
          const gaussian = Math.exp(-(d * d) / (2 * sigma * sigma))
          scales[i] = 1.0 + amplitude * gaussian
        }

        // Show label only for closest hovered icon inside dock
        if (minDist < 75 && closestAppId) {
          updateLabels(closestAppId)
        } else {
          updateLabels(null)
        }

        // Horizontal Pushing (elastic neighbour displacement)
        const positions = new Array(N).fill(0)
        for (let i = 0; i < N; i++) {
          if (i === 0) {
            positions[i] = 0
          } else {
            const prevWidth = baseWidthRef.current[i - 1] || 52
            const currWidth = baseWidthRef.current[i] || 52
            const prevScale = scales[i - 1]
            const currScale = scales[i]
            const baseGap = (baseXRef.current[i] || 0) - (baseXRef.current[i - 1] || 0)

            const extraSpace =
              (prevWidth * (prevScale - 1)) / 2 +
              (currWidth * (currScale - 1)) / 2
            positions[i] = positions[i - 1] + baseGap + extraSpace
          }
        }

        // Keep dock centered around cursor point so hovered icon stays anchored
        let C = 0
        if (mx <= baseXRef.current[0]) {
          C = baseXRef.current[0] - positions[0]
        } else if (mx >= baseXRef.current[N - 1]) {
          C = baseXRef.current[N - 1] - positions[N - 1]
        } else {
          for (let k = 0; k < N - 1; k++) {
            if (mx >= baseXRef.current[k] && mx <= baseXRef.current[k + 1]) {
              const span = baseXRef.current[k + 1] - baseXRef.current[k]
              const alpha = span > 0 ? (mx - baseXRef.current[k]) / span : 0
              const interpBase =
                (1 - alpha) * baseXRef.current[k] +
                alpha * baseXRef.current[k + 1]
              const interpPos =
                (1 - alpha) * positions[k] + alpha * positions[k + 1]
              C = interpBase - interpPos
              break
            }
          }
        }

        // Apply both horizontal displacement and magnification simultaneously via GSAP quickTo
        for (let i = 0; i < N; i++) {
          const itemEl = itemRefs.current[i]
          const iconEl = iconRefs.current[i]
          const shadowEl = shadowRefs.current[i]

          const targetX = positions[i] - (baseXRef.current[i] || 0) + C

          if (itemEl && xQuickToRef.current[i]) {
            xQuickToRef.current[i](targetX)
          }

          if (items[i].type === "app" && iconEl) {
            scaleXQuickToRef.current[i]?.(scales[i])
            scaleYQuickToRef.current[i]?.(scales[i])

            if (shadowEl && shadowQuickToRef.current[i]) {
              const shadowOpacity = Math.min(1, Math.max(0, (scales[i] - 1) / 0.7))
              shadowQuickToRef.current[i](shadowOpacity)
            }
          }
        }

        // Subtly scale dock glass shelf to cradle expanded icons
        const totalExtraWidth =
          positions[N - 1] -
          baseXRef.current[N - 1] +
          (baseXRef.current[0] - positions[0])
        const shelfWidth = dockRect.width || 400
        const targetShelfScaleX =
          1 + Math.max(0, totalExtraWidth * 0.45) / shelfWidth
        const maxScale = Math.max(...scales)
        const targetShelfScaleY = 1 + (maxScale - 1) * 0.08

        shelfScaleXQuickToRef.current?.(targetShelfScaleX)
        shelfScaleYQuickToRef.current?.(targetShelfScaleY)
      } else if (wasInDockRef.current) {
        // Return Animation: Smoothly return to baseline using quickTo instances directly without killing them
        wasInDockRef.current = false
        updateLabels(null)

        items.forEach((item, i) => {
          const itemEl = itemRefs.current[i]
          const iconEl = iconRefs.current[i]
          const shadowEl = shadowRefs.current[i]
          if (itemEl && xQuickToRef.current[i]) {
            xQuickToRef.current[i](0)
          }
          if (iconEl && scaleXQuickToRef.current[i]) {
            scaleXQuickToRef.current[i]?.(1)
            scaleYQuickToRef.current[i]?.(1)
          }
          if (shadowEl && shadowQuickToRef.current[i]) {
            shadowQuickToRef.current[i](0)
          }
        })

        if (shelfScaleXQuickToRef.current && shelfScaleYQuickToRef.current) {
          shelfScaleXQuickToRef.current(1)
          shelfScaleYQuickToRef.current(1)
        }
      }
    }

    gsap.ticker.add(updateDock)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("resize", handleResize)
      gsap.ticker.remove(updateDock)
    }
  }, [dockItemIdsKey, isMobile, measureDock, initQuickTos, updateLabels])

  // Authentic macOS Dock click bounce animation
  const handleAppClick = (appId: string, index: number) => {
    if (!isMobile) {
      const iconEl = iconRefs.current[index]
      if (iconEl) {
        gsap.to(iconEl, {
          y: -18,
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(iconEl, {
              y: 0,
              duration: 0.45,
              ease: "bounce.out",
            })
          },
        })
      }
    }
    onAppClick(appId)
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 flex items-end justify-center z-50 ${
        isMobile ? "h-24 pb-3" : "h-20 pb-2.5"
      }`}
    >
      <motion.div
        ref={dockContainerRef}
        data-dock="true"
        onPointerDown={(e) => e.stopPropagation()}
        className={`relative flex items-center ${
          isMobile
            ? `w-[calc(100%-24px)] max-w-[430px] justify-around rounded-3xl px-5 py-3 mb-2 shadow-2xl backdrop-blur-xl border ${
                theme === "dark"
                  ? "bg-black/20 border-white/10"
                  : "bg-white/20 border-black/10"
              }`
            : "px-3 py-2 mb-2 h-[72px]"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Authentic Glass Shelf Background (Desktop) */}
        {!isMobile && (
          <div
            ref={shelfRef}
            className={`absolute inset-0 rounded-2xl backdrop-blur-2xl border transition-colors duration-300 will-change-transform ${
              theme === "dark"
                ? "bg-white/[0.11] border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
                : "bg-white/35 border-black/10 shadow-[0_15px_35px_rgba(0,0,0,0.15)]"
            }`}
            style={{
              transformOrigin: "50% 100%",
              backdropFilter: "blur(24px) saturate(190%)",
              WebkitBackdropFilter: "blur(24px) saturate(190%)",
            }}
          >
            {/* Very soft reflection beneath dock shelf */}
            <div
              className={`absolute -bottom-2 left-4 right-4 h-3 rounded-full blur-md opacity-30 pointer-events-none ${
                theme === "dark" ? "bg-white/20" : "bg-black/20"
              }`}
            />
          </div>
        )}

        {/* Dock Items Layer */}
        <div className="relative z-10 flex items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {dockItems.map((item, index) => {
              if (item.type === "separator") {
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 26,
                    }}
                    className="flex items-center justify-center overflow-visible"
                  >
                    <div
                      ref={(el) => {
                        itemRefs.current[index] = el
                      }}
                      className="flex items-center justify-center will-change-transform"
                    >
                      <div
                        className={`mx-2 w-px ${isMobile ? "h-8" : "h-8"} ${
                          theme === "dark" ? "bg-white/30" : "bg-black/20"
                        }`}
                      />
                    </div>
                  </motion.div>
                )
              }

              const app = item.app
              const appLabel =
                app.name ||
                appIdToName[app.id] ||
                (app.id.charAt(0).toUpperCase() + app.id.slice(1))

              return (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ width: 0, opacity: 0, scale: 0.25, y: 24 }}
                  animate={{
                    width: "auto",
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 420,
                      damping: 26,
                    },
                  }}
                  exit={{
                    width: 0,
                    opacity: 0,
                    scale: 0.25,
                    y: 20,
                    transition: {
                      duration: 0.22,
                      ease: "easeInOut",
                    },
                  }}
                  className="flex items-center justify-center overflow-visible"
                >
                  <div
                    ref={(el) => {
                      itemRefs.current[index] = el
                    }}
                    onClick={() => handleAppClick(app.id, index)}
                    className={`relative flex items-center justify-center cursor-pointer select-none will-change-transform ${
                      isMobile ? "mx-1" : "mx-1.5"
                    }`}
                  >
                    {/* App Icon Container (Magnifies upwards around bottom center) */}
                    <div
                      ref={(el) => {
                        iconRefs.current[index] = el
                      }}
                      className="relative flex items-center justify-center will-change-transform"
                      style={{
                        width: isMobile ? 50 : 52,
                        height: isMobile ? 50 : 52,
                        transformOrigin: "50% 100%",
                      }}
                    >
                      {/* Subtle shadow beneath enlarged icon */}
                      {!isMobile && (
                        <div
                          ref={(el) => {
                            shadowRefs.current[index] = el
                          }}
                          className="absolute -bottom-2 inset-x-1 h-3 rounded-full bg-black/35 blur-md pointer-events-none -z-10"
                          style={{ opacity: 0 }}
                        />
                      )}

                      <div className="flex h-full w-full items-center justify-center drop-shadow-md">
                        {app.icon}
                      </div>
                    </div>

                    {/* Running Indicator Dot (anchored at bottom, never drifts/scales) */}
                    {app.isOpen && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={`absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full shadow-sm ${
                          theme === "dark" ? "bg-white" : "bg-gray-800"
                        }`}
                      />
                    )}

                    {/* App Label Tooltip (smooth fade in, rise, fade out) */}
                    {!isMobile && (
                      <div
                        ref={(el) => {
                          labelRefs.current[index] = el
                        }}
                        className={`absolute -top-11 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium shadow-lg backdrop-blur-xl border z-40 ${
                          theme === "dark"
                            ? "bg-black/60 text-white border-white/20"
                            : "bg-white/70 text-black border-black/15"
                        }`}
                        style={{
                          opacity: 0,
                          transform: "translate3d(-50%, 4px, 0)",
                          backdropFilter: "blur(16px) saturate(180%)",
                          WebkitBackdropFilter: "blur(16px) saturate(180%)",
                        }}
                      >
                        {appLabel}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

