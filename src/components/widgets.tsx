"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

export function Widgets() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
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

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Fetch weather data for Bangalore
    fetchWeather()

    return () => {
      window.removeEventListener('resize', checkMobile)
      clearInterval(timer)
    }
  }, [])

  const fetchWeather = async () => {
    try {
      // Using Open-Meteo API (free, no API key required) for Bangalore coordinates
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Kolkata'
      )
      const data = await response.json()
      
      const weatherCode = data.current.weather_code
      const condition = getWeatherCondition(weatherCode)
      
      setWeather({
        temp: Math.round(data.current.temperature_2m),
        condition: condition.text,
        high: Math.round(data.daily.temperature_2m_max[0]),
        low: Math.round(data.daily.temperature_2m_min[0]),
        icon: condition.icon
      })
    } catch (error) {
      console.error('Failed to fetch weather:', error)
      // Keep default values
    }
  }

  const getWeatherCondition = (code: number) => {
    // WMO Weather interpretation codes
    if (code === 0) return { text: "Clear", icon: "☀️" }
    if (code <= 3) return { text: "Partly Cloudy", icon: "⛅" }
    if (code <= 48) return { text: "Foggy", icon: "🌫️" }
    if (code <= 67) return { text: "Rainy", icon: "🌧️" }
    if (code <= 77) return { text: "Snowy", icon: "🌨️" }
    if (code <= 82) return { text: "Rainy", icon: "🌧️" }
    if (code <= 86) return { text: "Snowy", icon: "🌨️" }
    return { text: "Stormy", icon: "⛈️" }
  }

  const getDayName = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[currentTime.getDay()]
  }

  const getMonthName = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[currentTime.getMonth()]
  }

  const getDate = () => {
    return currentTime.getDate()
  }

  if (!mounted) return null

  return (
    <div 
      className={`fixed z-30 flex gap-3 ${
        isMobile 
          ? 'top-16 left-0 right-0 px-4 justify-between' 
          : 'bottom-6 right-6 flex-col lg:bottom-6 md:bottom-24'
      }`}
    >
      {/* Date & Time Widget */}
      <div
        className={`backdrop-blur-xl rounded-2xl border ${
          theme === 'dark'
            ? 'bg-white/10 border-white/20'
            : 'bg-white/40 border-white/60'
        } shadow-lg ${isMobile ? 'w-[48%]' : 'w-44 h-44'} p-4 flex flex-col justify-between`}
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <div className="flex items-center justify-center">
          <span className={`font-bold ${
            theme === 'dark' ? 'text-white/90' : 'text-gray-900'
          } ${isMobile ? 'text-sm' : 'text-lg'}`}>
            {getDayName()} {getMonthName()}
          </span>
        </div>
        <div className={`${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        } font-bold ${isMobile ? 'text-5xl' : 'text-7xl'} leading-none flex items-center justify-center flex-1`}>
          {getDate()}
        </div>
      </div>

      {/* Weather Widget */}
      <div
        className={`backdrop-blur-xl rounded-2xl border ${
          theme === 'dark'
            ? 'bg-white/10 border-white/20'
            : 'bg-white/40 border-white/60'
        } shadow-lg ${isMobile ? 'w-[48%]' : 'w-44 h-44'} p-4 flex flex-col justify-between`}
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <span className={`font-bold ${
          theme === 'dark' ? 'text-white/90' : 'text-gray-900'
        } ${isMobile ? 'text-xs' : 'text-base'}`}>
          Bangalore
        </span>
        <div className="flex-1 flex flex-col items-center justify-center mt-1">
          <span className={`${isMobile ? 'text-3xl' : 'text-5xl'} mb-1`}>
            {weather.icon}
          </span>
          <span className={`font-bold ${
            theme === 'dark' ? 'text-white/80' : 'text-gray-800'
          } ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
            {weather.condition}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className={`${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          } font-bold ${isMobile ? 'text-2xl' : 'text-4xl'} leading-none`}>
            {weather.temp}°
          </div>
          <span className={`font-bold ${
            theme === 'dark' ? 'text-white/70' : 'text-gray-700'
          } ${isMobile ? 'text-[9px]' : 'text-xs'}`}>
            H: {weather.high}° L: {weather.low}°
          </span>
        </div>
      </div>
    </div>
  )
}
