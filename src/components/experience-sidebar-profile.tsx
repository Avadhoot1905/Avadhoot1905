import { experiences } from "@/data/experience"
import Image from "next/image"

function getProfileStats() {
  const firstYear = experiences.reduce((earliest, experience) => {
    const matchedYears = experience.duration.match(/\b(20\d{2})\b/g)
    if (!matchedYears) return earliest
    const minYearForItem = Math.min(...matchedYears.map(Number))
    return Math.min(earliest, minYearForItem)
  }, Number.POSITIVE_INFINITY)

  const yearsOfExperience =
    firstYear === Number.POSITIVE_INFINITY ? "1+" : `${Math.max(1, new Date().getFullYear() - firstYear)}+`

  return {
    yearsOfExperience,
    experiencesCount: experiences.length,
    domainsWorked: 3,
  }
}

export function SidebarProfile() {
  const { yearsOfExperience, experiencesCount, domainsWorked } = getProfileStats()

  return (
    <aside className="w-full lg:w-[280px] lg:sticky lg:top-0 lg:self-start">
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
        <div className="flex flex-col items-start gap-3">
          <div className="h-14 w-14 rounded-full border border-neutral-300 dark:border-neutral-600 overflow-hidden bg-white dark:bg-neutral-800">
            <Image src="/favicon.ico" alt="Profile" width={56} height={56} className="h-full w-full object-cover" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#0077B5] dark:text-[#0077B5]">Avadhoot Mahadik</h2>
            <p className="text-xs mt-1 text-neutral-600 dark:text-neutral-400 leading-5">
              Building scalable backend systems and full-stack products with reliability and clean architecture in mind.
            </p>
            <span className="inline-flex mt-3 text-[11px] px-2 py-1 rounded-full border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300">
              Systems Architect
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Years of experience</span>
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{yearsOfExperience}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Domains worked in</span>
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{domainsWorked}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Experiences count</span>
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{experiencesCount}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export function SidebarProfileCompactHeader() {
  const { yearsOfExperience, experiencesCount } = getProfileStats()

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full border border-neutral-300 dark:border-neutral-600 overflow-hidden bg-white dark:bg-neutral-800">
          <Image src="/favicon.ico" alt="Profile" width={40} height={40} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[#0077B5] truncate">Avadhoot Mahadik</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">Systems Architect</p>
        </div>

        <div className="ml-auto text-right">
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Experience</p>
          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{yearsOfExperience}</p>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
        <span>Experiences: {experiencesCount}</span>
        <span>Backend / Systems</span>
      </div>
    </div>
  )
}
