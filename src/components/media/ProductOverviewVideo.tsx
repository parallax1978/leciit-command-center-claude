import { forwardRef, useRef, useState, type SyntheticEvent } from 'react'
import { PRODUCT_OVERVIEW } from '../../config/media'
import { HERO } from '../../config/copy'
import { track, type Milestone } from '../../lib/analytics'
import { Walkthrough } from './Walkthrough'

const MILESTONES: Milestone[] = [25, 50, 75]

/**
 * The hero's product demonstration: the actual 42-second silent overview with
 * native controls, poster, and the supplied English caption track served
 * same-origin. Never autoplays. If the media fails to load, the poster stays
 * visible with an honest message and the walkthrough as the fallback.
 */
export const ProductOverviewVideo = forwardRef<HTMLVideoElement, { className?: string }>(function ProductOverviewVideo({ className = '' }, ref) {
  const [failed, setFailed] = useState(false)
  const played = useRef(false)
  const reached = useRef<Set<Milestone>>(new Set())

  const onPlay = () => {
    if (played.current) return
    played.current = true
    track('video_play', {})
  }

  const onTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget
    if (!Number.isFinite(video.duration) || video.duration <= 0) return
    const percent = (video.currentTime / video.duration) * 100
    for (const milestone of MILESTONES) {
      if (percent >= milestone && !reached.current.has(milestone)) {
        reached.current.add(milestone)
        track('video_progress', { milestone })
      }
    }
  }

  return (
    <figure className={className} id="product-overview">
      <div className="overflow-hidden rounded-2xl border border-line bg-ink shadow-frame">
        {failed ? (
          <div className="relative" style={{ aspectRatio: `${PRODUCT_OVERVIEW.width} / ${PRODUCT_OVERVIEW.height}` }}>
            <img src={PRODUCT_OVERVIEW.poster} alt={PRODUCT_OVERVIEW.posterAlt} width={PRODUCT_OVERVIEW.width} height={PRODUCT_OVERVIEW.height} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-ink/85 px-4 py-3 text-sm text-white">The product overview video could not be loaded. Use the walkthrough below to see the same screens.</div>
          </div>
        ) : (
          <video
            ref={ref}
            className="block aspect-video w-full bg-ink"
            controls
            playsInline
            preload="metadata"
            poster={PRODUCT_OVERVIEW.poster}
            width={PRODUCT_OVERVIEW.width}
            height={PRODUCT_OVERVIEW.height}
            aria-label={PRODUCT_OVERVIEW.title}
            crossOrigin="anonymous"
            onPlay={onPlay}
            onTimeUpdate={onTimeUpdate}
            onEnded={() => track('video_complete', {})}
            onError={(event) => {
              // React re-dispatches a child <source> error here too. Only the element's own
              // MediaError means every source failed; a single source failing is not a failure.
              if (event.currentTarget.error) setFailed(true)
            }}
          >
            {PRODUCT_OVERVIEW.sources.map((s, i, all) => (
              // With <source> children the browser reports total failure on the last source only.
              <source key={s.src} src={s.src} type={s.type} onError={i === all.length - 1 ? () => setFailed(true) : undefined} />
            ))}
            {PRODUCT_OVERVIEW.captions.map((t) => (
              <track key={t.src} kind="captions" src={t.src} srcLang={t.srcLang} label={t.label} default={t.default} />
            ))}
          </video>
        )}
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-ink-muted">
        <span className="max-w-[36rem] py-1.5">{PRODUCT_OVERVIEW.caption}</span>
        <Walkthrough label={HERO.walkthroughAction} placement={failed ? 'video-fallback' : 'hero'} />
      </figcaption>
    </figure>
  )
})
