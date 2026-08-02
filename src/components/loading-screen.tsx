"use client"

import { useState, useEffect, useRef } from "react"
import gsap from "gsap"

interface LoadingScreenProps {
  isLoaded: boolean
  onDismiss?: () => void
}

const SVG_NS = "http://www.w3.org/2000/svg"

// The phrase, split into color segments. "Tech" and "Impact" are the accent words.
const SEGMENTS: { text: string; color: string }[] = [
  { text: "Building", color: "#ffffff" },
  { text: "Tech", color: "#39FF14" },
  { text: "that", color: "#ffffff" },
  { text: "creates", color: "#ffffff" },
  { text: "Impact", color: "#39FF14" },
]

export function LoadingScreen({ isLoaded, onDismiss }: LoadingScreenProps) {
  const [animationComplete, setAnimationComplete] = useState(false)
  const [showScreen, setShowScreen] = useState(true)
  const [ctaReady, setCtaReady] = useState(false)

  // Refs for animation targets
  const containerRef = useRef<HTMLDivElement>(null)
  const unifiedTextRef = useRef<HTMLDivElement>(null)
  const finalNameRef = useRef<HTMLDivElement>(null)
  const clickTextRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    let timelineRef: gsap.core.Timeline | null = null

    // Build the handwriting SVG from a cursive font and return the drawable paths.
    const buildHandwriting = (font: {
      getPaths: (t: string, x: number, y: number, s: number) => Array<{
        toPathData: (n: number) => string
        getBoundingBox: () => { x1: number; y1: number; x2: number; y2: number }
      }>
    }): SVGPathElement[] => {
      if (!unifiedTextRef.current) return []

      const FS = 100
      const STROKE = 1.2
      const text = SEGMENTS.map((s) => s.text).join(" ")

      // Single traversal → one glyph path per character (1:1, spaces included).
      // Repeated per-word getPath() calls corrupt the font's internal glyph
      // state (producing NaN coordinates), so we lay out everything in one pass
      // and slice the glyphs per word for coloring.
      const glyphPaths = font.getPaths(text, 0, 0, FS)

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      const pathEls: SVGPathElement[] = []
      let charIdx = 0

      SEGMENTS.forEach((seg) => {
        let d = ""
        for (let k = 0; k < seg.text.length; k++) {
          const gp = glyphPaths[charIdx + k]
          if (!gp) continue
          d += gp.toPathData(2)
          const bb = gp.getBoundingBox()
          if (isFinite(bb.x1)) {
            minX = Math.min(minX, bb.x1)
            minY = Math.min(minY, bb.y1)
            maxX = Math.max(maxX, bb.x2)
            maxY = Math.max(maxY, bb.y2)
          }
        }
        charIdx += seg.text.length + 1 // skip the word's trailing space glyph

        const el = document.createElementNS(SVG_NS, "path")
        el.setAttribute("d", d)
        el.setAttribute("fill", seg.color)
        el.setAttribute("stroke", seg.color)
        el.setAttribute("stroke-width", String(STROKE))
        el.setAttribute("stroke-linecap", "round")
        el.setAttribute("stroke-linejoin", "round")
        el.style.fillOpacity = "0"
        pathEls.push(el)
      })

      const pad = 16
      const svg = document.createElementNS(SVG_NS, "svg")
      svg.setAttribute(
        "viewBox",
        `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`
      )
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet")
      svg.style.width = "100%"
      svg.style.height = "auto"
      svg.style.overflow = "visible"
      pathEls.forEach((el) => svg.appendChild(el))

      unifiedTextRef.current.innerHTML = ""
      unifiedTextRef.current.appendChild(svg)
      return pathEls
    }

    // Fallback rendering if the font can't be loaded — plain two-tone text.
    const buildFallback = (): HTMLElement[] => {
      if (!unifiedTextRef.current) return []
      unifiedTextRef.current.innerHTML = ""
      const spans: HTMLElement[] = []
      SEGMENTS.forEach((seg, i) => {
        const span = document.createElement("span")
        span.textContent = seg.text
        span.style.color = seg.color
        span.style.opacity = "0"
        span.style.marginRight = "0.3em"
        span.style.display = "inline-block"
        span.style.fontStyle = "italic"
        span.style.fontFamily = "cursive"
        unifiedTextRef.current!.appendChild(span)
        spans.push(span)
        if (i < SEGMENTS.length - 1) {
          unifiedTextRef.current!.appendChild(document.createTextNode(" "))
        }
      })
      return spans
    }

    const runAnimationSequence = async () => {
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
      // ✍️  UNIFIED INTRO: "Building Tech that creates Impact"
      // macOS "Hello" inspired — the phrase is drawn in cursive, stroke by
      // stroke, one word after another, then the ink fills in. The accent
      // words ("Tech", "Impact") are written in green.
      // ============================================
      let pathEls: SVGPathElement[] = []
      try {
        const mod = await import("opentype.js")
        const opentype = (mod as { default?: unknown }).default ?? mod
        const res = await fetch("/fonts/Sacramento.ttf")
        const buf = await res.arrayBuffer()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const font = (opentype as any).parse(buf)
        if (cancelled) return
        pathEls = buildHandwriting(font)
      } catch {
        pathEls = []
      }
      if (cancelled) return

      const tl = gsap.timeline()
      timelineRef = tl

      const START = 0.35
      let REVEAL_END: number

      if (pathEls.length > 0) {
        // ── Handwriting draw ──
        const DRAW = 0.75
        const STAGGER = 0.3

        pathEls.forEach((el, i) => {
          const len = el.getTotalLength()
          gsap.set(el, { strokeDasharray: len, strokeDashoffset: len })

          const t = START + i * STAGGER
          // Pen traces the letters
          tl.to(el, { strokeDashoffset: 0, duration: DRAW, ease: "power1.inOut" }, t)
          // Ink fills in behind the pen
          tl.to(el, { fillOpacity: 1, duration: 0.5, ease: "power2.out" }, t + DRAW * 0.5)
        })

        REVEAL_END = START + (pathEls.length - 1) * STAGGER + DRAW
      } else {
        // ── Fallback: simple two-tone fade ──
        const spans = buildFallback()
        tl.to(
          spans,
          { opacity: 1, duration: 0.6, stagger: 0.12, ease: "power2.out" },
          START
        )
        REVEAL_END = START + spans.length * 0.12 + 0.6
      }

      // Cinematic exit: the whole line scales down and blurs away on black.
      const EXIT_START = REVEAL_END + 0.9
      const FADEOUT_START = EXIT_START

      tl.to(
        unifiedTextRef.current,
        {
          scale: 0.92,
          opacity: 0,
          filter: "blur(8px)",
          duration: 0.9,
          ease: "power2.inOut",
        },
        EXIT_START
      )

      // ============================================
      // 🏁 FINAL SCREEN: Name emerges from the intro's exit blur
      // ============================================
      const FINAL_TRANSITION_START = FADEOUT_START + 0.6

      if (finalNameRef.current) {
        // Initial state bridges the intro's exit blur
        finalNameRef.current.style.opacity = "0"
        finalNameRef.current.style.transform = "scale(1.02) translateY(-8px)"
        finalNameRef.current.style.filter = "blur(6px)"
        finalNameRef.current.textContent = "Avadhoot Ganesh Mahadik"

        const FINAL_START = FINAL_TRANSITION_START + 0.25

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
          }, FINAL_START + 0.4)

          tl.add(() => {
            setAnimationComplete(true)
          }, FINAL_START + 0.8)
        }
      }
    }

    runAnimationSequence()

    // Cleanup GSAP animations
    return () => {
      cancelled = true
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
      className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center bg-black cursor-pointer"
      onClick={handleClick}
    >
      {/* ✍️ Unified Handwriting Intro */}
      <div
        ref={unifiedTextRef}
        className="text-[8vw] font-bold text-center leading-tight"
        style={{
          width: "min(92vw, 1150px)",
          transformOrigin: "center center",
          opacity: 1,
        }}
      />

      {/* 🏁 Final Name + CTA */}
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
