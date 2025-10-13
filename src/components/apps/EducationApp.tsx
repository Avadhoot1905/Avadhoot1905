"use client"

import { FaGraduationCap } from "react-icons/fa"
import { useTheme } from "next-themes"

export function EducationApp() {
  const { theme } = useTheme()

  return (
    <div className="p-6 overflow-y-auto h-full">
      <h1 className="text-xl font-bold mb-6">Education</h1>
      <div className="space-y-6">
        <div className={`p-4 rounded-lg border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-start mb-3">
            <FaGraduationCap className="text-blue-600 mr-3 text-xl mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">Bachelor of Technology - BTech</h3>
              <p className="text-sm font-medium mb-1">Computer Science and Engineering with Business Systems</p>
              <p className={`text-xs ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                Vellore Institute of Technology, Vellore • Jul 2023 - Jul 2027
              </p>
              <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                Grade: 8.43/10 (3.37/4)
              </p>
            </div>
          </div>
          <div className={`space-y-2 text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            <p>
              I am an active member of ACM-VIT and SEDS-VIT, contributing to web projects like ExamCooker. 
              I also engage in cultural and fitness activities through Yuva Marathi and the Cycling Club.
            </p>
            <p>
              Passionate about hackathons, I've participated in Yantra'25, DevJams, and Caterpillar Hackathon. 
              With a strong learning mindset, I balance projects, competitions, and academics, maintaining 
              a GPA of 8.38/10 (3.37/4).
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-start mb-3">
            <FaGraduationCap className="text-green-600 mr-3 text-xl mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">All India Senior School Certificate Examination (AISSCE)</h3>
              <p className={`text-xs ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                The Deens Academy • Jun 2021 - Mar 2023
              </p>
              <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                Grade 12: 90.8% | Grade 10: 92.2%
              </p>
            </div>
          </div>
          <div className={`space-y-2 text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            <p>
              Deens Academy played a pivotal role in shaping my thought process and personal development. 
              It was where I spent my formative years, learning invaluable life lessons that continue to 
              guide me today.
            </p>
            <p>
              The school fostered intellectual curiosity and social growth. Interacting with peers taught 
              me to be sociable and amiable, skills that remain crucial in building meaningful relationships. 
              My teachers, especially in mathematics, played a key role in developing my analytical and 
              logical reasoning, which now aids me in algorithm design and coding.
            </p>
            <p>
              Beyond academics, Deens Academy's house system fostered teamwork and camaraderie. As part of 
              Flavus House (Yellow House), I developed leadership, a competitive spirit, and a strong sense 
              of belonging.
            </p>
            <p>
              Reflecting on my journey, I am grateful for the intellectual foundation and adaptability 
              Deens Academy nurtured in me. It remains integral to my growth, shaping who I am today.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
