/**
 * Theme-switch transition orchestration.
 *
 * The color-fade between light and dark used to rely on a permanent
 * `* { transition: ... }` rule in globals.css, which taxed every interaction in
 * the app. That rule is now scoped to `.theme-transition *`, and this helper is
 * responsible for briefly adding the `.theme-transition` class to <html> around
 * an actual theme change so the fade still plays — and only then.
 *
 * The class is added SYNCHRONOUSLY before `apply()` (which flips next-themes'
 * `.dark` class), so the transition is armed on every element before the colors
 * change and the fade animates exactly as it did before. It's removed a little
 * after the 300ms transition completes.
 */

const TRANSITION_MS = 300
// Small buffer past the transition duration before we detach the class.
const CLEANUP_DELAY_MS = TRANSITION_MS + 80

let cleanupTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Run a theme change with the scoped color-fade enabled.
 *
 * @param apply Callback that performs the actual theme switch (e.g. setTheme).
 */
export function withThemeTransition(apply: () => void) {
  if (typeof document !== "undefined") {
    const root = document.documentElement
    root.classList.add("theme-transition")

    if (cleanupTimer) clearTimeout(cleanupTimer)
    cleanupTimer = setTimeout(() => {
      root.classList.remove("theme-transition")
      cleanupTimer = null
    }, CLEANUP_DELAY_MS)
  }

  apply()
}
