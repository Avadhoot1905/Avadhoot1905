"use client"

import { experiences } from "@/data/experience"
import { SidebarProfile, SidebarProfileCompactHeader } from "@/components/experience-sidebar-profile"
import { PostCard } from "@/components/experience-post-card"

export function ExperienceApp() {
  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-neutral-50 dark:bg-neutral-900">
      <div className="hidden lg:block p-4 lg:p-6 lg:pr-0">
        <SidebarProfile />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-[650px] mx-auto p-4 lg:p-6 space-y-4">
          <div className="lg:hidden">
            <SidebarProfileCompactHeader />
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[#0077B5]">Experiences</h1>
          </div>

          {experiences.map((experience) => (
            <PostCard key={experience.id} experience={experience} />
          ))}
        </div>
      </div>
    </div>
  )
}
