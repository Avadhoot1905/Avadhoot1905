"use client"

import { useState, type ReactElement } from "react"
import { useTheme } from "next-themes"
import { achievements, type Achievement } from "@/data/achievements"

type AchievementListItemProps = {
  achievement: Achievement
  isActive: boolean
  onSelect: (id: string) => void
}

type AchievementNotesViewProps = {
  achievement: Achievement
}

const highlightedPhrases = [
  "Track Winner for Best CS/IT Project out of 250 teams",
  "Track Winner in Tech for Good among 180 teams",
  "Best Idea among 60 participating teams"
]

function renderHighlightedText(text: string) {
  type HighlightSegment = string | ReactElement

  let segments: HighlightSegment[] = [text]

  highlightedPhrases.forEach((phrase, phraseIndex) => {
    segments = segments.flatMap((segment, segmentIndex) => {
      if (typeof segment !== "string") {
        return [segment]
      }

      const parts = segment.split(phrase)
      if (parts.length === 1) {
        return [segment]
      }

      const nextSegments: HighlightSegment[] = []

      parts.forEach((part, partIndex) => {
        if (part) {
          nextSegments.push(part)
        }

        if (partIndex < parts.length - 1) {
          nextSegments.push(
            <span
              key={`highlight-${phraseIndex}-${segmentIndex}-${partIndex}`}
              className="rounded bg-yellow-200 px-1 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-300"
            >
              {phrase}
            </span>
          )
        }
      })

      return nextSegments
    })
  })

  return segments
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
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_Notes_icon.svg"
      alt="Achievements"
      className="h-9 w-9 object-contain"
      draggable={false}
    />
  )
}

function AchievementListItem({ achievement, isActive, onSelect }: AchievementListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(achievement.id)}
      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
        isActive
          ? "bg-neutral-200 dark:bg-neutral-800"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800/70"
      }`}
    >
      <CheckCircleIcon
        className={`h-5 w-5 shrink-0 transition-colors ${
          isActive ? "text-emerald-500" : "text-emerald-500 group-hover:text-emerald-600"
        }`}
      />
      <span className="truncate text-sm text-neutral-700 dark:text-neutral-300">{achievement.summary}</span>
    </button>
  )
}

function AchievementNotesView({ achievement }: AchievementNotesViewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-yellow-500 dark:text-yellow-400">{achievement.title}</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{achievement.date}</p>
      </div>

      <div className="space-y-4 text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
        {achievement.content.split("\n\n").map((paragraph, index) => (
          <p key={`${achievement.id}-paragraph-${index}`}>{renderHighlightedText(paragraph)}</p>
        ))}
      </div>
    </div>
  )
}

export function AchievementsApp() {
  const [selectedAchievementId, setSelectedAchievementId] = useState<string>(achievements[0]?.id ?? "")
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const selectedAchievement = achievements.find((achievement) => achievement.id === selectedAchievementId) ?? achievements[0]

  return (
    <div className={`h-full overflow-hidden ${isDark ? "bg-black text-neutral-100" : "bg-neutral-100 text-neutral-900"}`}>
      <div className={`flex h-full flex-col md:flex-row ${isDark ? "bg-black" : "bg-neutral-100"}`}>
        <aside className={`w-full border-b md:w-[280px] md:border-b-0 md:border-r ${isDark ? "border-neutral-800 bg-neutral-900" : "border-neutral-200 bg-neutral-100"}`}>
          <div className="border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
            <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">Achievements</h1>
              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                Completed
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Completed milestones</p>
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

        <section className={`flex-1 overflow-y-auto p-6 ${isDark ? "bg-black" : "bg-neutral-100"}`}>
          {selectedAchievement ? (
            <AchievementNotesView achievement={selectedAchievement} />
          ) : (
            <div className="rounded-lg bg-emerald-400/10 px-4 py-3 text-sm text-yellow-500 dark:text-yellow-300">
              No achievements available.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
