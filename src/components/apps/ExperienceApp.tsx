"use client"

import { FaBriefcase } from "react-icons/fa"
import { useTheme } from "next-themes"

export function ExperienceApp() {
  const { theme } = useTheme()

  return (
    <div className="p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Experience</h1>
      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
          <div className="flex items-center mb-3">
            <FaBriefcase className="text-purple-600 mr-3 text-xl" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">ACM-VIT CHAPTER</h3>
              <p className={`text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                Vellore, Tamil Nadu, India • Apr 2024 - Present · 1 yr 7 mos
              </p>
            </div>
          </div>

          {/* Senior Core Member */}
          <div className="mb-4">
            <h4 className="font-semibold text-md mb-2">Senior Core Member</h4>
            <p className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Mar 2025 - Present · 8 mos · Full-time · On-site
            </p>
          </div>

          {/* Junior Core Committee */}
          <div className="mb-4">
            <h4 className="font-semibold text-md mb-2">Junior Core Committee</h4>
            <p className={`text-sm mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Apr 2024 - Mar 2025 · 1 yr
            </p>
          </div>

          {/* Description */}
          <p className={`mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Being a part of ACM-VIT has been one of the most transformative experiences of my college journey. 
            This vibrant and dynamic club has not only sharpened my technical expertise but also shaped my 
            management and organizational skills, offering me a platform to grow beyond just coding.
          </p>

          {/* Tech Growth & Learning */}
          <div className="mb-3">
            <h5 className={`font-semibold text-sm mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
              🚀 Tech Growth & Learning
            </h5>
            <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Through ACM-VIT, I deepened my understanding of web development, working on impactful projects 
              like ExamCooker, where I learned how to build scalable, efficient web applications. The hands-on 
              exposure to Git, GitHub, Docker, and modern development practices strengthened my ability to 
              collaborate on real-world projects. These experiences have given me a strong foundation in 
              frontend and backend technologies, preparing me for industry-level development.
            </p>
          </div>

          {/* Event Organization & Leadership */}
          <div className="mb-3">
            <h5 className={`font-semibold text-sm mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
              👥 Event Organization & Leadership
            </h5>
            <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Beyond coding, ACM-VIT introduced me to event organization and management, where I played a role 
              in planning and executing technical events, hackathons, and workshops. Handling logistics, 
              coordinating teams, and ensuring smooth execution taught me the value of teamwork, leadership, 
              and problem-solving in high-pressure situations.
            </p>
          </div>

          {/* A Community Like No Other */}
          <div className="mb-3">
            <h5 className={`font-semibold text-sm mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
              🌟 A Community Like No Other
            </h5>
            <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              What truly sets ACM-VIT apart is the sense of belonging it provides. Unlike any other technical 
              chapter in college, this community fosters collaboration, mentorship, and innovation, making it 
              an inspiring space to grow alongside like-minded peers. The friendships, guidance, and challenges 
              I encountered here have been invaluable in shaping my technical and personal journey.
            </p>
          </div>

          {/* Key Highlights */}
          <ul className={`list-disc list-inside text-sm space-y-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            <li>Built scalable web applications like ExamCooker using modern development practices</li>
            <li>Gained hands-on experience with Git, GitHub, Docker, and collaborative workflows</li>
            <li>Organized and executed technical events, hackathons, and workshops</li>
            <li>Developed strong leadership, teamwork, and problem-solving skills</li>
            <li>Contributed to a vibrant community fostering innovation and mentorship</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
