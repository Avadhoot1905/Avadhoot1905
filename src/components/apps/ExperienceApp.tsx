"use client"

import { FaBriefcase } from "react-icons/fa"
import { useTheme } from "next-themes"
import { experiences } from "@/data/experience"

export function ExperienceApp() {
  const { theme } = useTheme()

  return (
    <div className="p-6 overflow-y-auto h-full">
      <h1 className="text-xl font-bold mb-6">Experience</h1>
      <div className="space-y-6">
        {experiences.map((experience) => (
          <div
            key={experience.id}
            className={`p-4 rounded-lg border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}
          >
            <div className="flex items-start mb-3">
              <FaBriefcase className="text-purple-600 mr-3 text-xl mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base font-semibold mb-1">{experience.organization}</h3>
                <p className={`text-xs ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                  {experience.locationAndDuration}
                </p>
              </div>
            </div>

            {experience.roles?.map((role) => (
              <div key={`${experience.id}-${role.title}`} className="mb-3">
                <h4 className="font-semibold text-sm mb-1">{role.title}</h4>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  {role.period}
                </p>
              </div>
            ))}

            {experience.techStack && experience.techStack.length > 0 && (
              <p className={`text-xs mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                {experience.techStack.join(", ")}
              </p>
            )}

            {experience.summary && (
              <p className={`text-xs mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                {experience.summary}
              </p>
            )}

            {experience.sections?.map((section) => (
              <div key={`${experience.id}-${section.title}`} className="mb-3">
                <h5 className={`font-semibold text-xs mb-1 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                  {section.title}
                </h5>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {section.content}
                </p>
              </div>
            ))}

            <ul className={`list-disc list-inside text-xs space-y-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              {experience.highlights.map((highlight) => (
                <li key={`${experience.id}-${highlight}`}>{highlight}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
