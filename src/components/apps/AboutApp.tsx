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
          I am a hardworking and persevering individual who believes in continuous improvement. 
          Patience and resilience drive my approach to problem-solving, and I am always eager to 
          refine my skills, adapt to new challenges, and push my boundaries.
        </p>
        <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          Passionate about competitive programming, I actively solve LeetCode and DSA problems to 
          enhance my algorithmic thinking. My goal is to be able to reach a level of enlightenment 
          where coding becomes second nature—where I only need to think about the algorithm, and the 
          code flows effortlessly without conscious effort. Alongside this, I build full-stack 
          applications using industry-standard technologies like Next.js, Prisma, Docker, Git, etc., 
          ensuring scalability and efficiency in my projects. My aim is to bridge the gap between 
          theoretical knowledge and real-world application, creating solutions that are both impactful 
          and innovative.
        </p>
        <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          My journey is one of continuous learning, building, and problem-solving, and I look forward 
          to embracing new challenges and opportunities that help me grow.
        </p>
      </div>
    </div>
  )
}
