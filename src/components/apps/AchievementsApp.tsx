"use client"

import { useState } from "react"
import { achievements, type Achievement } from "@/data/achievements"

type AchievementListItemProps = {
  achievement: Achievement
  isActive: boolean
  onSelect: (id: string) => void
}

type AchievementNotesViewProps = {
  achievement: Achievement
}

function CheckCircleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M8.25 12.25L10.75 14.75L15.75 9.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AchievementsAppIcon() {
  return (
    <div className="relative h-8 w-8 rounded-xl border border-neutral-200 bg-neutral-100 p-1.5">
      <div className="space-y-1.5">
        <div className="h-0.5 w-5 rounded bg-neutral-300" />
        <div className="h-0.5 w-4 rounded bg-neutral-300" />
        <div className="h-0.5 w-5 rounded bg-neutral-300" />
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400/30">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-3 w-3 text-emerald-500">
          <path d="M6.5 12.5L10 16L17.5 8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

function AchievementListItem({ achievement, isActive, onSelect }: AchievementListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(achievement.id)}
      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
        isActive ? "bg-neutral-200" : "hover:bg-neutral-100"
      }`}
    >
      <CheckCircleIcon
        className={`h-5 w-5 shrink-0 transition-colors ${
          isActive ? "text-emerald-500" : "text-emerald-500 group-hover:text-emerald-600"
        }`}
      />
      <span className="truncate text-sm text-neutral-700">{achievement.summary}</span>
    </button>
  )
}

function AchievementNotesView({ achievement }: AchievementNotesViewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">{achievement.title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{achievement.date}</p>
      </div>

      <div className="space-y-4 text-base leading-relaxed text-neutral-700">
        {achievement.content.split("\n\n").map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  )
}

export function AchievementsApp() {
  const [selectedAchievementId, setSelectedAchievementId] = useState<string>(achievements[0]?.id ?? "")

  const selectedAchievement = achievements.find((achievement) => achievement.id === selectedAchievementId) ?? achievements[0]

  return (
    <div className="h-full overflow-hidden bg-white text-neutral-900">
      <div className="flex h-full flex-col md:flex-row">
        <aside className="w-full border-b border-neutral-200 bg-neutral-50 md:w-[280px] md:border-b-0 md:border-r">
          <div className="border-b border-neutral-200 px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-lg font-semibold text-neutral-900">Achievements</h1>
              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                Completed
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">Completed milestones</p>
          </div>

          <div className="max-h-64 space-y-1 overflow-y-auto p-3 md:max-h-none md:h-[calc(100%-73px)]">
            {achievements.map((achievement) => (
              <AchievementListItem
                key={achievement.id}
                achievement={achievement}
                isActive={achievement.id === selectedAchievement?.id}
                onSelect={setSelectedAchievementId}
              />
            ))}
          </div>
        </aside>

        <section className="flex-1 overflow-y-auto bg-white p-6">
          {selectedAchievement ? (
            <AchievementNotesView achievement={selectedAchievement} />
          ) : (
            <div className="rounded-lg bg-emerald-400/10 px-4 py-3 text-sm text-neutral-600">
              No achievements available.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
