"use client"

import { useState, useEffect, useRef } from "react"
import gsap from "gsap"

interface LockScreenProps {
  isLocked: boolean
  onUnlock: () => void
}

export function LockScreen({ isLocked, onUnlock }: LockScreenProps) {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isMobile, setIsMobile] = useState(false)
  const [shouldRender, setShouldRender] = useState(isLocked)

  const containerRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const promptRef = useRef<HTMLDivElement>(null)
  const bounceRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    setMounted(true)

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      clearInterval(timer)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Handle lock/unlock GSAP animations
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      if (isLocked && containerRef.current) {
        gsap.set(containerRef.current, { y: "0%" })
      }
      return
    }

    if (isLocked) {
      setShouldRender(true)
      if (containerRef.current) {
        gsap.fromTo(containerRef.current,
          { y: "-100%" },
          { y: "0%", duration: 0.8, ease: "power3.inOut" }
        )
      }
    } else {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          y: "-100%",
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => setShouldRender(false)
        })
      } else {
        setShouldRender(false)
      }
    }
  }, [isLocked])

  // Handle entrance animations for internal elements
  useEffect(() => {
    if (shouldRender) {
      if (timeRef.current) {
        gsap.fromTo(timeRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.5, delay: 0.5, ease: "power2.out" }
        )
      }

      if (promptRef.current) {
        gsap.fromTo(promptRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, delay: 1, ease: "power2.out" }
        )
      }

      if (bounceRef.current) {
        gsap.to(bounceRef.current, {
          y: -8,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        })
      }
    }
  }, [shouldRender])

  const handleClick = () => {
    onUnlock()
  }

  if (!mounted) return null
  if (!shouldRender) return null

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[20000] flex flex-col items-center justify-center cursor-pointer"
      style={{
        backgroundImage: isMobile
          ? 'url(/assets/lock-screen-phone.webp)'
          : 'url(/assets/tahoe.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transform: 'translateY(0%)'
      }}
      onClick={handleClick}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Time display at top - iOS style */}
      <div
        ref={timeRef}
        className={`absolute left-1/2 transform -translate-x-1/2 text-center z-10 ${isMobile ? 'top-24' : 'top-16'
          }`}
      >
        <div className={`font-bold tracking-tight text-white mb-1 ${isMobile ? 'text-7xl' : 'text-8xl'
          }`}>
          {formatTime(currentTime)}
        </div>
        <div className={`font-medium text-white/90 ${isMobile ? 'text-lg' : 'text-2xl font-bold text-white/70'
          }`}>
          {formatDate(currentTime)}
        </div>
      </div>

      {/* Bottom section with unlock prompt */}
      <div className={`absolute left-1/2 transform -translate-x-1/2 text-center text-white z-10 ${isMobile ? 'bottom-32' : 'bottom-8'
        }`}>
        {/* Unlock instruction */}
        <div
          ref={promptRef}
          className="mb-6"
        >
          <div className={`font-light mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
            {isMobile ? 'Swipe up to unlock' : 'Click anywhere to unlock'}
          </div>
          <div ref={bounceRef} className={!isMobile ? "inline-block" : "flex justify-center"}>
            {!isMobile ? (
              <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/60 rounded-full mt-2" />
              </div>
            ) : (
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/70"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            )}
          </div>
        </div>

        {/* Glassmorphic branding panel */}
        <div
          className={`px-6 py-3 rounded-2xl backdrop-blur-xl border border-white/20 ${isMobile ? 'rounded-full' : ''
            }`}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)'
          }}
        >
          <div className={`text-white/80 font-light ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Avadhoot Ganesh Mahadik
          </div>
        </div>
      </div>
    </div>
  )
}

