import { useState } from 'react'
import { LOGO } from '../../config/assets'

interface LogoProps {
  /** Rendered height in pixels; width follows the natural aspect ratio. */
  height?: number
  className?: string
}

/**
 * Supplied light-background logo at its natural aspect ratio, with a clean
 * text fallback if the image cannot load.
 */
export function Logo({ height = 40, className = '' }: LogoProps) {
  const [failed, setFailed] = useState(false)
  const width = Math.round((LOGO.width / LOGO.height) * height)

  if (failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center self-start font-semibold tracking-[-0.02em] text-ink ${className}`}
        style={{ height, fontSize: Math.round(height * 0.55) }}
      >
        {LOGO.fallbackText}
      </span>
    )
  }

  return (
    <img
      src={LOGO.src}
      alt={LOGO.alt}
      width={width}
      height={height}
      style={{ height, width }}
      className={`block shrink-0 self-start ${className}`}
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
