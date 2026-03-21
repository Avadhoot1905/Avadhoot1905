"use client"

import { useState, useEffect, useRef } from "react"
import gsap from "gsap"

interface LoadingScreenProps {
  isLoaded: boolean
}

export function LoadingScreen({ isLoaded }: LoadingScreenProps) {
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
    const runAnimationSequence = async () => {
      const tl = gsap.timeline()

      // ============================================
      // 1️⃣ FIRST TEXT: Zoomed-in word-by-word reveal + zoom-out
      // ============================================
      if (firstTextRef.current) {
        const words = ["Simple", "on", "the", "surface."]

        // Clear and set up container — starts zoomed in
        firstTextRef.current.innerHTML = ""
        firstTextRef.current.style.opacity = "1"
        firstTextRef.current.style.transform = "scale(1.4)"
        firstTextRef.current.style.transformOrigin = "center center"

        // Create word spans (hidden initially)
        const wordSpans: HTMLElement[] = []
        words.forEach((word, idx) => {
          const span = document.createElement("span")
          span.textContent = word
          span.style.display = "inline-block"
          span.style.opacity = "0"
          span.style.transform = "translateY(12px)"
          span.style.marginRight = "0.35em"
          firstTextRef.current!.appendChild(span)
          wordSpans.push(span)
        })

        // Phase 1 + 2: Words appear one by one with subtle rise
        tl.fromTo(
          wordSpans,
          {
            opacity: 0,
            y: 12,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.25,
            ease: "power2.out",
          },
          0.1
        )

        // Phase 3: Smooth zoom-out after all words are visible
        // Words finish at: 0.1 + 0.3 + (3 * 0.25) = 1.15s
        tl.to(
          firstTextRef.current,
          {
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
          },
          1.2
        )

        // Fade out first text before second text appears
        tl.to(
          firstTextRef.current,
          {
            opacity: 0,
            duration: 0.3,
          },
          2.0
        )
      }

      // ============================================
      // 2️⃣ SECOND TEXT: Background transition + Word-by-word with drag effect
      // ============================================
      // Transition background to black (starts at 2.0s when first text fades)
      tl.to(
        containerRef.current,
        {
          backgroundColor: "#000000",
          duration: 0.6,
        },
        2.0
      )

      if (secondTextRef.current && bgTransitionRef.current) {
        // Clear container
        secondTextRef.current.innerHTML = ""
        secondTextRef.current.style.opacity = "1"
        secondTextRef.current.style.overflow = "hidden"

        // --- 3-Phase Upward Pull Through Focus Plane ---
        //
        // Phase 1: STATIC FOCUS (0–0.6s)
        //   One text at center, motionless, sharp, scaled up. Visual anchor.
        //
        // Phase 2: SLOW PULL (0.6–1.1s)
        //   Ticker starts at low speed (~90 px/s). Hidden nodes below
        //   gradually enter view. Feels like something is pulling the text.
        //
        // Phase 3: FULL ACCELERATION (1.1s+)
        //   Speed ramps from 90 → 340 px/s. Full conveyor cascade.

        const PHASE_START = 2.2       // timeline position to show focal text
        const HOLD_DURATION = 0.6     // seconds of static focus
        const MOTION_START = PHASE_START + HOLD_DURATION  // when ticker begins
        const RUN_DURATION = 2.0      // total ticker running time

        const INITIAL_SPEED = 90      // px/sec at motion start
        const MAX_SPEED = 10000        // px/sec at full cascade
        const ACCEL = 1000             // px/sec² acceleration rate

        const NODE_COUNT = 7
        const SPACING = 120           // px between nodes

        const container = secondTextRef.current
        const containerHeight = container.getBoundingClientRect().height || window.innerHeight

        // Boundaries (relative to container center, y=0)
        const TOP_EXIT = -(containerHeight / 2) - 60
        const BOTTOM_ENTRY = (containerHeight / 2) + 60

        // --- Create nodes ---
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
          el.innerHTML = `<span class="text-emerald-400 font-bold italic">Distributed</span><span class="text-white italic">underneath</span>`
          container.appendChild(el)
          nodes.push(el)

          if (i === 0) {
            // First node: centered (y=0), visible — the focal anchor
            nodePositions[i] = 0
          } else {
            // Rest: stacked below, hidden — will enter as motion begins
            nodePositions[i] = i * SPACING
          }
        }

        // --- Depth styling based on vertical position ---
        const applyDepth = (el: HTMLElement, y: number) => {
          const halfRange = containerHeight / 2 + 60
          const distFromCenter = Math.abs(y) / halfRange
          const focus = Math.max(0, 1 - distFromCenter)

          // Scale: 0.82 at edges → 1.15 at center
          const scale = 0.82 + focus * 0.33

          // Opacity: quadratic falloff for sharper center emphasis
          const opacity = Math.min(1, Math.max(0, focus * focus * 1.15))

          // Blur: 3px at edges → 0px at center
          const blur = (1 - focus) * 3

          el.style.transform = `translate(-50%, -50%) translateY(${y}px) scale(${scale})`
          el.style.opacity = String(opacity)
          el.style.filter = `blur(${blur.toFixed(1)}px)`
        }

        // --- Phase 1: Show focal text (static, centered) ---
        // Hide all nodes initially
        for (let i = 0; i < NODE_COUNT; i++) {
          nodes[i].style.opacity = "0"
          nodes[i].style.transform = `translate(-50%, -50%) translateY(${nodePositions[i]}px) scale(0.82)`
          nodes[i].style.filter = "blur(3px)"
        }

        // Fade in the focal node (index 0) at center
        tl.to(
          nodes[0],
          {
            opacity: 1,
            scale: 1.08,
            filter: "blur(0px)",
            duration: 0.35,
            ease: "power2.out",
            onUpdate: function () {
              // Keep the focal node at center with the animated scale
              const s = 1 + this.progress() * 0.08
              nodes[0].style.transform = `translate(-50%, -50%) translateY(0px) scale(${s})`
              nodes[0].style.filter = `blur(${((1 - this.progress()) * 2).toFixed(1)}px)`
            },
          },
          PHASE_START
        )

        // --- Phase 2 & 3: Ticker-driven motion with acceleration ---
        let tickerActive = false
        let speed = INITIAL_SPEED
        let elapsedTime = 0

        const tickerFn = () => {
          if (!tickerActive) return

          const dt = gsap.ticker.deltaRatio() / 60
          elapsedTime += dt

          // Progressive acceleration: ramp speed over time
          if (speed < MAX_SPEED) {
            speed = Math.min(MAX_SPEED, speed + ACCEL * dt)
          }

          const moveAmount = speed * dt

          for (let i = 0; i < NODE_COUNT; i++) {
            nodePositions[i] -= moveAmount // move upward

            // Recycle: if exited above, wrap to below the lowest node
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

        // Start the ticker (motion begins) after the static hold
        tl.add(() => {
          tickerActive = true
          gsap.ticker.add(tickerFn)
        }, MOTION_START)

        // Stop the ticker
        const stopTime = MOTION_START + RUN_DURATION
        tl.add(() => {
          tickerActive = false
          gsap.ticker.remove(tickerFn)
        }, stopTime)

        // Fade out all nodes and container
        const fadeOutStart = stopTime + 0.1
        tl.add(() => {
          gsap.to(nodes, {
            opacity: 0,
            duration: 0.35,
            ease: "power2.out",
          })
        }, fadeOutStart)

        tl.to(
          secondTextRef.current,
          {
            opacity: 0,
            duration: 0.15,
          },
          fadeOutStart + 0.35
        )
      }

      // ============================================
      // 3️⃣ THIRD TEXT: Cursor hover interaction with word scaling
      // ============================================
      if (thirdTextRef.current && cursorRef.current) {
        // Setup third text
        const thirdText = "That's usually the goal."
        if (thirdTextRef.current) {
          thirdTextRef.current.textContent = ""
          thirdTextRef.current.innerHTML = ""
        }

        const words = thirdText.split(" ").filter(w => w.length > 0)

        if (thirdTextRef.current) {
          words.forEach((word, idx) => {
            if (!thirdTextRef.current) return

            const span = document.createElement("span")
            span.textContent = word
            span.className = "inline-block mr-2 whitespace-nowrap"
            span.style.transformOrigin = "center center"
            span.style.transition = "none"  // GSAP handles transitions
            thirdTextRef.current.appendChild(span)

            if (idx < words.length - 1 && thirdTextRef.current) {
              thirdTextRef.current.appendChild(document.createTextNode(" "))
            }
          })
        }

        const wordSpans = Array.from(
          thirdTextRef.current?.querySelectorAll("span") || []
        ) as HTMLElement[]

        // Show third text container
        tl.add(
          () => {
            if (thirdTextRef.current) {
              thirdTextRef.current.style.display = "block"
              thirdTextRef.current.style.opacity = "0"
            }
          },
          5.2
        )

        if (thirdTextRef.current) {
          tl.to(
            thirdTextRef.current,
            {
              opacity: 1,
              duration: 0.2,
            },
            5.2
          )
        }

        // --- Sequential word-by-word cursor hover ---
        // Cursor moves directly to each word's center, triggering
        // a scale-up on arrival and reset on departure.

        const HOVER_START = 5.4        // when cursor appears and starts moving
        const MOVE_DURATION = 0.3      // time to move cursor to each word
        const DWELL_TIME = 0.15        // pause at each word before moving on
        const SCALE_UP = 1.3           // word scale on hover
        const SCALE_DURATION = 0.2     // scale animation duration

        // Position cursor near the first word before showing it
        tl.add(() => {
          if (!cursorRef.current || wordSpans.length === 0) return
          const firstRect = wordSpans[0].getBoundingClientRect()
          gsap.set(cursorRef.current, {
            x: firstRect.left + firstRect.width / 2,
            y: firstRect.top + firstRect.height * 0.7,
            opacity: 0,
          })
        }, HOVER_START - 0.05)

        // Fade in cursor
        tl.to(
          cursorRef.current,
          {
            opacity: 1,
            duration: 0.15,
            ease: "power2.out",
          },
          HOVER_START
        )

        // Move cursor word-by-word
        let currentTime = HOVER_START + 0.15

        wordSpans.forEach((span, idx) => {
          // Move cursor to this word's center
          tl.add(() => {
            if (!cursorRef.current) return
            const rect = span.getBoundingClientRect()
            gsap.to(cursorRef.current, {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height * 0.7,
              duration: idx === 0 ? 0.15 : MOVE_DURATION,
              ease: "power2.out",
            })
          }, currentTime)

          // Scale up this word (hover effect)
          tl.to(
            span,
            {
              scale: SCALE_UP,
              duration: SCALE_DURATION,
              ease: "power2.out",
              overwrite: "auto",
            },
            currentTime + (idx === 0 ? 0.08 : MOVE_DURATION * 0.6)
          )

          // Reset previous word
          if (idx > 0) {
            tl.to(
              wordSpans[idx - 1],
              {
                scale: 1,
                duration: SCALE_DURATION,
                ease: "power2.out",
                overwrite: "auto",
              },
              currentTime + 0.05
            )
          }

          // Advance time: move duration + dwell
          currentTime += (idx === 0 ? 0.25 : MOVE_DURATION) + DWELL_TIME
        })

        // Reset last word after all moves complete
        tl.to(
          wordSpans[wordSpans.length - 1],
          {
            scale: 1,
            duration: SCALE_DURATION,
            ease: "power2.out",
          },
          currentTime
        )

        // Hide cursor
        tl.to(
          cursorRef.current,
          {
            opacity: 0,
            duration: 0.25,
            ease: "power2.out",
          },
          currentTime + 0.1
        )
      }

      // ============================================
      // 4️⃣ FINAL SCREEN: Name display with fade-in + upward motion
      // ============================================
      // Hide third text
      tl.to(
        thirdTextRef.current,
        {
          opacity: 0,
          duration: 0.4,
        },
        7.5
      )

      if (finalNameRef.current) {
        finalNameRef.current.style.opacity = "0"
        finalNameRef.current.style.transform = "translateY(20px)"
        finalNameRef.current.textContent = "Avadhoot Ganesh Mahadik"

        // Fade in + upward motion (starts at 5.3s)
        tl.to(
          finalNameRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power1.out",
          },
          7.9
        )
      }

      // Mark animation as complete
      tl.add(() => {
        setAnimationComplete(true)
      })

      // --- "Click to enter" CTA ---
      // Appears 0.3s after name finishes (name ends at ~8.7s)
      if (clickTextRef.current) {
        clickTextRef.current.style.opacity = "0"
        clickTextRef.current.style.transform = "translateY(10px)"

        // Fade in with subtle rise
        tl.to(
          clickTextRef.current,
          {
            opacity: 0.7,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
              setCtaReady(true)
              // Start gentle opacity pulse
              if (clickTextRef.current) {
                gsap.to(clickTextRef.current, {
                  opacity: 0.4,
                  duration: 1.2,
                  ease: "sine.inOut",
                  repeat: -1,
                  yoyo: true,
                })
              }
            },
          },
          9.0
        )
      }
    }

    runAnimationSequence()
  }, [])

  // Handle click to dismiss
  const handleClick = () => {
    if (!ctaReady || !animationComplete || !isLoaded) return
    if (!containerRef.current) return

    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        setShowScreen(false)
      },
    })
  }

  // Fallback: auto-dismiss if user doesn't click after 3s
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
          transform: "scale(1.4)",
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
          className="text-emerald-400 italic font-bold text-[7vw] text-center leading-tight"
          style={{
            maxWidth: "80%",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        />
        <div
          ref={clickTextRef}
          className="text-white text-center"
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "1.2vw",
            letterSpacing: "0.15em",
            opacity: 0,
          }}
        >
          Click to enter
        </div>
      </div>
    </div>
  )
}
