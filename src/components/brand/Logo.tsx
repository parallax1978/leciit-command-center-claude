import { useState } from 'react'
import { LOGO } from '../../config/media'

interface LogoProps {
  height?: number
  className?: string
}

/** Official light-background logo at its natural ratio, with a text fallback. */
export function Logo({ height = 32, className = '' }: LogoProps) {
  const [failed, setFailed] = useState(false)
  const width = Math.round((LOGO.width / LOGO.height) * height)

  if (failed) {
    return (
      <span className={`inline-flex shrink-0 items-center self-start font-semibold tracking-[-0.02em] text-ink ${className}`} style={{ height, fontSize: Math.round(height * 0.6) }}>
        {LOGO.fallbackText}
      </span>
    )
  }

  return <img src={LOGO.src} alt={LOGO.alt} width={width} height={height} style={{ height, width }} className={`block shrink-0 self-start ${className}`} decoding="async" onError={() => setFailed(true)} />
}
