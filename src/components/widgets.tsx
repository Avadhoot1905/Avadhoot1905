"use client"

import { useState, useEffect, memo, type ReactNode } from "react"
import { useTheme } from "next-themes"
import { LiquidGlassCard } from "./liquid-glass-surface"

// Self-contained clock leaf: only the date text re-renders each second, not the
// blurred widget cards around it.
function Clock({ children }: { children: (now: Date) => ReactNode }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return <>{children(now)}</>
}

function WidgetsComponent() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [weather, setWeather] = useState({
    temp: 28,
    condition: "Sunny",
    high: 32,
    low: 24,
    icon: "☀️"
  })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Fetch weather data for Bangalore
    const fetchWeatherData = async () => {
      try {
        // Using Open-Meteo API (free, no API key required) for Bangalore coordinates
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Kolkata'
        )
        const data = await response.json()

        const temp = Math.round(data.current.temperature_2m)
        const high = Math.round(data.daily.temperature_2m_max[0])
        const low = Math.round(data.daily.temperature_2m_min[0])
        const weatherCode = data.current.weather_code

        // Map weather codes to conditions
        let condition = "Clear"
        let icon = "☀️"

        if (weatherCode === 0) {
          condition = "Clear"
          icon = "☀️"
        } else if (weatherCode <= 3) {
          condition = "Partly Cloudy"
          icon = "⛅"
        } else if (weatherCode <= 67) {
          condition = "Rainy"
          icon = "🌧️"
        } else if (weatherCode <= 77) {
          condition = "Snowy"
          icon = "❄️"
        } else if (weatherCode <= 82) {
          condition = "Rainy"
          icon = "🌧️"
        } else {
          condition = "Stormy"
          icon = "⛈️"
        }

        setWeather({ temp, condition, high, low, icon })
      } catch (error) {
        console.error('Failed to fetch weather:', error)
      }
    }

    fetchWeatherData()

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const getDayName = (now: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[now.getDay()]
  }

  const getMonthName = (now: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[now.getMonth()]
  }

  const getDate = (now: Date) => {
    return now.getDate()
  }

  if (!mounted) return null

  return (
    <div
      data-widget="true"
      onPointerDown={(e) => e.stopPropagation()}
      className={`z-[1] ${isMobile
          ? 'relative w-full max-w-md mx-auto px-6 grid grid-cols-2 gap-x-4 mb-8 mt-4'
          : 'fixed top-14 left-6 flex gap-4 flex-row items-start'
        }`}
    >
      {/* Date & Time Widget — liquid-glass card (desktop + phone) */}
      {(() => {
        const dateContent = (
          <Clock>
            {(now) => (
              <>
                <div className="flex items-center justify-center">
                  <span className={`font-bold ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'
                    } ${isMobile ? 'text-sm' : 'text-lg'}`}>
                    {getDayName(now)} {getMonthName(now)}
                  </span>
                </div>
                <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  } font-bold ${isMobile ? 'text-5xl' : 'text-7xl'} leading-none flex items-center justify-center flex-1`}>
                  {getDate(now)}
                </div>
              </>
            )}
          </Clock>
        )

        // Refractive liquid-glass card — measured, so it works on the desktop
        // fixed size and the responsive phone grid alike.
        return (
          <LiquidGlassCard
            className={`shadow-lg ${isMobile ? 'w-full aspect-square' : 'w-44 h-44'}`}
            radius={24}
            contentClassName={`rounded-[1.5rem] border ${theme === 'dark'
                ? 'bg-white/[0.06] border-white/15'
                : 'bg-white/[0.04] border-white/30'} p-4 flex flex-col justify-between`}
          >
            {dateContent}
          </LiquidGlassCard>
        )
      })()}

      {/* Weather Widget — same liquid-glass card as the Date widget */}
      {(() => {
        const weatherContent = (
          <>
            <span className={`font-bold ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'
              } ${isMobile ? 'text-xs' : 'text-base'}`}>
              Bangalore
            </span>
            <div className="flex-1 flex flex-col items-center justify-center mt-1">
              <span className={`${isMobile ? 'text-3xl' : 'text-5xl'} mb-1`}>
                {weather.icon}
              </span>
              <span className={`font-bold ${theme === 'dark' ? 'text-white/80' : 'text-gray-800'
                } ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
                {weather.condition}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'
                } font-bold ${isMobile ? 'text-2xl' : 'text-4xl'} leading-none`}>
                {weather.temp}°
              </div>
              <span className={`font-bold ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'
                } ${isMobile ? 'text-[9px]' : 'text-xs'}`}>
                H: {weather.high}° L: {weather.low}°
              </span>
            </div>
          </>
        )

        return (
          <LiquidGlassCard
            className={`shadow-lg ${isMobile ? 'w-full aspect-square' : 'w-44 h-44'}`}
            radius={24}
            contentClassName={`rounded-[1.5rem] border ${theme === 'dark'
                ? 'bg-white/[0.06] border-white/15'
                : 'bg-white/[0.04] border-white/30'} p-4 flex flex-col justify-between`}
          >
            {weatherContent}
          </LiquidGlassCard>
        )
      })()}
    </div>
  )
}

// Memoized and prop-less, so once mounted the widgets never re-render from
// MacOSDesktop's frequent state churn (selection, window open/close, activity).
// The clock's per-second tick is already isolated in the inner <Clock> leaf, and
// the weather fetch updates this component's own state — both still work.
export const Widgets = memo(WidgetsComponent)
