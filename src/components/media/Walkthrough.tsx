import { useId, useRef, useState } from 'react'
import { WALKTHROUGH } from '../../config/copy'
import { SCREENS } from '../../config/media'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { ChevronLeft, ChevronRight } from '../ui/Icons'
import { track } from '../../lib/analytics'

interface WalkthroughProps {
  label: string
  placement: 'hero' | 'video-fallback'
}

/**
 * "Explore Command Center": a screenshot walkthrough of actual screens with
 * Open, Previous, and Next controls and a chapter list. No fake timeline,
 * no play label. Chapters without a supplied capture are explained in text.
 */
export function Walkthrough({ label, placement }: WalkthroughProps) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const headingId = useId()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const chapter = WALKTHROUGH[index] ?? WALKTHROUGH[0]
  if (!chapter) return null
  const screen = chapter.screen ? SCREENS[chapter.screen] : null
  const total = WALKTHROUGH.length

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(total - 1, next))
    if (clamped === index) return
    setIndex(clamped)
    const target = WALKTHROUGH[clamped]
    if (target) track('walkthrough_step', { chapterId: target.id, index: clamped })
    headingRef.current?.focus()
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="-mr-3 text-ink-soft"
        onClick={() => {
          track('walkthrough_open', { placement })
          setIndex(0)
          setOpen(true)
        }}
      >
        {label}
        <ChevronRight size={16} />
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Explore Command Center" description="A walkthrough of actual screens. Use Next and Previous, or pick a chapter.">
        <div className="grid h-full lg:grid-cols-[15rem_minmax(0,1fr)]">
          <nav aria-label="Walkthrough chapters" className="min-w-0 border-b border-line lg:border-b-0 lg:border-r">
            <ol className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-col lg:px-3 lg:py-4">
              {WALKTHROUGH.map((c, i) => {
                const current = i === index
                return (
                  <li key={c.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-current={current ? 'step' : undefined}
                      className={`flex min-h-[44px] w-full items-center gap-2.5 whitespace-nowrap rounded-md px-3 text-left text-sm btn-focus lg:whitespace-normal ${
                        current ? 'bg-brand-tint font-semibold text-brand-purple' : 'text-ink-soft hover:bg-canvas-sunken'
                      }`}
                    >
                      <span className={`font-mono text-[11px] ${current ? 'text-brand-purple' : 'text-ink-muted'}`}>{String(i + 1).padStart(2, '0')}</span>
                      {c.title}
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>

          <section aria-labelledby={headingId} className="flex min-w-0 flex-col">
            <div className="flex-1 px-4 py-5 sm:px-6">
              <p className="text-sm text-ink-muted">
                Chapter {index + 1} of {total}
              </p>
              <h3 id={headingId} ref={headingRef} tabIndex={-1} className="mt-1 text-xl font-semibold tracking-[-0.01em] text-ink outline-none sm:text-2xl">
                {chapter.title}
              </h3>
              <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-ink-soft sm:text-base">{chapter.body}</p>

              <div className="mt-5">
                {screen ? (
                  <figure>
                    <div className="overflow-hidden rounded-xl border border-line bg-white">
                      <img src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} className="mx-auto block h-auto max-h-[52dvh] w-auto max-w-full" />
                    </div>
                    {chapter.caption && <figcaption className="mt-2 text-sm text-ink-muted">{chapter.caption}</figcaption>}
                  </figure>
                ) : (
                  <div className="rounded-xl border border-dashed border-line-strong bg-canvas-sunken p-5 text-sm leading-relaxed text-ink-soft">
                    <p className="font-medium text-ink">No screen for this chapter</p>
                    <p className="mt-1">{chapter.noScreenNote}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-6">
              <Button variant="secondary" onClick={() => go(index - 1)} disabled={index === 0}>
                <ChevronLeft size={16} />
                Previous
              </Button>
              <Button variant="secondary" onClick={() => go(index + 1)} disabled={index === total - 1}>
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </section>
        </div>
      </Dialog>
    </>
  )
}
