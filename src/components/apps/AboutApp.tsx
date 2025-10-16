"use client"

import { useEffect } from "react"
import { FaUser, FaCommentDots, FaTerminal } from "react-icons/fa"
import { useTheme } from "next-themes"

type AboutAppProps = {
  onOpenApp?: (appId: string, params?: { filter?: string; command?: string }) => void
}

export function AboutApp({ onOpenApp }: AboutAppProps = {}) {
  const { theme } = useTheme()

  useEffect(() => {
    console.log('✅ AboutApp mounted/updated')
    console.log('  onOpenApp type:', typeof onOpenApp)
    console.log('  onOpenApp exists?', !!onOpenApp)
    console.log('  onOpenApp value:', onOpenApp)
  }, [onOpenApp])

  const handleMessagesClick = () => {
    console.log('Messages button clicked!')
    console.log('onOpenApp exists?', !!onOpenApp)
    console.log('onOpenApp value:', onOpenApp)
    if (onOpenApp) {
      console.log('Calling onOpenApp("messages")')
      onOpenApp("messages")
    } else {
      console.error('onOpenApp is undefined!')
    }
  }

  const handleContactClick = () => {
    console.log('Contact button clicked!')
    console.log('onOpenApp exists?', !!onOpenApp)
    console.log('onOpenApp value:', onOpenApp)
    if (onOpenApp) {
      console.log('Calling onOpenApp("terminal", { command: "contact" })')
      onOpenApp("terminal", { command: "contact" })
    } else {
      console.error('onOpenApp is undefined!')
    }
  }

  return (
    <div className="p-6 overflow-y-auto">
      <div className="flex items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-6">
          <FaUser className="text-white text-3xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Avadhoot Ganesh Mahadik</h1>
          <p className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Full Stack Developer
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          I&apos;m someone who just likes figuring things out — whether it&apos;s code, design, or how things connect.  
          I don&apos;t really chase perfection, I just keep tweaking and learning till it feels right. I take my time 
          with stuff, but I always get there eventually, and that&apos;s kind of my thing.
        </p>
        <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          I&apos;m big on problem-solving and I spend a lot of time on LeetCode or DSA stuff, just trying to train 
          my brain to think better. The dream&apos;s to reach that stage where code just flows — like you think 
          the logic, and your hands already know what to do. I also love building full-stack projects using 
          Next.js, Prisma, Docker, Git and all that, making sure they actually work well and not just look 
          fancy. It&apos;s more about connecting what I learn with what I build.
        </p>
        <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          I&apos;m still figuring things out, learning a bit every day, and building stuff that makes sense to me.  
          Just trying to keep growing, one idea at a time.
        </p>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleMessagesClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              theme === "dark"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            } shadow-md hover:shadow-lg transform hover:scale-105`}
          >
            <FaCommentDots className="text-lg" />
            Talk to me (AI)
          </button>
          
          <button
            onClick={handleContactClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            } shadow-md hover:shadow-lg transform hover:scale-105`}
          >
            <FaTerminal className="text-lg" />
            Contact
          </button>
        </div>
      </div>
    </div>
  )
}
