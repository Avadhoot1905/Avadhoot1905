# Frontend Performance Audit — macOS Portfolio

_Audit date: 2026-09-04 · Scope: perceived/interaction performance of the statically-exported frontend (Next.js 16 / React 19), deployed via Terraform → S3 → CloudFront._

> **Method note & honesty caveat.** This audit is grounded in a full read of the source and the built `out/` bundle. I did **not** have a real browser/DevTools/Lighthouse session in this environment, so no numbers below are invented from a live trace. Where I give timings they are either (a) derived arithmetically from the code (e.g. animation-timeline math, interval frequencies), or (b) labelled as *estimates to be confirmed in-browser*. Section 3 includes an exact measurement protocol to capture the real numbers before/after any fix. Findings are ranked by code-level evidence strength, which for paint/composite issues is high.

---

## 1. Executive Summary

**Your instinct is correct: this is not a delivery problem, it is a rendering/paint problem.** Asset delivery is genuinely healthy — content-hashed code-split chunks, WebP wallpapers (~320 KB), a preloaded `woff2`, and immutable caching on static assets. The desktop's *core* interactions are also already very well engineered:

- Window **dragging** uses `react-rnd` (native DOM transform, **no per-move React state**) — smooth by construction.
- **Dock magnification** runs on a GSAP `quickTo` ticker with cached rects and is **gated** to only tick when the cursor is near the dock.
- **Marquee selection** is `requestAnimationFrame`-coalesced with a cached desktop rect (no per-move reflow).
- **Minimize/restore** animates a detached, flattened compositor clone (transform/opacity only) rather than the live window.

So the "subtle sluggishness" is **not** in the drag/dock hot paths that were obviously optimized. It comes from a smaller set of things that impose a **per-frame paint/composite cost during interaction** and a few **always-on background costs**:

1. **A stack of always-mounted `backdrop-filter` blur + SVG-displacement "liquid glass" layers** (menu bar, dock, 2 desktop widgets). These are permanent GPU layers, and the `backdrop-filter` ones must re-rasterize a blur whenever moving content passes behind them (e.g. dragging a window up under the menu bar). **This is the most probable cause of the "subtle lag during interaction."**
2. **A universal `* { transition: background-color, color, border-color, box-shadow 0.3s }`** — every hover/state change anywhere in the DOM starts a 300 ms transition (including animated `box-shadow`, which repaints). This taxes routine hovering.
3. **Minimized windows stay mounted** (`display:none`), so any app with a `requestAnimationFrame` loop or interval (Dino, Flappy Bird/Pixi) keeps running and stealing the main thread/GPU **globally** while "minimized."
4. **The chatbot typewriter** re-parses Markdown ~83×/second during a reply — localized jank while the chat types.

None of these rise to a true **P0** ("app freezes / blocking"). The app is in good shape; the wins here are about shaving a per-frame paint budget and killing background work, not re-architecting. The highest-value, lowest-risk fixes are **#2 (scope the universal transition)** and **#3 (pause loops when hidden)**, followed by **#1 (thin out the layered glass)**.

---

## 2. Architecture

| Area | Implementation |
|---|---|
| Framework | Next.js **16.1.6**, React **19**, TypeScript, App Router |
| Rendering model | **Pure static export** (`output: 'export'`), `trailingSlash: true`, `images.unoptimized`. Single route (`/`) → `<MacOSDesktop/>`. No SSR/ISR/server actions. |
| Bundler | **Turbopack** (`next dev/build --turbopack`) |
| Entry | `src/app/layout.tsx` (Inter font, `ThemeProvider`, `RoundedFavicon`) → `src/app/page.tsx` → `src/components/desktop.tsx` (`"use client"`, 1467 lines) |
| State | Local React state in `MacOSDesktop` (open/minimized/active windows, icon positions, selection, lock). No global store. `next-themes` for theme. |
| Data fetching | **Build-time only.** `scripts/fetch-build-data.ts` pulls GitHub/LeetCode/Medium → `public/data/*.json`, imported statically via `src/lib/static-data.ts`. Runtime fetches: **weather** (Open-Meteo, non-blocking, in `Widgets`) and **chat** (`/chat` → Lambda, user-initiated). |
| Animation | **framer-motion** (window/dock mount, welcome toast), **GSAP** (dock magnify, genie minimize, loading intro, lock screen), **liquid-glass-web-react** (SVG displacement "glass"), **Pixi.js** (Flappy Bird only, lazy). |
| Icons | **Three** libraries: `react-icons` (si/fa subpaths), `lucide-react`, `phosphor-react`. |
| Fonts | Inter (`next/font`, woff2, preloaded); `Sacramento.ttf` (80 KB) + `EckmannpsychSmall.ttf` (196 KB) used **only** by the first-visit loading screen. |
| Code splitting | All 13 app windows are `next/dynamic({ ssr:false })` with **hover-preload** (`preloadApp`); Pixi/Flappy Bird excluded from preload. |
| Persistence | `localStorage`: `macos_desktop_icon_positions`, `macosDesktopLoadingSeen`. |
| Desktop metaphor | `desktop.tsx` (state + icon grid + window orchestration), `window.tsx` (`react-rnd` + genie clone), `dock.tsx` (GSAP magnify), `menu-bar.tsx` (menus + Control Center), `context-menu.tsx`, `widgets.tsx`, `lock-screen.tsx`, `loading-screen.tsx`, `selection-box.tsx`. |
| Infra | S3 (`avadhootgmportfolio`) + CloudFront (`EE5QPSJYDEMEA`). Frontend distribution is **managed outside Terraform** (read-only data source); Terraform only adds `/chat` + `/admin/*` API behaviors. Deploy = GitHub Actions `aws s3 sync out/ … && cloudfront create-invalidation /*`. |

---

## 3. Performance Baseline (how to capture the real numbers)

I could not run a live trace here, so **before implementing anything**, capture these against the **production** build (`npm run build && npx serve out`, or the live site) so improvements are provable:

1. **Chrome DevTools → Performance**, 6× CPU throttle, record while:
   - dragging a window slowly **up under the menu bar** and **over the dock** (watch for green "Painting" / purple "Rendering" bands and dropped frames);
   - hovering rapidly across dock icons and window title-bar buttons (watch Recalculate Style / Paint from the universal transition);
   - opening the chatbot and sending a message (watch scripting spikes during the typewriter).
2. **Rendering tab → toggle "Paint flashing"** and drag a window: the menu-bar / dock / widget regions will flash on every frame the window passes behind them — that flashing area **is** the cost.
3. **Rendering tab → "Layer borders"** and count composited layers at idle (expect the 4 glass surfaces + dock + windows).
4. **Performance Monitor** at idle desktop with a game minimized vs. no game open — compare CPU %. (Confirms Finding P1-C.)
5. **Lighthouse** (desktop preset) for LCP/TBT/CLS/INP reference, and **WebPageTest** cold/cached for the delivery baseline (expected to be fine).

Record cached / cold / repeat-nav / hard-reload as the brief requests; delivery is expected to dominate only on the very first cold visit (loading-screen fonts, below).

---

## 4. Critical Path (navigation → usable desktop)

1. HTML (`index.html`, ~8.7 KB) → CSS (2 files) + ~11 async JS chunks (largest 280 KB raw) + preloaded Inter `woff2`.
2. `MacOSDesktop` mounts; `mounted` gate returns `null` for one tick (hydration safety).
3. **First visit only:** `LoadingScreen` runs a GSAP handwriting intro. Timeline math: draw ends ≈ **2.3 s**, "Click to enter" CTA appears at ≈ **5.25 s**, auto-dismiss 5 s later (≈ **10.25 s**). It also `import("opentype.js")` + fetches `Sacramento.ttf` (80 KB) and uses `EckmannpsychSmall.ttf` (196 KB, **unsubsetted TTF, not woff2**). Gated by `macosDesktopLoadingSeen` → shown once per browser.
4. **Repeat visits:** loading skipped; straight to `LockScreen` (locked by default) → unlock → desktop paints wallpaper (`v-*-c.webp` ~320 KB, warmed during loading) + menu bar + dock + widgets + icons.
5. App windows load on demand (dynamic import, hover-preloaded).

The desktop chrome itself renders immediately and independently of the weather/chat network calls. **No remote data gates the core UI** — good.

---

## 5. Runtime Findings (React / main-thread)

### P1-C — Minimized windows keep their subtree mounted; animation loops keep running
- **Evidence:** `window.tsx:353` — when minimized the component returns `<div style={{ display: "none" }}>{children}</div>`. The children are **not unmounted**. `DinoGame.tsx:150` and `FlappyBirdApp.tsx` (Pixi) both run unconditional `requestAnimationFrame(tick)` loops; their `tick` reschedules every frame regardless of visibility.
- **Root cause:** Genie restore needs the DOM present, so minimize hides rather than unmounts — but that keeps timers/RAF alive. `display:none` does **not** stop `requestAnimationFrame`.
- **User impact:** Minimize the Dino game (Safari "unavailable" tab) or Flappy Bird and the RAF + `setState`/Pixi render keep consuming main-thread/GPU, degrading *every other* interaction on the desktop until the window is closed.
- **Est. impact:** a full-rate game loop is easily 3–8 ms scripting/frame; confirm via Baseline step 4.
- **Fix:** pause loops when not visible — either gate the RAF on a visibility flag driven from the Window (`internalMinimized`) via context/prop or `IntersectionObserver`/`document.visibilitychange`, or actually unmount on minimize (costs the restore animation). Lowest-risk: have `Window` pass an `isHidden` and have each game short-circuit `tick` (still schedule, but skip physics/render) — or better, `cancelAnimationFrame` while hidden.
- **Risk:** Low. **Implement: yes.**

### P1-D — Chatbot typewriter re-parses Markdown ~83×/second
- **Evidence:** `MessagesApp.tsx:233` `setInterval(…, 12)` calls `setTypingMessage(fullMessage.substring(0, n))`; the bubble renders `<ReactMarkdown remarkPlugins={[remarkGfm]}>{typingMessage}</ReactMarkdown>` (`~:724`). 12 ms → ~83 renders/s, each doing a full remark/remark-gfm AST parse of the growing string.
- **User impact:** Visible scripting spikes and possible dropped frames **while the assistant is "typing,"** worst on long replies (parse cost grows with length).
- **Fix:** (a) reveal by whole words/lines on a slower cadence (30–50 ms) and/or via `requestAnimationFrame`; (b) render the streaming text as **plain text** and only mount `ReactMarkdown` **once** on the final message; (c) memoize the parsed output. Also lazy-load `react-markdown`/`remark-gfm` (they're only needed inside Messages).
- **Risk:** Low–medium (visual cadence change). **Implement: yes.**

### P2 — `lastActivity` is dead state that forces periodic full-desktop re-render
- **Evidence:** `desktop.tsx:303` `const [lastActivity, setLastActivity]`. `setLastActivity` is called from `updateActivity`/`handleUnlock`/`handleLockScreen`, but `lastActivity` is **never read**. Each `setLastActivity` re-renders the 1467-line `MacOSDesktop`.
- **Impact:** Minor — children are memoized (`Dock`) or `AnimatePresence`-gated, but the parent reconciles unnecessarily (throttled to ~once per 10 s of activity, plus lock/unlock).
- **Fix:** delete the state; keep only `lastActivityRef`.
- **Risk:** Trivial. **Implement: yes (cleanup).**

### P2 — Control Center slider updates React state on every `pointermove`
- **Evidence:** `menu-bar.tsx` brightness/volume sliders add `pointermove` listeners that call `setBrightness`/`setVolume` per move, re-rendering the Control Center panel (which contains multiple glass layers).
- **Impact:** Slider can feel "sticky" while dragging, amplified by the panel's `backdrop-filter`. Scoped to Control Center use.
- **Fix:** write the fill width to a ref/DOM directly during drag; commit to state on `pointerup`.
- **Risk:** Low. **Implement: optional.**

### P3 — Per-render recomputation in a few apps
- `TerminalApp.tsx:149` `linkifyText` runs two global regex loops per output line, every render (no memo).
- `ProjectsApp.tsx:98` `domainAppleColors`/`techColors` (50+ entries) are re-created inside the component each render → hoist to module scope.
- `TicTacToeApp.tsx:38` minimax is synchronous and unmemoized — but the 3×3 space is tiny; real cost is negligible. Cosmetic only.
- **Implement:** hoist the Projects color maps (trivial); the rest are low value.

> **Down-weighted from the sub-agent sweep (verified _not_ real issues):** PhotosApp's shuffle is `useMemo`-stable (does **not** reshuffle each render); Safari tab `useEffect`s are guarded by `!alreadyLoaded` (they don't re-parse on every toggle); `allPhotos` derives from a module-constant object; Game2048's keydown listener is correctly cleaned up. These were flagged automatically but do not hold up.

---

## 6. Animation & Compositing Findings

### P1-A — Layered, always-mounted glass: `backdrop-filter` blur + SVG-displacement filter (root cause candidate)
- **Evidence — always mounted on the idle desktop:**
  - **Menu bar** (`menu-bar.tsx:456,461`): `backdrop-blur-2xl` **and** inline `backdropFilter: blur(20px) saturate(190%)` (redundant double-declare) **plus** a full-width `<LiquidGlassSurface>` (`:474`) **plus** a gradient overlay.
  - **Dock shelf** (`dock.tsx:573,579`): `backdrop-blur-2xl` + inline `blur(24px) saturate(190%)` + `will-change-transform` + a `<LiquidGlassSurface>` (`:584`).
  - **Widgets** (`widgets.tsx:140,183`): **two** `<LiquidGlassCard>`, each `backdrop-filter: saturate(1.8)` + its own SVG filter.
  - Each `LiquidGlass` (per `node_modules/liquid-glass-web-react/dist/index.js`) mounts an SVG `feImage`+`feDisplacementMap`+`feGaussianBlur`+`feColorMatrix` chain on a div with **`willChange: "filter"`** (permanent filter layer) and a `ResizeObserver`.
- **Two distinct costs:**
  1. **`backdrop-filter` (menu bar + dock):** re-rasterizes a blur of whatever is **behind** it, **every frame the backdrop changes.** Dragging a window up under the menu bar, or over the dock, forces a full re-blur of that strip each frame. This is the classic source of "subtle, hard-to-pin sluggishness" during dragging — a *paint* cost, not a script cost. Confirm with Baseline step 2 (paint flashing).
  2. **SVG displacement filter + `will-change:filter`:** these operate on the surface's *own* translucent panel (mostly static, so not per-frame), but each is a **permanent composited layer** consuming GPU memory, and they **recompute a displacement map (allocating a `Uint8ClampedArray`) on every resize** via their `ResizeObserver` — the source of resize jank (Finding below).
- **User impact:** window drags near the top/bottom edges and any motion behind the glass feel less than buttery; permanent baseline GPU-memory/compositing overhead.
- **Fix (preserve the look):**
  - Remove the **redundant** blur declarations (the Tailwind `backdrop-blur-2xl` class + the inline `backdropFilter` both apply — keep one).
  - Consider whether the **`LiquidGlassSurface` SVG layer adds enough visible refraction over the existing `backdrop-filter` + gradient to justify a second permanent filter layer** on the menu bar and dock. Dropping the SVG surface on those two chrome elements (keeping the `backdrop-filter` glass) removes two always-on filter layers with near-zero visual change. Keep the liquid-glass on the **widgets** where the refraction actually reads.
  - Reduce blur radius where it isn't perceptible (24px→~16px) and drop `saturate(190%)` toward ~150% (saturate forces colour-space work).
  - Ensure nothing sets `will-change` on these permanently beyond what's needed.
- **Risk:** Low–medium (visual tuning — validate side-by-side). **Implement: yes, incrementally, measuring each step.**

### P1-B — Universal CSS transition on `background-color, color, border-color, box-shadow`
- **Evidence:** `globals.css:47` `* { transition: background-color .3s, color .3s, border-color .3s, box-shadow .3s; }`.
- **Root cause:** kept intentionally so theme-switch fades everything (the file even notes removing the sister `:has()` rule). But it applies to **every element always**, so any hover/focus/active state that changes background or **box-shadow** animates for 300 ms and **repaints** — including the many hover states across dock, buttons, cards, list rows.
- **User impact:** routine hovering/clicking carries a low-grade repaint tax everywhere.
- **Fix:** scope the transition to a class toggled only during theme switches (e.g. add `.theme-transition *` briefly on toggle, remove after 300 ms), or narrow the selector to the elements that actually need it and **drop `box-shadow`** from the universal rule (animated shadows are the most expensive part). This keeps the theme-fade while removing the per-hover cost.
- **Risk:** Low (theme-switch fade behavior must be re-verified). **Implement: yes.**

### P2 — Resize recomputes every `LiquidGlass` displacement map
- **Evidence:** `liquid-glass-surface.tsx:48` each surface observes size via `ResizeObserver`; the library regenerates its displacement map on size change. With ~4 always-mounted surfaces (more when Control Center opens), a window-resize drag fires many recomputes; several components also each add their own unthrottled `resize` → `setIsMobile` listener (`menu-bar`, `app-icon`, `lock-screen`, `window`, `desktop`, `dock`, `widgets`).
- **Impact:** jank **while resizing the browser window** (not steady-state).
- **Fix:** debounce the `resize`→`setIsMobile` handlers (share one `matchMedia('(max-width:767px)')` listener); the glass recompute is inherent to the lib — fewer always-mounted surfaces (P1-A) is the real lever.
- **Risk:** Low. **Implement: optional.**

### P3 — Control Center (mobile) mounts ~11 `LiquidGlass` surfaces on open
- **Evidence:** `menu-bar.tsx:224–412` — opening the mobile Control Center mounts ~11 glass surfaces (each = SVG filter + ResizeObserver) simultaneously.
- **Impact:** one-time open lag on mobile; they're correctly **conditional** (unmounted when closed).
- **Fix:** replace inner controls' individual glass with a single glass container + cheap translucent children.
- **Risk:** Low. **Implement: optional (mobile polish).**

### Already-good (do not touch)
Dock magnify (gated GSAP ticker + cached rects), window drag (`react-rnd` transform), marquee (rAF + cached rect), genie minimize (flattened compositor clone), widget clock (isolated leaf re-render). These are model implementations — leave them.

---

## 7. Network Findings

| Request | Trigger | Frequency | Blocking? | Cacheable? | Initial-load critical? |
|---|---|---|---|---|---|
| HTML / JS / CSS / Inter woff2 | Navigation | Once (immutable) | No (async JS) | Yes (hashed, immutable) | Yes |
| `v-*-c.webp` wallpaper (~320 KB) | Desktop paint (preloaded during loading) | Once | No | Yes | Yes (visual) |
| `Sacramento.ttf` (80 KB) + `opentype.js` | Loading screen | First visit only | No | Yes | First visit only |
| `github/leetcode/medium.json` | Bundled at build | 0 runtime | No | Yes (in JS) | No |
| **Open-Meteo weather** | `Widgets` mount | Once/session | **No** (UI shows defaults, updates on arrival) | No (live) | No |
| **`/chat` → Lambda** | User sends message | Per message | No | No | No |
| Wikimedia VIT campus image | Education app open | Once when opened | No | External CDN | No |

**Assessment: excellent.** Portfolio core UI is fully decoupled from remote data (build-time JSON + non-blocking weather). A slow GitHub/LeetCode/Medium/chat call cannot make the desktop feel slow. Minor: `EducationApp` external image lacks `loading="lazy"`/dimensions (P3).

---

## 8. Bundle Findings

- Total JS in `out/` ≈ **2.4 MB raw across all chunks** (includes every lazily-loaded app); largest single chunk 280 KB raw. Initial critical path is a subset (~11 chunks). Confirm gzipped initial JS in-browser (Baseline).
- **Three icon libraries** ship: `react-icons` (si/fa), `lucide-react`, `phosphor-react`. `phosphor-react` appears only in `menu-bar.tsx`. **P2** — consolidate to one (prefer `lucide-react`, already tree-shakeable) and drop the other two; `react-icons` subpath barrels (`react-icons/fa`) tree-shake under ESM but pull from large modules.
- **Pixi.js** is correctly isolated to Flappy Bird and excluded from hover-preload — good; it never touches the initial path.
- `react-markdown` + `remark-gfm` live in the Messages chunk; ensure they aren't pulled earlier. Consider deferring even within Messages until first assistant message (ties to P1-D).
- **Stale build artifact:** the committed `out/` is from an older build (Aug 5) than current source — re-verify sizes against a fresh `npm run build`.
- **Implement:** icon-library consolidation (P2); the rest are measured confirmations.

---

## 9. CSS / Rendering Findings

- **P1-B** universal transition (§6). Primary CSS issue.
- **P1-A** stacked `backdrop-filter` + SVG filters (§6). Primary compositing issue.
- `html, body { position: fixed; overflow: hidden }` (`globals.css:64`) — appropriate for the desktop shell.
- `input,textarea,select,button { pointer-events:auto !important; user-select:auto !important }` — broad `!important` but low cost; leave.
- No evidence of layout thrashing in the hot paths (drag/dock/marquee all cache rects). Good.

---

## 10. Infrastructure Findings

- **P2 — HTML is served `immutable` for one year.** `deploy.yml:46` `aws s3 sync out/ … --cache-control "public, max-age=31536000, immutable"` applies to **every** object, including `index.html`, `404.html`, `admin.html`, `__next.*.txt`. Correct for content-hashed `_next/static/*`, **wrong for HTML**: combined with `--delete` (old hashed chunks removed) and `immutable` (browsers never revalidate), a returning visitor's browser can serve a **stale `index.html` that references deleted chunks** → failed chunk load / blank screen after a deploy. The `/*` CloudFront invalidation fixes the *edge* but not already-cached browsers.
  - **Fix:** two-pass sync — hashed assets `immutable, max-age=31536000`; HTML (`*.html`, `*.txt`) `no-cache` (or `max-age=0, must-revalidate`). E.g. sync everything immutable, then a second `aws s3 cp --recursive --exclude "*" --include "*.html" --include "*.txt" --cache-control "no-cache" --metadata-directive REPLACE`.
  - **Risk:** Low. **Implement: yes (correctness).**
- **Cannot verify (managed outside Terraform):** whether the frontend CloudFront distribution has **Compress = true** (Brotli/Gzip), HTTP/2/3, and its default cache behavior. The Terraform only wires API behaviors. **Action:** confirm in the CloudFront console that the default behavior has compression enabled and a sane TTL; the S3 `--cache-control` sets browser caching but CloudFront compression is a separate toggle. TLS/PQ hybrid already noted as handled in `cloudfront.tf`.
- **P3 — dead heavy assets deployed:** `out/assets/` ships `v-dark.jpg` (4.2 MB), `v-light.jpg` (3.6 MB), `v-dark-c.jpg`/`v-light-c.jpg` (~600 KB), `lock-screen-phone.png` (1.4 MB) — **none referenced in `src`** (only the `.webp` variants are). ~10 MB of dead weight synced to S3. Not downloaded by users, but bloats deploy/storage and risks accidental use. **Fix:** delete unreferenced originals from `public/assets`.
- Delivery is otherwise appropriate for a static SPA.

_Out of audit scope but worth a glance:_ `.env` (correctly gitignored) contains live-looking `DATABASE_URL`/Upstash credentials — verify those aren't referenced by any client bundle and rotate if ever exposed.

---

## 11. Perceived-Performance Findings

- **Loading screen (first visit): ~5.25 s before "Click to enter," auto-dismiss ~10 s** (`loading-screen.tsx` timeline math). This is an **intentional cinematic intro**, gated to once-per-browser, and is *not* the interaction-lag the user reports. Still, gating "Click to enter" behind 5 s even when assets are already cached is a long first impression. **Optional:** reveal the CTA as soon as `isLoaded` is true rather than at a fixed 5.25 s; shorten the stagger. Also serve the two loading fonts as subsetted **woff2** (currently 80 KB + 196 KB TTF). P3.
- **No artificial gating found in the core flows:** windows open immediately on double-click (dynamic import + hover-preload makes it feel instant), no spinners block the desktop, no `setTimeout` delays UI beyond animation timings.
- The genie/spring window timings (0.36 s / spring 380-28) are tasteful and native-feeling — leave them.

---

## 12. Prioritized Remediation Plan

**No P0 (nothing freezes/blocks).** Ordered by value ÷ risk:

| # | Pri | Finding | Fix | Risk |
|---|---|---|---|---|
| 1 | P1-B | Universal `*` transition (incl. `box-shadow`) | Scope to a theme-switch class; drop `box-shadow` from the global rule | Low |
| 2 | P1-C | Loops run while minimized | Pause RAF/timers when window hidden (Dino, Flappy Bird) | Low |
| 3 | P1-A | Layered always-on glass (menu bar + dock) | Remove redundant blur declares; drop the SVG `LiquidGlassSurface` from menu bar + dock (keep `backdrop-filter`); trim blur/saturate; keep glass on widgets | Low–Med |
| 4 | P1-D | Chat typewriter re-parses Markdown 83×/s | Reveal by word/line on rAF; render plain text while typing, Markdown once on final; lazy-load markdown libs | Low–Med |
| 5 | P2 | HTML cached `immutable` 1 yr | Two-pass sync: `no-cache` for `*.html`/`*.txt` | Low |
| 6 | P2 | 3 icon libraries | Consolidate to `lucide-react`; drop `phosphor-react` + trim `react-icons` | Low |
| 7 | P2 | `lastActivity` dead state | Delete state, keep ref | Trivial |
| 8 | P2 | Control-Center slider setState/pointermove | Ref/DOM during drag, commit on up | Low |
| 9 | P3 | Dead heavy wallpapers deployed | Remove unreferenced `public/assets` originals | Trivial |
| 10 | P3 | Loading CTA fixed 5.25 s; TTF fonts | Reveal CTA on `isLoaded`; subset→woff2 | Low |
| 11 | P3 | Terminal linkify / Projects color maps per render | Memoize / hoist to module | Trivial |
| 12 | — | Verify CloudFront `Compress=true`, HTTP/2-3 | Console check | — |

---

## 13. Recommended Changes (files & exact nature)

- `src/app/globals.css:47` — replace the universal `*` transition with a scoped `.theme-transition *` (added on toggle, removed after 300 ms) and remove `box-shadow` from the animated list.
- `src/components/window.tsx:353` — expose an `isHidden` signal (prop/context) when `internalMinimized`; **`src/components/apps/DinoGame.tsx:150`** and **`FlappyBirdApp.tsx`** — short-circuit / `cancelAnimationFrame` their `tick` when hidden.
- `src/components/menu-bar.tsx:456-485` & `src/components/dock.tsx:570-602` — drop the duplicate `backdrop-blur-2xl` vs inline `backdropFilter`; evaluate removing the `<LiquidGlassSurface>` on these two chrome elements; lower blur/saturate. Keep `src/components/widgets.tsx` glass.
- `src/components/apps/MessagesApp.tsx:233,724` — reveal by word on rAF; plain-text-while-typing + `ReactMarkdown` only on settled message; dynamic-import `react-markdown`/`remark-gfm`.
- `.github/workflows/deploy.yml:44-48` — second `aws s3 cp` pass setting `Cache-Control: no-cache` on `*.html`/`*.txt`.
- `src/components/desktop.tsx:303` — delete `lastActivity` state (keep `lastActivityRef`).
- `src/components/apps/ProjectsApp.tsx:98` — hoist color maps to module scope.
- `menu-bar.tsx`, `app-icon.tsx`, `lock-screen.tsx`, etc. — share one debounced `matchMedia` mobile check instead of N `resize` listeners.
- `public/assets/` — remove `v-dark.jpg`, `v-light.jpg`, `v-dark-c.jpg`, `v-light-c.jpg`, `lock-screen-phone.png` (unreferenced).
- Consolidate icon imports off `phosphor-react` (menu-bar only) and `react-icons` toward `lucide-react`.

---

## 14. Validation Plan

For **each** change, capture the same trace before/after (Section 3):

- **#1 universal transition:** DevTools *Performance*, hover-storm across the dock/title bar — compare Recalculate-Style + Paint counts and scripting per second. Verify theme-switch still fades.
- **#2 minimized loops:** *Performance Monitor* CPU% at idle with a game minimized, before vs after (expect a clear drop toward baseline). Confirm restore animation still works.
- **#3 glass layers:** *Rendering → Paint flashing* + *Layer borders*; drag a window under the menu bar/over the dock and compare flashing area, dropped frames, and composited-layer count. **A/B screenshots** to confirm the macOS look is preserved.
- **#4 typewriter:** *Performance* while sending a long reply — compare scripting spikes/frame during typing.
- **#5 HTML caching:** after deploy, `curl -I` the site — assert `Cache-Control: no-cache` on `/` and `immutable` on a `_next/static/*` asset; verify a returning browser gets fresh HTML.
- **#6 icons / #9 assets:** `npm run build`; compare initial gzipped JS and total `out/` size.
- **Global:** Lighthouse (desktop) + a manual 6× CPU-throttle pass through every interaction in Phase 13 of the brief, before vs after, to confirm INP/TBT improvement and no regressions.

---

### Bottom line
The site is well-built and the delivery path is healthy — the "subtle lag" is a **paint/composite + always-on-work** story, not a delivery or architecture failure. The two cheapest, safest wins (**scope the universal transition**, **pause hidden game loops**) plus **thinning the layered glass on the menu bar/dock** should remove most of the perceived sluggishness while fully preserving the macOS aesthetic. Everything else is incremental cleanup.

_Per instructions, no code has been changed. Review and select which items to implement._
