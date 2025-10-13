"use client"

import { FaBriefcase } from "react-icons/fa"
import { useTheme } from "next-themes"

export function ExperienceApp() {
  const { theme } = useTheme()

  return (
    <div className="p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Work Experience</h1>
      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
          <div className="flex items-center mb-3">
            <FaBriefcase className="text-purple-600 mr-3 text-xl" />
            <div>
              <h3 className="text-lg font-semibold">Senior Frontend Developer</h3>
              <p className={`text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                Tech Company Inc. • 2023-Present
              </p>
            </div>
          </div>
          <p className={`mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Lead frontend development for multiple high-traffic web applications. 
            Collaborate with cross-functional teams to deliver exceptional user experiences.
          </p>
          <ul className={`list-disc list-inside text-sm space-y-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            <li>Developed and maintained React applications serving 100k+ users</li>
            <li>Improved application performance by 40% through code optimization</li>
            <li>Mentored junior developers and led code review processes</li>
          </ul>
        </div>
        <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
          <div className="flex items-center mb-3">
            <FaBriefcase className="text-green-600 mr-3 text-xl" />
            <div>
              <h3 className="text-lg font-semibold">Full Stack Developer</h3>
              <p className={`text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                StartupXYZ • 2021-2023
              </p>
            </div>
          </div>
          <p className={`mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Built scalable web applications from concept to deployment. 
            Worked with modern technologies to create innovative solutions.
          </p>
          <ul className={`list-disc list-inside text-sm space-y-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            <li>Developed RESTful APIs using Node.js and Express</li>
            <li>Created responsive frontends with React and Tailwind CSS</li>
            <li>Implemented CI/CD pipelines and cloud deployment strategies</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
