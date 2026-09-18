import { useState } from 'react'
import { PRODUCT_SCREENSHOT } from '../../config/assets'
import { Play } from '../ui/Icons'

interface EmbedVideoProps {
  embedUrl: string
  poster: string
}

/**
 * Click-to-play provider embed. The iframe is created only after the visitor
 * asks for it, so nothing loads or plays on its own. Provider players do not
 * expose trustworthy playback events, so no video events are emitted here.
 */
export function EmbedVideo({ embedUrl, poster }: EmbedVideoProps) {
  const [activated, setActivated] = useState(false)

  return (
    <figure>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-ink shadow-frame">
        {activated ? (
          <iframe
            src={embedUrl}
            title="Command Center product demo"
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            allow="fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            className="group absolute inset-0 flex h-full w-full items-center justify-center btn-focus"
            onClick={() => setActivated(true)}
            aria-label="Play the product demo"
          >
            <img src={poster} alt={poster === PRODUCT_SCREENSHOT.src ? PRODUCT_SCREENSHOT.alt : ''} className="absolute inset-0 h-full w-full object-cover" />
            <span className="relative inline-flex min-h-[56px] items-center gap-2 rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta px-6 text-base font-semibold text-white shadow-frame">
              <Play size={20} />
              Play the product demo
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 text-center text-sm text-ink-muted">Command Center product demo</figcaption>
    </figure>
  )
}
