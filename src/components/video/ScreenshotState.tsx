import { useState } from 'react'
import { PRODUCT_SCREENSHOT } from '../../config/assets'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { Expand } from '../ui/Icons'

/**
 * Honest missing-recording state: the actual AI Visibility screenshot at a
 * readable size, an accurate caption, and a visible placeholder label.
 * No play icon, duration, controls, or loading state.
 */
export function ScreenshotState() {
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <figure>
      <div className="overflow-hidden rounded-2xl border border-line bg-canvas shadow-frame">
        <p className="border-b border-line bg-canvas-sunken px-4 py-2.5 text-[13px] leading-snug text-ink-muted sm:text-sm">
          <span className="font-medium text-ink">Demo video placeholder</span>
          <span aria-hidden="true" className="mx-2 text-line-strong">
            |
          </span>
          Product screenshot shown.
        </p>
        {failed ? (
          <div
            role="img"
            aria-label={PRODUCT_SCREENSHOT.alt}
            className="flex items-center justify-center bg-canvas-sunken p-6 text-center text-sm leading-relaxed text-ink-soft"
            style={{ aspectRatio: `${PRODUCT_SCREENSHOT.width} / ${PRODUCT_SCREENSHOT.height}` }}
          >
            <p className="max-w-md">The AI Visibility screenshot could not be loaded. It shows the one-click checkup across ChatGPT, Gemini, Claude, and Grok, and the Find what to target tools.</p>
          </div>
        ) : (
          <img
            src={PRODUCT_SCREENSHOT.src}
            alt={PRODUCT_SCREENSHOT.alt}
            width={PRODUCT_SCREENSHOT.width}
            height={PRODUCT_SCREENSHOT.height}
            decoding="async"
            fetchPriority="high"
            className="block h-auto w-full"
            onError={() => setFailed(true)}
          />
        )}
        <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line px-4 py-2 text-sm text-ink-soft">
          <span className="py-2 font-medium">{PRODUCT_SCREENSHOT.caption}</span>
          {!failed && (
            <Button variant="ghost" className="-mr-2 text-sm text-ink-soft" onClick={() => setOpen(true)}>
              <Expand size={16} />
              View full-size screenshot
            </Button>
          )}
        </figcaption>
      </div>

      {!failed && (
        <Dialog open={open} onClose={() => setOpen(false)} title={PRODUCT_SCREENSHOT.caption} description="Actual interface capture at full size.">
          <div className="h-full overflow-auto bg-canvas-sunken p-3 sm:p-6">
            <img
              src={PRODUCT_SCREENSHOT.src}
              alt={PRODUCT_SCREENSHOT.alt}
              width={PRODUCT_SCREENSHOT.width}
              height={PRODUCT_SCREENSHOT.height}
              className="mx-auto block h-auto max-w-none rounded-lg border border-line bg-white"
              style={{ width: 'clamp(900px, 100%, 1000px)' }}
            />
          </div>
        </Dialog>
      )}
    </figure>
  )
}
