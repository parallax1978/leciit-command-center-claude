import { useId, useState } from 'react'
import { Container } from '../ui/Container'
import { Check, Plus } from '../ui/Icons'
import { PrimaryCta } from '../cta/PrimaryCta'
import { OFFER } from '../../config/offer'
import { OFFER_COPY } from '../../config/copy'
import { track } from '../../lib/analytics'

export function Offer() {
  const [openAllowances, setOpenAllowances] = useState(false)
  const panelId = useId()

  return (
    <section aria-labelledby="offer-heading" className="border-t border-line py-16 sm:py-20 lg:py-24" id="offer">
      <Container>
        <div className="grid gap-10 rounded-2xl border border-line-strong p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
          <div>
            <p className="eyebrow">{OFFER_COPY.eyebrow}</p>
            <h2 id="offer-heading" className="h2 mt-3">
              {OFFER_COPY.title}
            </h2>
            <p className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">{OFFER.trialLabel}</p>
            <p className="mt-2 text-lg text-ink-soft">{OFFER.termsShort}</p>
            <PrimaryCta placement="offer" className="mt-8 w-full sm:w-auto" />
          </div>

          <div className="lg:border-l lg:border-line lg:pl-16">
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{OFFER_COPY.coversTitle}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{OFFER.covers}</p>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {OFFER.coversList.map((item) => (
                <li key={item} className="flex items-start gap-3 py-2.5 text-[15px] text-ink">
                  <Check size={16} className="mt-0.5 shrink-0 text-brand-purple" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[15px] font-medium leading-relaxed text-ink">
              {OFFER.separateServices} {OFFER.additionalBusiness}
            </p>

            <div className="mt-5">
              <button
                type="button"
                aria-expanded={openAllowances}
                aria-controls={panelId}
                onClick={() => {
                  const next = !openAllowances
                  track('allowances_toggle', { expanded: next })
                  setOpenAllowances(next)
                }}
                className="-ml-1 inline-flex min-h-[44px] items-center gap-2 rounded-md px-1 text-sm font-medium text-ink-soft btn-focus hover:text-ink"
              >
                <Plus size={16} className={`text-brand-purple transition-transform motion-reduce:transition-none ${openAllowances ? 'rotate-45' : ''}`} />
                {OFFER.allowancesLabel}
              </button>
              <div id={panelId} hidden={!openAllowances} className="pb-1 pl-6">
                <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink">
                  {OFFER.allowances.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-ink-muted">{OFFER.allowancesNote}</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
