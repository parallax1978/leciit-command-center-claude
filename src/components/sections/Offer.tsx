import { useId, useState } from 'react'
import { Container } from '../ui/Container'
import { Check, Plus } from '../ui/Icons'
import { PrimaryCta } from '../cta/PrimaryCta'
import { OFFER } from '../../config/offer'
import { track } from '../../lib/analytics'

const BOX_GRADIENT = 'linear-gradient(115deg, #6A13CF 0%, #C71E92 100%)'

/** One prominent offer box on the brand gradient: benefits left, pricing and CTA right. */
export function Offer() {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <section aria-labelledby="offer-heading" className="border-t border-line py-16 sm:py-20 lg:py-24" id="offer">
      <Container>
        <div className="grid gap-10 rounded-2xl p-6 text-white sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:p-14" style={{ background: BOX_GRADIENT }}>
          <div>
            <p className="text-[13px] font-semibold tracking-[0.02em] text-white/95">{OFFER.eyebrow}</p>
            <h2 id="offer-heading" className="mt-3 text-[1.875rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-[2.25rem] lg:text-[2.5rem]">
              {OFFER.title}
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-white/95 sm:text-lg">{OFFER.body}</p>
            <ul className="mt-6 divide-y divide-white/[0.26] border-y border-white/[0.26]">
              {OFFER.benefits.map((item) => (
                <li key={item} className="flex items-start gap-3 py-3 text-[16px] text-white">
                  <Check size={18} className="mt-0.5 shrink-0 text-white" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:border-l lg:border-white/[0.26] lg:pl-14">
            <p className="inline-flex items-center rounded-full border border-white/[0.45] px-3.5 py-1.5 text-sm font-medium text-white">{OFFER.trialBadge}</p>
            <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
              <span className="text-5xl font-semibold tracking-[-0.03em] text-white">{OFFER.priceAmount}</span>{' '}
              <span className="text-lg text-white/95">{OFFER.priceRest}</span>
            </p>
            <p className="mt-1 text-[15px] text-white/95">{OFFER.supportingLine}</p>
            <PrimaryCta placement="offer" className="mt-6 w-full sm:w-auto" />
            <p className="mt-4 text-sm leading-relaxed text-white/95">{OFFER.accountNote}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/95">
              {OFFER.additionalBusiness}
              <br />
              {OFFER.separateServices}
            </p>

            <div className="mt-5 border-t border-white/[0.26] pt-3">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => {
                  const next = !open
                  track('allowances_toggle', { expanded: next })
                  setOpen(next)
                }}
                className="-ml-1 inline-flex min-h-[44px] items-center gap-2 rounded-md px-1 text-sm font-semibold text-white btn-focus focus-visible:!outline-white"
              >
                <Plus size={16} className={`transition-transform motion-reduce:transition-none ${open ? 'rotate-45' : ''}`} />
                {OFFER.allowancesControl}
              </button>
              <p id={panelId} hidden={!open} className="pb-1 pl-6 text-sm leading-relaxed text-white/95">
                {OFFER.allowancesText}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
