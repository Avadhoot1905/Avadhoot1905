"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { LiquidGlass, type LiquidGlassProps } from "liquid-glass-web-react"

type LiquidGlassSurfaceProps = Omit<LiquidGlassProps, "children" | "width" | "height"> & {
  /** Classes for the refracted glass panel (tint, border, gradient). */
  panelClassName?: string
  /** Inline style merged onto the refracted glass panel. */
  panelStyle?: CSSProperties
}

/**
 * A drop-in liquid-glass *material* layer.
 *
 * `liquid-glass-web-react` refracts its own children and needs the lens size in
 * fixed pixels, neither of which suits a responsive UI chrome surface. This
 * wrapper absolutely fills its (positioned) parent, measures itself, and drives
 * a lens sized to match over a translucent panel — so the refraction, specular
 * rim and glow read as glass while the parent's real content stays a *sibling*
 * above it: crisp, clickable, and never clipped by the SVG filter region.
 *
 * Drop it in as the first child of any `relative`/`fixed`/`absolute` container.
 */
export function LiquidGlassSurface({
  panelClassName,
  panelStyle,
  radius = 24,
  strength = 0.05,
  chromaticAberration = 0.12,
  glow = 0.03,
  edgeHighlight = 0.18,
  specular = 0.55,
  depth = 8,
  shadow = false,
  className,
  style,
  ...rest
}: LiquidGlassSurfaceProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", ...style }}
    >
      {size.w > 0 && size.h > 0 && (
        <LiquidGlass
          width={size.w}
          height={size.h}
          radius={radius}
          strength={strength}
          chromaticAberration={chromaticAberration}
          glow={glow}
          edgeHighlight={edgeHighlight}
          specular={specular}
          depth={depth}
          shadow={shadow}
          style={{ position: "absolute", inset: 0 }}
          {...rest}
        >
          <div
            className={panelClassName}
            style={{ width: size.w, height: size.h, ...panelStyle }}
          />
        </LiquidGlass>
      )}
    </div>
  )
}

type LiquidGlassCardProps = Omit<LiquidGlassProps, "children" | "width" | "height"> & {
  children: ReactNode
  /** Sizing/layout classes for the card footprint (e.g. "w-44 h-44", "w-full aspect-square"). */
  className?: string
  /** Styling for the refracted inner card (tint, border, padding, layout). */
  contentClassName?: string
  contentStyle?: CSSProperties
  /** Saturation boost applied to the wallpaper behind the card, so the glass
   *  stays vibrant instead of dull. 1 = off; ~1.6–1.9 mimics macOS glass. */
  saturate?: number
}

/**
 * A liquid-glass card that refracts its *own content* (like the reference
 * widget), but sizes the lens from a measured, possibly-responsive footprint
 * instead of hard-coded pixels — so the same card works on desktop (`w-44 h-44`)
 * and on the phone grid (`w-full aspect-square`).
 */
export function LiquidGlassCard({
  children,
  className,
  contentClassName,
  contentStyle,
  radius = 24,
  strength = 0.04,
  chromaticAberration = 0.08,
  glow = 0.03,
  edgeHighlight = 0.14,
  specular = 0.5,
  depth = 6,
  curvature = 0.5,
  saturate = 1.8,
  ...rest
}: LiquidGlassCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const sat = saturate !== 1
    ? { backdropFilter: `saturate(${saturate})`, WebkitBackdropFilter: `saturate(${saturate})` }
    : null

  return (
    <div
      ref={ref}
      className={`relative ${className ?? ""}`}
      style={{ borderRadius: radius, ...sat }}
    >
      {size.w > 0 && size.h > 0 && (
        <LiquidGlass
          width={size.w}
          height={size.h}
          radius={radius}
          strength={strength}
          chromaticAberration={chromaticAberration}
          glow={glow}
          edgeHighlight={edgeHighlight}
          specular={specular}
          depth={depth}
          curvature={curvature}
          style={{ position: "absolute", inset: 0 }}
          {...rest}
        >
          <div
            className={contentClassName}
            style={{ width: size.w, height: size.h, ...contentStyle }}
          >
            {children}
          </div>
        </LiquidGlass>
      )}
    </div>
  )
}
