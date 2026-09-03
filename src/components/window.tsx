"use client"

import type React from "react"
import { useState, useEffect, useLayoutEffect, useRef, useCallback, createContext, useContext } from "react"
import { Rnd } from "react-rnd"
import { X } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"

gsap.registerPlugin(CustomEase)

/**
 * Visibility signal for a window's subtree.
 *
 * A minimized window is kept MOUNTED (hidden with display:none) so the genie
 * restore animation has a live DOM to fly back to — but that means children keep
 * running. Apps with continuous work (game RAF loops) read this context and pause
 * while `true`, then resume seamlessly when the window is restored. Defaults to
 * `false` (visible) for any component rendered outside a Window.
 */
const WindowHiddenContext = createContext(false)

/** `true` while the enclosing window is minimized/hidden. */
export function useWindowHidden(): boolean {
  return useContext(WindowHiddenContext)
}

// Layout effect that no-ops on the server (avoids the SSR useLayoutEffect warning)
// but runs before paint on the client — used to hide the restored window before it
// can flash, now that the window subtree is never remounted on minimize/restore.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

interface WindowProps {
  appId: string
  title: string
  children: React.ReactNode
  isActive: boolean
  onActivate: () => void
  onClose: () => void
  onMinimize?: () => void
  isMinimized?: boolean
  initialPosition: Position
  initialSize: Size
  bounds?: string
}

// ── Native minimize / restore ("Genie") animation helpers ────────────────────
// The window is never itself animated — instead we snapshot it into a detached
// clone on <body>, animate that with GSAP transforms (translate3d/scale/opacity
// only, so it stays on the compositor), and drop the clone when it lands on the
// Dock icon. All DOM measurements are cached once before the tween begins; the
// tween never reads layout.

// Bottom-center transform origin makes the window collapse *downward* toward the
// Dock, giving the funnel/"sucked-in" character of the macOS genie.
const GENIE_ORIGIN = "50% 100%"
const GENIE_DURATION = 0.36

// Apple-flavoured easing curves (via CustomEase). Minimize accelerates as it's
// pulled into the Dock; restore springs out then softly settles — matching the
// asymmetric feel of the real macOS genie.
const MINIMIZE_EASE = CustomEase.create("genieMinimize", "M0,0 C0.34,0 0.16,1 1,1")
const RESTORE_EASE = CustomEase.create("genieRestore", "M0,0 C0.2,0 0.1,1 1,1")

// The single biggest source of jitter is backdrop-filter blur: re-rasterising a
// blur against a moving backdrop every frame is brutally expensive. Shadows,
// rings and inherited CSS transitions add more layer churn and fight GSAP. We
// flatten the clone into ONE cheap, opaque compositor layer so the whole thing
// travels on the GPU untouched by paint.
function flattenCloneForCompositing(clone: HTMLElement) {
  const nodes: HTMLElement[] = [clone, ...(Array.from(clone.getElementsByTagName("*")) as HTMLElement[])]
  for (const el of nodes) {
    const s = el.style
    s.backdropFilter = "none"
    s.setProperty("-webkit-backdrop-filter", "none")
    s.filter = "none"
    s.boxShadow = "none"
    // CSS transitions/animations on the live window race GSAP's own writes.
    s.transition = "none"
    s.animation = "none"
    // Drop any inherited will-change so we don't spawn a layer per descendant.
    s.willChange = "auto"
  }
}

// Deep-clone the live window into a floating snapshot. Canvas pixels aren't copied
// by cloneNode, so each canvas is rasterised to an <img> overlay first.
function buildWindowClone(windowNode: HTMLElement): HTMLElement {
  const clone = windowNode.cloneNode(true) as HTMLElement
  clone.removeAttribute("id")
  const allElements = clone.getElementsByTagName("*")
  for (let i = 0; i < allElements.length; i++) {
    allElements[i].removeAttribute("id")
  }

  const canvases = windowNode.getElementsByTagName("canvas")
  const cloneCanvases = clone.getElementsByTagName("canvas")
  for (let i = 0; i < canvases.length; i++) {
    try {
      const img = document.createElement("img")
      img.src = canvases[i].toDataURL()
      img.style.cssText = "width:100%;height:100%;position:absolute;top:0;left:0"
      cloneCanvases[i].parentElement?.appendChild(img)
      cloneCanvases[i].style.display = "none"
    } catch {
      // Tainted canvas (cross-origin) — skip; the frame stays as-is.
    }
  }

  flattenCloneForCompositing(clone)
  return clone
}

// Pin the clone over the window's exact on-screen rect at transform identity.
// Clearing the inherited transform is essential: react-rnd puts its own
// translate() on the window root, and leaving it would double the offset and
// make GSAP snap on the first frame.
function positionCloneOverRect(clone: HTMLElement, rect: DOMRect) {
  clone.style.position = "fixed"
  clone.style.left = `${rect.left}px`
  clone.style.top = `${rect.top}px`
  clone.style.width = `${rect.width}px`
  clone.style.height = `${rect.height}px`
  clone.style.margin = "0"
  clone.style.transform = "none"
  clone.style.transformOrigin = GENIE_ORIGIN
  clone.style.zIndex = "999999"
  clone.style.pointerEvents = "none"
  clone.style.willChange = "transform, opacity"
  // Single self-contained compositor layer — nothing outside repaints as it moves.
  clone.style.backfaceVisibility = "hidden"
  clone.style.contain = "layout paint"
}

// Transform that maps the window's rect onto the (possibly magnified) Dock-icon
// rect, expressed relative to the bottom-center origin. dockRect is read live so
// magnification / responsive shifts are honoured automatically.
function computeGenieTransform(windowRect: DOMRect, dockRect: DOMRect) {
  return {
    scaleX: dockRect.width / windowRect.width,
    scaleY: dockRect.height / windowRect.height,
    // Bottom-center of the window → center of the Dock icon.
    deltaX: dockRect.left + dockRect.width / 2 - (windowRect.left + windowRect.width / 2),
    deltaY: dockRect.top + dockRect.height / 2 - windowRect.bottom,
  }
}

export function Window({
  title,
  children,
  isActive,
  onActivate,
  onClose,
  onMinimize,
  isMinimized = false,
  initialPosition,
  initialSize,
  bounds = "#desktop-window-area",
  appId,
}: WindowProps) {
  const [mounted, setMounted] = useState(false)
  const [internalMinimized, setInternalMinimized] = useState(isMinimized)
  const justRestored = useRef(false)
  // Clones currently mid-flight, so we can tear them down if the window unmounts
  // (e.g. app closed) before an animation finishes — no orphaned nodes / leaks.
  const activeClonesRef = useRef<HTMLElement[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [isGame2048Locked, setIsGame2048Locked] = useState(false)
  const [position, setPosition] = useState<Position>(initialPosition)
  const [size, setSize] = useState<Size>(initialSize)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const preFullScreenRectRef = useRef<{ position: Position; size: Size } | null>(null)
  const { theme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handle2048LockChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ locked?: boolean }>
      setIsGame2048Locked(Boolean(customEvent.detail?.locked))
    }

    window.addEventListener("game2048-lock-change", handle2048LockChange as EventListener)
    return () => {
      window.removeEventListener("game2048-lock-change", handle2048LockChange as EventListener)
    }
  }, [])

  const toggleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      preFullScreenRectRef.current = { position, size }
      setPosition({ x: 0, y: 36 })
      setSize({
        width: window.innerWidth,
        height: window.innerHeight - 36,
      })
      setIsFullScreen(true)
    } else {
      if (preFullScreenRectRef.current) {
        setPosition(preFullScreenRectRef.current.position)
        setSize(preFullScreenRectRef.current.size)
      } else {
        setPosition(initialPosition)
        setSize(initialSize)
      }
      setIsFullScreen(false)
    }
  }, [isFullScreen, position, size, initialPosition, initialSize])

  useEffect(() => {
    const handleResize = () => {
      if (isFullScreen) {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight - 36,
        })
      } else {
        setSize((prev) => ({
          width: Math.min(prev.width, window.innerWidth - 20),
          height: Math.min(prev.height, window.innerHeight - 60),
        }))
        setPosition((prev) => ({
          x: Math.max(0, Math.min(prev.x, window.innerWidth - Math.min(size.width, window.innerWidth - 20))),
          y: Math.max(36, Math.min(prev.y, window.innerHeight - 80)),
        }))
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isFullScreen, size.width])

  // Handle drag to dismiss on mobile
  const handleDragEnd = (_event: unknown, info: { offset: { y: number } }) => {
    // If dragged down more than 150px, close the modal
    if (info.offset.y > 150) {
      onClose()
    } else {
      // Reset position if not enough drag
      setDragY(0)
    }
  }

  // --- Minimize & Restore Animation Logic ---
  // Detach a finished/aborted clone and forget it. Safe to call twice.
  const releaseClone = useCallback((clone: HTMLElement) => {
    activeClonesRef.current = activeClonesRef.current.filter((c) => c !== clone)
    gsap.killTweensOf(clone)
    clone.remove()
  }, [])

  // Minimize: window → Dock icon (genie funnel + fade), then hide the real window.
  useEffect(() => {
    if (isMinimized && !internalMinimized) {
      if (!isMobile) {
        const windowNode = document.querySelector(`.window-${appId}`) as HTMLElement
        const dockNode = document.querySelector(`[data-dock-icon="${appId}"]`) as HTMLElement

        if (windowNode && dockNode) {
          // Cache every measurement up front — nothing below reads layout.
          const windowRect = windowNode.getBoundingClientRect()
          const dockRect = dockNode.getBoundingClientRect()
          const { scaleX, scaleY, deltaX, deltaY } = computeGenieTransform(windowRect, dockRect)

          const clone = buildWindowClone(windowNode)
          positionCloneOverRect(clone, windowRect)
          document.body.appendChild(clone)
          activeClonesRef.current.push(clone)

          const tl = gsap.timeline({ onComplete: () => releaseClone(clone) })
          // One compositor-only tween funnels the whole window into the icon —
          // position + scale share the Apple curve so the path stays coherent
          // (no two-tween drift), and force3D keeps it on the GPU.
          tl.to(clone, {
            x: deltaX,
            y: deltaY,
            scaleX,
            scaleY,
            duration: GENIE_DURATION,
            ease: MINIMIZE_EASE,
            force3D: true,
          }, 0)
          // Fade only over the final stretch so it vanishes into the icon.
          tl.to(clone, { opacity: 0, duration: GENIE_DURATION * 0.3, ease: "power2.in" }, GENIE_DURATION * 0.7)
        }
      }
      setInternalMinimized(true)
    } else if (!isMinimized && internalMinimized) {
      setInternalMinimized(false)
      justRestored.current = true
    }
  }, [isMinimized, internalMinimized, isMobile, appId, releaseClone])

  // Restore: reverse the genie — Dock icon → window — then reveal the real window.
  // Runs as a LAYOUT effect: the window subtree is no longer remounted on restore
  // (so game state/canvas survive), which means the real window would paint at full
  // opacity for one frame before we hide it. Setting opacity to 0 before paint here
  // prevents that flash so the genie visual is identical to before.
  useIsomorphicLayoutEffect(() => {
    if (!justRestored.current || internalMinimized) return
    justRestored.current = false
    if (isMobile) return

    const windowNode = document.querySelector(`.window-${appId}`) as HTMLElement
    const dockNode = document.querySelector(`[data-dock-icon="${appId}"]`) as HTMLElement
    if (!windowNode || !dockNode) return

    const windowRect = windowNode.getBoundingClientRect()
    const dockRect = dockNode.getBoundingClientRect()
    const { scaleX, scaleY, deltaX, deltaY } = computeGenieTransform(windowRect, dockRect)

    // Hide the just-revealed real window until the clone lands on it.
    windowNode.style.opacity = "0"

    const clone = buildWindowClone(windowNode)
    positionCloneOverRect(clone, windowRect)
    document.body.appendChild(clone)
    activeClonesRef.current.push(clone)

    const reveal = () => {
      windowNode.style.opacity = "1"
      releaseClone(clone)
    }

    // Start collapsed over the Dock icon, then unfurl back to the window in one
    // composited tween with the softly-settling restore curve.
    gsap.set(clone, { x: deltaX, y: deltaY, scaleX, scaleY, opacity: 0, force3D: true })
    const tl = gsap.timeline({ onComplete: reveal })
    tl.to(clone, {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration: GENIE_DURATION,
      ease: RESTORE_EASE,
      force3D: true,
    }, 0)
    tl.to(clone, { opacity: 1, duration: GENIE_DURATION * 0.4, ease: "power2.out" }, 0)
  }, [internalMinimized, isMobile, appId, releaseClone])

  // Tear down any in-flight clones if the window unmounts mid-animation.
  useEffect(() => {
    return () => {
      activeClonesRef.current.forEach((clone) => {
        gsap.killTweensOf(clone)
        clone.remove()
      })
      activeClonesRef.current = []
    }
  }, [])
  // --- End Animation Logic ---

  if (!mounted) return null

  // NOTE: a minimized window is NOT swapped for a different element tree. Doing so
  // (the old `return <div display:none>`) changed the element type at this position
  // and forced React to unmount + remount the whole app subtree — resetting game
  // state and restarting Pixi. Instead each branch below stays mounted and is just
  // hidden with display:none while minimized, so children (and their paused loops)
  // are preserved and resume exactly where they left off.

  // Mobile iOS-style modal
  if (isMobile) {
    const disableDrag = title === "2048" && isGame2048Locked

    return (
      <motion.div
        className="fixed inset-0 flex items-end md:items-center justify-center p-0"
        style={{ zIndex: isActive ? 100 : 90, display: internalMinimized ? "none" : undefined }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        {/* Modal Content */}
        <motion.div
          data-window="true"
          onPointerDown={(e) => e.stopPropagation()}
          className={`relative w-full h-[90vh] flex flex-col backdrop-blur-xl border-t ${
            theme === "dark"
              ? "border-gray-700 bg-gray-900/95"
              : "border-gray-300 bg-white/95"
          }`}
          style={{
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          }}
          initial={{ y: '100%' }}
          animate={{ y: dragY }}
          exit={{ y: '100%' }}
          drag={disableDrag ? false : "y"}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          dragMomentum={false}
          onDragEnd={disableDrag ? undefined : handleDragEnd}
          onClick={(e) => e.stopPropagation()}
        >
          {/* iOS-style handle - Draggable area */}
          <div className="flex justify-center pt-2 pb-3 cursor-grab active:cursor-grabbing touch-none">
            <div className={`w-10 h-1 rounded-full ${
              theme === "dark" ? "bg-gray-600" : "bg-gray-400"
            }`} />
          </div>
          
          {/* Header */}
          <div
            className={`flex h-12 items-center px-4 border-b flex-shrink-0 ${
              theme === "dark" ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <div className="flex-1"></div>
            <div className={`text-base font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>{title}</div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={onClose}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  theme === "dark" 
                    ? "bg-gray-800 hover:bg-gray-700 text-white" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Content - Non-draggable */}
          <div 
            className={`flex-1 overflow-auto ${
              theme === "dark" ? "text-gray-200" : "text-gray-900"
            }`}
            style={{ pointerEvents: 'auto', userSelect: 'auto' }}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <WindowHiddenContext.Provider value={internalMinimized}>
              {children}
            </WindowHiddenContext.Provider>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Desktop window
  return (
    <Rnd
      className={`react-rnd-window-container window-${appId}`}
      position={position}
      size={size}
      onDragStop={(_e, d) => {
        if (!isFullScreen) {
          setPosition({ x: d.x, y: d.y })
        }
      }}
      onResizeStop={(_e, _direction, ref, _delta, pos) => {
        if (!isFullScreen) {
          setSize({ width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) })
          setPosition(pos)
        }
      }}
      minWidth={300}
      minHeight={200}
      bounds={bounds}
      dragHandleClassName="window-drag-handle"
      onMouseDown={onActivate}
      disableDragging={isFullScreen}
      enableResizing={!isFullScreen}
      style={{
        zIndex: isFullScreen ? 60 : isActive ? 40 : 20,
        // Hidden (not unmounted) while minimized — the genie clone provides the
        // visual, and keeping this mounted preserves the app's state + paused loops.
        display: internalMinimized ? "none" : undefined,
      }}
    >
      <motion.div
        data-window="true"
        onPointerDown={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: isActive ? 1 : 0.98, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        style={{ transition: 'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease' }}
        className={`h-full w-full overflow-hidden transition-all duration-200 ${
          isFullScreen ? "rounded-none border-0" : "rounded-2xl border"
        } ${
          isActive
            ? "shadow-[0_22px_55px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
            : "shadow-[0_10px_30px_rgba(0,0,0,0.22)]"
        } ${
          theme === "dark"
            ? `border-gray-700/80 bg-gray-900/95`
            : `border-gray-200/90 bg-white/95`
        }`}
        onMouseDown={onActivate}
      >
        <div
          onDoubleClick={toggleFullScreen}
          style={{ transition: 'background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease' }}
          className={`flex h-9 items-center px-3.5 select-none border-b ${
            theme === "dark"
              ? isActive
                ? "bg-[#1f1f21]/95 text-gray-200 border-gray-700/60"
                : "bg-[#1a1a1c]/70 text-gray-400 border-gray-800/50"
              : isActive
                ? "bg-[#f1f1f3]/95 text-gray-800 border-gray-300/60"
                : "bg-[#e8e8ea]/70 text-gray-500 border-gray-200/50"
          }`}
        >
          <div className="flex items-center gap-2 z-10 group/traffic">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className={`relative flex h-3 w-3 items-center justify-center rounded-full transition-all duration-150 overflow-hidden ${
                isActive
                  ? "bg-[#FF5F56] hover:brightness-105 border border-[#E0443E]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  : "bg-gray-400/60 dark:bg-gray-600/60 border border-gray-400/40 dark:border-gray-500/40 group-hover/traffic:bg-[#FF5F56] group-hover/traffic:border-[#E0443E]/80"
              }`}
              title="Close"
            >
              <svg
                className="w-2 h-2 text-[#4c0000] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150 stroke-current flex-shrink-0"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 3L9 9M9 3L3 9"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onMinimize) {
                  onMinimize()
                } else {
                  onClose()
                }
              }}
              className={`relative flex h-3 w-3 items-center justify-center rounded-full transition-all duration-150 overflow-hidden ${
                isActive
                  ? "bg-[#FFBD2E] hover:brightness-105 border border-[#DEA123]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                  : "bg-gray-400/60 dark:bg-gray-600/60 border border-gray-400/40 dark:border-gray-500/40 group-hover/traffic:bg-[#FFBD2E] group-hover/traffic:border-[#DEA123]/80"
              }`}
              title="Minimize"
            >
              <svg
                className="w-2 h-2 text-[#5c3b00] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150 stroke-current flex-shrink-0"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.5 6H9.5"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFullScreen()
              }}
              className={`relative flex h-3 w-3 items-center justify-center rounded-full transition-all duration-150 overflow-hidden ${
                isActive
                  ? "bg-[#28C840] hover:brightness-105 border border-[#1AAB29]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  : "bg-gray-400/60 dark:bg-gray-600/60 border border-gray-400/40 dark:border-gray-500/40 group-hover/traffic:bg-[#28C840] group-hover/traffic:border-[#1AAB29]/80"
              }`}
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullScreen ? (
                <svg
                  className="w-2 h-2 text-[#003800] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150 fill-current flex-shrink-0"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5.8 5.8H1.8L5.8 1.8V5.8ZM6.2 6.2H10.2L6.2 10.2V6.2Z" />
                </svg>
              ) : (
                <svg
                  className="w-2 h-2 text-[#003800] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150 fill-current flex-shrink-0"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2.2 2.2H6.2L2.2 6.2V2.2ZM9.8 9.8H5.8L9.8 5.8V9.8Z" />
                </svg>
              )}
            </button>
          </div>
          <div className="window-drag-handle flex-1 text-center text-xs font-medium cursor-move h-full flex items-center justify-center tracking-tight">
            {title}
          </div>
          <div className="w-14"></div>
        </div>
        <div 
          className={`h-[calc(100%-2.25rem)] overflow-auto ${
            theme === "dark" ? "text-gray-200" : "text-gray-900"
          }`}
          style={{ pointerEvents: 'auto', userSelect: 'auto' }}
          onMouseDown={(e) => {
            e.stopPropagation()
            onActivate()
          }}
        >
          <WindowHiddenContext.Provider value={internalMinimized}>
            {children}
          </WindowHiddenContext.Provider>
        </div>
      </motion.div>
    </Rnd>
  )
}
