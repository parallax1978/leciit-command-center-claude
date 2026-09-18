import { useState } from 'react'
import { SCREENS, type ScreenId } from '../../config/media'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { Expand } from '../ui/Icons'
import { track } from '../../lib/analytics'

interface ProductImageProps {
  screen: ScreenId
  caption?: string
  /** Eager for above-the-fold media, lazy otherwise. */
  priority?: boolean
  enlarge?: boolean
  className?: string
}

/**
 * An actual product screen at its natural proportions, with reserved
 * dimensions, a truthful caption, and an optional enlarge dialog that always
 * shows the full, uncropped capture.
 */
export function ProductImage({ screen, caption, priority = false, enlarge = true, className = '' }: ProductImageProps) {
  const asset = SCREENS[screen]
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  const frame = asset.frame

  const img = (
    <img
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={frame ? 'block h-auto max-w-none' : 'block h-auto w-full'}
      style={frame ? { width: `${100 / frame.widthFraction}%` } : undefined}
      onError={() => setFailed(true)}
    />
  )

  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-frame">
        {failed ? (
          <div role="img" aria-label={asset.alt} className="flex items-center bg-canvas-sunken p-5 text-sm leading-relaxed text-ink-soft" style={{ aspectRatio: `${asset.width} / ${asset.height}` }}>
            <p>
              The {asset.name} screenshot could not be loaded. {asset.alt}
            </p>
          </div>
        ) : frame ? (
          <div className="overflow-hidden" style={{ aspectRatio: `${Math.round(asset.width * frame.widthFraction)} / ${asset.height}` }}>
            {img}
          </div>
        ) : (
          img
        )}
      </div>
      {(caption || enlarge) && (
        <figcaption className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-ink-muted">
          <span className="py-1.5">{caption}</span>
          {enlarge && !failed && (
            <Button
              variant="ghost"
              size="sm"
              className="-mr-3 text-ink-soft"
              onClick={() => {
                track('image_enlarge', { screenId: asset.id })
                setOpen(true)
              }}
              aria-label={`Enlarge the ${asset.name} screenshot`}
            >
              <Expand size={16} />
              Enlarge
            </Button>
          )}
        </figcaption>
      )}
      {enlarge && !failed && (
        <Dialog open={open} onClose={() => setOpen(false)} title={`Inside Command Center: ${asset.name}`} description="Actual screen, shown at full size and uncropped.">
          <div className="h-full overflow-auto bg-canvas-sunken p-3 sm:p-6">
            <img
              src={asset.src}
              alt={asset.alt}
              width={asset.width}
              height={asset.height}
              className="mx-auto block h-auto max-w-none rounded-lg border border-line bg-white"
              style={{ width: `clamp(${Math.min(asset.width, 900)}px, 100%, ${asset.width}px)` }}
            />
          </div>
        </Dialog>
      )}
    </figure>
  )
}
