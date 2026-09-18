import { useRef, type SyntheticEvent } from 'react'
import { track, type VideoMilestone } from '../../lib/analytics'

interface NativeVideoProps {
  src: string
  poster: string
  captions: string
}

const MILESTONES: VideoMilestone[] = [25, 50, 75]

/**
 * Native player for a supplied recording. Click-to-play with controls, no
 * autoplay. Events are emitted only from real media events, once per mount.
 */
export function NativeVideo({ src, poster, captions }: NativeVideoProps) {
  const played = useRef(false)
  const reached = useRef<Set<VideoMilestone>>(new Set())
  const hasCaptions = captions.trim().length > 0

  const onPlay = () => {
    if (played.current) return
    played.current = true
    track('video_play', { placement: 'hero' })
  }

  const onTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget
    if (!Number.isFinite(video.duration) || video.duration <= 0) return
    const percent = (video.currentTime / video.duration) * 100
    for (const milestone of MILESTONES) {
      if (percent >= milestone && !reached.current.has(milestone)) {
        reached.current.add(milestone)
        track('video_progress', { placement: 'hero', milestone })
      }
    }
  }

  return (
    <figure>
      <div className="overflow-hidden rounded-2xl border border-line bg-ink shadow-frame">
        <video
          className="aspect-video w-full bg-ink"
          controls
          playsInline
          preload="metadata"
          poster={poster}
          onPlay={onPlay}
          onTimeUpdate={onTimeUpdate}
          onEnded={() => track('video_complete', { placement: 'hero' })}
        >
          <source src={src} />
          {hasCaptions && <track kind="captions" src={captions} srcLang="en" label="English" default />}
        </video>
      </div>
      <figcaption className="mt-3 text-center text-sm text-ink-muted">Command Center product demo</figcaption>
    </figure>
  )
}
