"use client"

import { useState, useEffect, useRef } from "react"
import gsap from "gsap"

interface LoadingScreenProps {
  isLoaded: boolean
}

export function LoadingScreen({ isLoaded }: LoadingScreenProps) {
  const [animationComplete, setAnimationComplete] = useState(false)
  const [showScreen, setShowScreen] = useState(true)

  // Refs for animation targets
  const containerRef = useRef<HTMLDivElement>(null)
  const firstTextRef = useRef<HTMLDivElement>(null)
  const bgTransitionRef = useRef<HTMLDivElement>(null)
  const secondTextRef = useRef<HTMLDivElement>(null)
  const thirdTextRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const finalNameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const runAnimationSequence = async () => {
      const tl = gsap.timeline()

      // ============================================
      // 1️⃣ FIRST TEXT: Typewriter Effect
      // ============================================
      if (firstTextRef.current) {
        const firstText = "Simple on the surface."
        firstTextRef.current.textContent = ""
        firstTextRef.current.style.opacity = "1"

        tl.to(
          firstTextRef.current,
          {
            // Typewriter effect: reveal text character by character
            onUpdate: function () {
              const progress = this.progress()
              const charCount = Math.floor(progress * firstText.length)
              firstTextRef.current!.textContent = firstText.slice(0, charCount)
            },
            duration: 1.5,
            ease: "power1.inOut",
          },
          0
        )

        // Add cursor blink at the end
        tl.to(
          firstTextRef.current,
          {
            onUpdate: function () {
              if (firstTextRef.current) {
                firstTextRef.current.textContent = firstText
              }
            },
            duration: 0.3,
          },
          0.8
        )

        // Hide first text completely before second text appears
        tl.to(
          firstTextRef.current,
          {
            opacity: 0,
            duration: 0.3,
          },
          1.3
        )
      }

      // ============================================
      // 2️⃣ SECOND TEXT: Background transition + Word-by-word with drag effect
      // ============================================
      // Transition background to black (starts at 1.3s when first text hides)
      tl.to(
        containerRef.current,
        {
          backgroundColor: "#000000",
          duration: 0.6,
        },
        1.3
      )

      if (secondTextRef.current && bgTransitionRef.current) {
        // Clear container
        secondTextRef.current.innerHTML = ""
        secondTextRef.current.style.opacity = "0"
        
        // Create main text
        const mainText = document.createElement("div")
        mainText.style.display = "flex"
        mainText.style.justifyContent = "center"
        mainText.style.alignItems = "center"
        mainText.style.gap = "0.75rem"
        mainText.innerHTML = `<span class="text-emerald-400 font-bold italic">Distributed</span><span class="text-white italic">underneath</span>`
        secondTextRef.current.appendChild(mainText)

        // Fade in main text container (after first text is done)
        tl.to(secondTextRef.current, { opacity: 1, duration: 0.4 }, 1.5)

        // Create stacking layers
        const stackingCount = 5
        const stackLayers: HTMLElement[] = []
        const viewportHeight = window.innerHeight

        for (let i = 0; i < stackingCount; i++) {
          const layer = document.createElement("div")
          layer.style.position = "absolute"
          layer.style.left = "0"
          layer.style.top = "0"
          layer.style.width = "100%"
          layer.style.height = "100%"
          layer.style.display = "flex"
          layer.style.justifyContent = "center"
          layer.style.alignItems = "center"
          layer.style.gap = "0.75rem"
          layer.style.pointerEvents = "none"
          layer.style.opacity = `${1 - (i * 0.22)}`
          layer.innerHTML = `<span class="text-emerald-400 font-bold italic">Distributed</span><span class="text-white italic">underneath</span>`
          
          secondTextRef.current.appendChild(layer)
          stackLayers.push(layer)
        }

        // Animate each layer falling faster and further
        stackLayers.forEach((layer, idx) => {
          const startTime = 1.9 + idx * 0.1
          const duration = 0.4 + idx * 0.15
          const fallDistance = (viewportHeight * 0.7) + idx * (viewportHeight * 0.2)

          tl.to(
            layer,
            {
              y: fallDistance,
              duration: duration,
              ease: "power2.in",
            },
            startTime
          )
        })

        // Hide all stacking layers
        tl.to(
          stackLayers,
          {
            opacity: 0,
            duration: 0.15,
          },
          2.9
        )

        // Hide main text container
        tl.to(
          secondTextRef.current,
          {
            opacity: 0,
            duration: 0.15,
          },
          3.05
        )
      }

      // ============================================
      // 3️⃣ THIRD TEXT: Cursor interaction with word scaling
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
            thirdTextRef.current.appendChild(span)

            if (idx < words.length - 1 && thirdTextRef.current) {
              thirdTextRef.current.appendChild(document.createTextNode(" "))
            }
          })
        }

        const wordSpans = thirdTextRef.current?.querySelectorAll("span") || []

        // Show third text container and fade in after pop effect
        tl.add(
          () => {
            if (thirdTextRef.current) {
              thirdTextRef.current.style.display = "block"
              thirdTextRef.current.style.opacity = "0"
            }
          },
          3.2
        )

        if (thirdTextRef.current) {
          tl.to(
            thirdTextRef.current,
            {
              opacity: 1,
              duration: 0.2,
            },
            3.2
          )
        }

        // Cursor movement across text (starts at 3.3s)
        tl.to(
          cursorRef.current,
          {
            x: window.innerWidth * 0.3, // Move cursor across screen
            duration: 1.5,
            ease: "power1.inOut",
            onUpdate: function () {
              const progress = this.progress()
              const wordIndex = Math.floor(progress * wordSpans.length)

              wordSpans.forEach((span, idx) => {
                if (idx <= wordIndex) {
                  gsap.to(span, {
                    scale: 1.2,
                    duration: 0.3,
                    overwrite: "auto",
                  })
                } else {
                  gsap.to(span, {
                    scale: 1,
                    duration: 0.3,
                    overwrite: "auto",
                  })
                }
              })
            },
          },
          3.3
        )

        // Hide cursor at the end
        tl.to(
          cursorRef.current,
          {
            opacity: 0,
            duration: 0.3,
          },
          4.8
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
        4.9
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
          5.3
        )
      }

      // Mark animation as complete
      tl.add(() => {
        setAnimationComplete(true)
      })
    }

    runAnimationSequence()
  }, [])

  // Unmount when both animation is complete AND assets are loaded
  useEffect(() => {
    if (animationComplete && isLoaded) {
      const timer = setTimeout(() => {
        setShowScreen(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [animationComplete, isLoaded])

  if (!showScreen) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center bg-white"
    >
      {/* 1️⃣ First Text */}
      <div
        ref={firstTextRef}
        className="absolute text-black font-bold text-[8vw] text-center leading-tight"
        style={{
          maxWidth: "70%",
          fontFamily: "system-ui, -apple-system, sans-serif",
          opacity: 1,
        }}
      />

      {/* 2️⃣ Second Text */}
      <div
        ref={secondTextRef}
        className="absolute text-[8vw] font-bold text-center leading-tight"
        style={{
          maxWidth: "70%",
          fontFamily: "system-ui, -apple-system, sans-serif",
          opacity: 0,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
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
        className="absolute w-1 h-[5vw] bg-white opacity-0 pointer-events-none"
        style={{
          left: "25%",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />

      {/* 4️⃣ Final Name */}
      <div
        ref={finalNameRef}
        className="absolute text-emerald-400 italic font-bold text-[7vw] text-center leading-tight"
        style={{
          maxWidth: "80%",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      />
    </div>
  )
}
