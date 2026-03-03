import { FaBriefcase, FaCommentDots, FaEllipsisH, FaShare, FaThumbsUp } from "react-icons/fa"
import type { Experience } from "@/data/experience"

type PostCardProps = {
  experience: Experience
}

export function PostCard({ experience }: PostCardProps) {
  return (
    <article className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 transition-transform duration-200">
      <div className="p-4 sm:p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center shrink-0">
              <FaBriefcase className="text-neutral-700 dark:text-neutral-200 text-sm" />
            </div>

            <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate text-[#0077B5] dark:text-[#0077B5]">{experience.organization}</h3>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-0.5">{experience.role}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{experience.duration}</p>
            {experience.location && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{experience.location}</p>
            )}
            </div>
          </div>

          <button
            type="button"
            aria-label="More options"
            className="h-8 w-8 rounded-full border border-transparent hover:border-neutral-200 dark:hover:border-neutral-600 text-neutral-500 dark:text-neutral-400 flex items-center justify-center shrink-0"
          >
            <FaEllipsisH className="text-xs" />
          </button>
        </header>

        <div className="mt-4">
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-6">{experience.description}</p>

          {experience.bullets.length > 0 && (
            <ul className="mt-3 list-disc pl-5 space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300 leading-6">
              {experience.bullets.map((bullet) => (
                <li key={`${experience.id}-${bullet}`}>{bullet}</li>
              ))}
            </ul>
          )}

          {experience.techStack.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {experience.techStack.map((tech) => (
                <span
                  key={`${experience.id}-${tech}`}
                  className="text-[11px] px-2 py-1 rounded-full border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-transform duration-150 hover:scale-105"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-neutral-200 dark:border-neutral-700 px-3 py-2">
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            className="flex items-center justify-center gap-2 text-xs text-neutral-600 dark:text-neutral-300 rounded-md py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <FaThumbsUp className="text-xs" />
            <span>Like</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 text-xs text-neutral-600 dark:text-neutral-300 rounded-md py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <FaCommentDots className="text-xs" />
            <span>Comment</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 text-xs text-neutral-600 dark:text-neutral-300 rounded-md py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <FaShare className="text-xs" />
            <span>Share</span>
          </button>
        </div>
      </footer>
    </article>
  )
}
