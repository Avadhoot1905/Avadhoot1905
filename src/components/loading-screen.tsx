"use client"

import { useState, useEffect, useRef } from "react"
import gsap from "gsap"

interface LoadingScreenProps {
  isLoaded: boolean
  onDismiss?: () => void
}

export function LoadingScreen({ isLoaded, onDismiss }: LoadingScreenProps) {
  const [animationComplete, setAnimationComplete] = useState(false)
  const [showScreen, setShowScreen] = useState(true)
  const [ctaReady, setCtaReady] = useState(false)

  // Refs for animation targets
  const containerRef = useRef<HTMLDivElement>(null)
  const firstTextRef = useRef<HTMLDivElement>(null)
  const bgTransitionRef = useRef<HTMLDivElement>(null)
  const secondTextRef = useRef<HTMLDivElement>(null)
  const thirdTextRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const finalNameRef = useRef<HTMLDivElement>(null)
  const clickTextRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let tickerFnRef: (() => void) | null = null
    let timelineRef: gsap.core.Timeline | null = null

    const runAnimationSequence = async () => {
      const tl = gsap.timeline()
      timelineRef = tl

      // ── Subtle container breathing pulse for cinematic life ──
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          scale: 1.005,
          duration: 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        })
      }

      // ============================================
      // 1️⃣ FIRST TEXT: Zoomed-in word-by-word reveal + cinematic fade out
      // ============================================
      if (firstTextRef.current) {
        const words = ["Simple", "on", "the", "surface."]

        firstTextRef.current.innerHTML = ""
        firstTextRef.current.style.opacity = "1"
        firstTextRef.current.style.transform = "scale(1.15)"
        firstTextRef.current.style.transformOrigin = "center center"
        firstTextRef.current.style.filter = "blur(0px)"

        const wordSpans: HTMLElement[] = []
        words.forEach((word) => {
          const span = document.createElement("span")
          span.textContent = word
          span.style.display = "inline-block"
          span.style.opacity = "0"
          span.style.transform = "translateY(12px) scale(0.95)"
          span.style.filter = "blur(4px)"
          span.style.marginRight = "0.35em"
          firstTextRef.current!.appendChild(span)
          wordSpans.push(span)
        })

        // Words appear sequentially
        tl.fromTo(
          wordSpans,
          { opacity: 0, y: 12, scale: 0.95, filter: "blur(4px)" },
          { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.6, stagger: 0.15, ease: "power2.out" },
          0.1
        )

        // Cinematic exit: scale down, blur out — overlaps with Phase 2 entrance
        tl.to(
          firstTextRef.current,
          {
            scale: 0.9,
            opacity: 0,
            filter: "blur(8px)",
            duration: 0.9,
            ease: "power2.inOut",
          },
          1.0
        )
      }

      // ============================================
      // 2️⃣ BACKGROUND + CONVEYOR BELT — starts WHILE Phase 1 is still fading
      // ============================================
      // Background transition starts early, long duration for gradual feel
      tl.to(
        containerRef.current,
        { backgroundColor: "#000000", duration: 1.2, ease: "power2.inOut" },
        0.8
      )

      let FADEOUT_START = 3.6

      if (secondTextRef.current && bgTransitionRef.current) {
        secondTextRef.current.innerHTML = ""
        secondTextRef.current.style.opacity = "1"
        secondTextRef.current.style.overflow = "hidden"

        const PHASE_START = 1.0       // Overlaps with Phase 1 exit (was 1.3)
        const HOLD_DURATION = 0.5
        const MOTION_START = PHASE_START + HOLD_DURATION  // 1.5
        const RUN_DURATION = 2.0
        const STOP_TIME = MOTION_START + RUN_DURATION     // 3.5
        const PAUSE_BEFORE_FADE = 1.0

        const INITIAL_SPEED = 90
        const MAX_SPEED = 1000
        const ACCEL = 1000

        const NODE_COUNT = 7
        const SPACING = 120

        const container = secondTextRef.current
        const containerHeight = container.getBoundingClientRect().height || window.innerHeight

        const TOP_EXIT = -(containerHeight / 2) - 60

        const nodes: HTMLElement[] = []
        const nodePositions: number[] = []

        for (let i = 0; i < NODE_COUNT; i++) {
          const el = document.createElement("div")
          el.style.position = "absolute"
          el.style.left = "50%"
          el.style.top = "50%"
          el.style.transform = "translate(-50%, -50%)"
          el.style.display = "flex"
          el.style.justifyContent = "center"
          el.style.alignItems = "center"
          el.style.gap = "0.75rem"
          el.style.pointerEvents = "none"
          el.style.whiteSpace = "nowrap"
          el.style.willChange = "transform, opacity, filter"
          el.innerHTML = `<span class="text-emerald-400 font-bold italic">Efficient</span><span class="text-white italic">underneath</span>`
          container.appendChild(el)
          nodes.push(el)

          if (i === 0) {
            nodePositions[i] = 0
          } else {
            nodePositions[i] = i * SPACING
          }
        }

        const applyDepth = (el: HTMLElement, y: number) => {
          const halfRange = containerHeight / 2 + 60
          const distFromCenter = Math.abs(y) / halfRange
          const focus = Math.max(0, 1 - distFromCenter)

          const scale = 0.82 + focus * 0.33
          const opacity = Math.min(1, Math.max(0, focus * focus * 1.15))
          const blur = (1 - focus) * 4

          el.style.transform = `translate(-50%, -50%) translateY(${y}px) scale(${scale})`
          el.style.opacity = String(opacity)
          el.style.filter = `blur(${blur.toFixed(1)}px)`
        }

        for (let i = 0; i < NODE_COUNT; i++) {
          nodes[i].style.opacity = "0"
          nodes[i].style.transform = `translate(-50%, -50%) translateY(${nodePositions[i]}px) scale(0.82)`
          nodes[i].style.filter = "blur(6px)" // Match Phase 1 exit blur for bridge
        }

        // Focal node emerges from blur (bridges Phase 1's blur exit)
        tl.to(
          nodes[0],
          {
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power2.out",
            onUpdate: function () {
              const s = 1.1 + this.progress() * 0.05
              nodes[0].style.transform = `translate(-50%, -50%) translateY(0px) scale(${s})`
            },
          },
          PHASE_START
        )

        let tickerActive = false
        let speed = INITIAL_SPEED
        let elapsedTime = 0

        tickerFnRef = () => {
          if (!tickerActive) return

          const dt = gsap.ticker.deltaRatio() / 60
          elapsedTime += dt

          if (speed < MAX_SPEED) {
            speed = Math.min(MAX_SPEED, speed + ACCEL * dt)
          }

          const moveAmount = speed * dt

          for (let i = 0; i < NODE_COUNT; i++) {
            nodePositions[i] -= moveAmount

            if (nodePositions[i] < TOP_EXIT) {
              let maxY = -Infinity
              for (let j = 0; j < NODE_COUNT; j++) {
                if (j !== i && nodePositions[j] > maxY) maxY = nodePositions[j]
              }
              nodePositions[i] = maxY + SPACING
            }

            applyDepth(nodes[i], nodePositions[i])
          }
        }

        tl.add(() => {
          tickerActive = true
          gsap.ticker.add(tickerFnRef!)
        }, MOTION_START)

        tl.add(() => {
          tickerActive = false
          if (tickerFnRef) gsap.ticker.remove(tickerFnRef)

          // Freeze all current cascaded frames in place during the pause.
          for (let i = 0; i < NODE_COUNT; i++) {
            applyDepth(nodes[i], nodePositions[i])
          }
        }, STOP_TIME)

        // Pause on the last visible frame before fading out.
        FADEOUT_START = STOP_TIME + PAUSE_BEFORE_FADE

        // Individual nodes blur out first (micro delay before container fades)
        tl.add(() => {
          gsap.to(nodes, {
            opacity: 0,
            filter: "blur(6px)",
            scale: 0.95,
            y: "-=30",
            duration: 0.8,
            ease: "power2.inOut",
          })
        }, FADEOUT_START)

        // Container fades 0.15s after nodes start blurring (micro delay)
        tl.to(
          secondTextRef.current,
          { opacity: 0, duration: 0.7, ease: "power2.inOut" },
          FADEOUT_START + 0.15
        )

        // Fully clear conveyor nodes before Phase 3 begins to avoid visual flashback.
        tl.add(() => {
          nodes.forEach((node) => node.remove())
          if (secondTextRef.current) {
            secondTextRef.current.innerHTML = ""
          }
        }, FADEOUT_START + 0.9)
      }

      // ============================================
      // 3️⃣ THIRD TEXT: Cursor hover — enters WHILE conveyor is still fading
      // ============================================
      const THIRD_START = FADEOUT_START + 0.95

      if (thirdTextRef.current && cursorRef.current) {
        const thirdText = "That's usually the goal."
        thirdTextRef.current.innerHTML = ""
        thirdTextRef.current.style.display = "block"
        thirdTextRef.current.style.opacity = "1"

        const words = thirdText.split(" ").filter(w => w.length > 0)
        let wordSpans: HTMLElement[] = []

        words.forEach((word, idx) => {
          const span = document.createElement("span")
          span.textContent = word
          span.className = "inline-block mr-2 whitespace-nowrap"
          span.style.transformOrigin = "center center"
          span.style.transition = "none"
          span.style.opacity = "0"
          span.style.filter = "blur(6px)" // Match Phase 2 exit blur for bridge
          span.style.transform = "translateY(-10px) scale(0.97)" // Enter from ABOVE (energy continuity)
          thirdTextRef.current!.appendChild(span)
          wordSpans.push(span)

          if (idx < words.length - 1) {
            thirdTextRef.current!.appendChild(document.createTextNode(" "))
          }
        })

        // Words settle downward into place (continuing upward energy from conveyor)
        tl.to(wordSpans, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.out"
        }, THIRD_START)

        const HOVER_START = THIRD_START + 0.9
        const MOVE_DURATION = 0.35
        const DWELL_TIME = 0.1
        const SCALE_UP = 1.25
        const SCALE_DURATION = 0.25

        tl.add(() => {
          if (!cursorRef.current || wordSpans.length === 0) return
          const firstRect = wordSpans[0].getBoundingClientRect()
          gsap.set(cursorRef.current, {
            x: firstRect.left + firstRect.width / 2,
            y: firstRect.top + firstRect.height * 0.7 + 25,
            opacity: 0,
            scale: 0.8
          })
        }, HOVER_START - 0.1)

        tl.to(cursorRef.current, {
          opacity: 1,
          scale: 1,
          y: "-=25",
          duration: 0.4,
          ease: "power2.out",
        }, HOVER_START)

        let currentTime = HOVER_START + 0.25

        wordSpans.forEach((span, idx) => {
          tl.add(() => {
            if (!cursorRef.current) return
            const rect = span.getBoundingClientRect()
            gsap.to(cursorRef.current, {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height * 0.7,
              duration: idx === 0 ? 0.2 : MOVE_DURATION,
              ease: "expo.out",
            })
          }, currentTime)

          tl.to(span, {
            scale: SCALE_UP,
            color: "#6ee7b7",
            duration: SCALE_DURATION,
            ease: "power2.out",
          }, currentTime + (idx === 0 ? 0.1 : MOVE_DURATION * 0.6))

          if (idx > 0) {
            tl.to(wordSpans[idx - 1], {
              scale: 1,
              color: "#ffffff",
              duration: SCALE_DURATION,
              ease: "power2.out",
            }, currentTime + 0.05)
          }

          currentTime += (idx === 0 ? 0.25 : MOVE_DURATION) + DWELL_TIME
        })

        tl.to(wordSpans[wordSpans.length - 1], {
          scale: 1,
          color: "#ffffff",
          duration: SCALE_DURATION,
          ease: "power2.out",
        }, currentTime)

        // Cursor fades out
        tl.to(cursorRef.current, {
          opacity: 0,
          scale: 0.8,
          y: "+=20",
          duration: 0.4,
          ease: "power2.inOut",
        }, currentTime + 0.1)

        currentTime += 0.4

        // ============================================
        // 4️⃣ FINAL SCREEN: Name emerges from Phase 3's exit state
        // ============================================
        const FINAL_TRANSITION_START = currentTime

        // Third text drifts slightly upward while fading (energy continues)
        tl.to(thirdTextRef.current, {
          opacity: 0,
          scale: 0.95,
          y: -10,
          filter: "blur(6px)",
          duration: 0.8,
          ease: "power2.inOut",
        }, FINAL_TRANSITION_START)

        if (finalNameRef.current) {
          // Initial state bridges Phase 3's exit blur
          finalNameRef.current.style.opacity = "0"
          finalNameRef.current.style.transform = "scale(1.02) translateY(-8px)"
          finalNameRef.current.style.filter = "blur(6px)" // Matches Phase 3 exit blur
          finalNameRef.current.textContent = "Avadhoot Ganesh Mahadik"

          const FINAL_START = FINAL_TRANSITION_START + 0.25 // Tighter overlap (was +0.4)

          // Name emerges from blur — subtle scale and position shift
          tl.to(finalNameRef.current, {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.0,
            ease: "power2.out",
          }, FINAL_START)

          if (clickTextRef.current) {
            clickTextRef.current.style.opacity = "0"
            clickTextRef.current.style.transform = "translateY(-4px)"
            clickTextRef.current.style.filter = "blur(3px)"

            tl.to(clickTextRef.current, {
              opacity: 0.7,
              y: 0,
              filter: "blur(0px)",
              duration: 0.8,
              ease: "power2.out",
              onComplete: () => {
                setCtaReady(true)
                if (clickTextRef.current) {
                  gsap.to(clickTextRef.current, {
                    opacity: 0.3,
                    duration: 1.5,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                  })
                }
              },
            }, FINAL_START + 0.4) // Tighter (was +0.6)

            tl.add(() => {
              setAnimationComplete(true)
            }, FINAL_START + 0.8)
          }
        }
      }
    }

    runAnimationSequence()

    // Cleanup GSAP animations and tickers
    return () => {
      if (tickerFnRef) gsap.ticker.remove(tickerFnRef)
      timelineRef?.kill()
      gsap.killTweensOf("*")
    }
  }, [])

  // Handle click to dismiss
  const handleClick = () => {
    if (!ctaReady || !animationComplete || !isLoaded) return
    if (!containerRef.current) return

    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 1.05,
      filter: "blur(6px)",
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        setShowScreen(false)
        onDismiss?.()
      },
    })
  }

  // Fallback: auto-dismiss if user doesn't click after 5s
  useEffect(() => {
    if (animationComplete && isLoaded && ctaReady) {
      const timer = setTimeout(() => {
        handleClick()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [animationComplete, isLoaded, ctaReady])

  if (!showScreen) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center bg-white cursor-pointer"
      onClick={handleClick}
    >
      {/* 1️⃣ First Text */}
      <div
        ref={firstTextRef}
        className="absolute text-black font-bold text-[8vw] text-center leading-tight"
        style={{
          maxWidth: "70%",
          fontFamily: "system-ui, -apple-system, sans-serif",
          opacity: 1,
          transform: "scale(1.15)",
          transformOrigin: "center center",
        }}
      />

      {/* 2️⃣ Second Text */}
      <div
        ref={secondTextRef}
        className="absolute inset-0 text-[8vw] font-bold text-center leading-tight"
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          opacity: 0,
        }}
      />

      {/* Background transition overlay */}
      <div ref={bgTransitionRef} />

      {/* 3️⃣ Third Text */}
      <div
        ref={thirdTextRef}
        className="absolute text-white font-bold text-[5vw] text-center leading-tight"
        style={{
          maxWidth: "80%",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "none",
        }}
      />

      {/* Cursor for third animation */}
      <div
        ref={cursorRef}
        className="absolute opacity-0 pointer-events-none"
        style={{
          width: "12px",
          height: "18px",
          left: 0,
          top: 0,
          transform: "translate(-50%, -50%)",
        }}
      >
        <svg
          viewBox="0 0 16 24"
          width="100%"
          height="100%"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 1L2 16h4l2-4 2 4h4L8 1Z" />
        </svg>
      </div>

      {/* 4️⃣ Final Name + CTA */}
      <div className="absolute flex flex-col items-center gap-6">
        <div
          ref={finalNameRef}
          className="italic font-bold text-[7vw] text-center leading-tight"
          style={{
            maxWidth: "80%",
            fontFamily: "'Eckmannpsych Small', Eckmannpsych, system-ui, -apple-system, sans-serif",
            color: "#39FF14",
          }}
        />
        <div
          ref={clickTextRef}
          className="text-center"
          style={{
            fontFamily: "'Eckmannpsych Small', Eckmannpsych, system-ui, -apple-system, sans-serif",
            fontSize: "clamp(0.85rem, 1.2vw, 1.1rem)",
            letterSpacing: "0.15em",
            color: "#ffff3f",
            opacity: 0,
          }}
        >
          Click to enter
        </div>
      </div>
    </div>
  )
}
