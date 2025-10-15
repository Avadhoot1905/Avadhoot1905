"use client"

import { FaUser } from "react-icons/fa"
import { useTheme } from "next-themes"

export function AboutApp() {
  const { theme } = useTheme()

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
  I’m someone who just likes figuring things out — whether it’s code, design, or how things connect.  
  I don’t really chase perfection, I just keep tweaking and learning till it feels right. I take my time 
  with stuff, but I always get there eventually, and that’s kind of my thing.
</p>
<p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
  I’m big on problem-solving and I spend a lot of time on LeetCode or DSA stuff, just trying to train 
  my brain to think better. The dream’s to reach that stage where code just flows — like you think 
  the logic, and your hands already know what to do. I also love building full-stack projects using 
  Next.js, Prisma, Docker, Git and all that, making sure they actually work well and not just look 
  fancy. It’s more about connecting what I learn with what I build.
</p>
<p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
  I’m still figuring things out, learning a bit every day, and building stuff that makes sense to me.  
  Just trying to keep growing, one idea at a time.
</p>
      </div>
    </div>
  )
}
