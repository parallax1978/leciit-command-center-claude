import { Container } from '../ui/Container'
import { PrimaryCta } from '../cta/PrimaryCta'
import { Check } from '../ui/Icons'
import { OFFER } from '../../config/offer'

export function Offer() {
  return (
    <section aria-labelledby="offer-heading" className="border-t border-line py-14 sm:py-20">
      <Container>
        <div className="grid gap-10 rounded-2xl border border-line p-6 sm:p-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:p-14">
          <div>
            <p className="eyebrow">{OFFER.planName}</p>
            <h2 id="offer-heading" className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[2.125rem]">
              One plan for your business
            </h2>
            <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
              <span className="text-5xl font-semibold tracking-[-0.03em] text-ink sm:text-6xl">${OFFER.monthlyPrice}</span>
              <span className="text-lg text-ink-soft">/month</span>
            </p>
            <p className="mt-1 text-[17px] text-ink-soft">after a {OFFER.trialDays}-day free trial</p>
            <PrimaryCta placement="offer" className="mt-8 w-full sm:w-auto" />
          </div>
          <div className="lg:border-l lg:border-line lg:pl-16">
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-muted">Included</h3>
            <ul className="mt-4 divide-y divide-line">
              {OFFER.inclusions.map((item) => (
                <li key={item} className="flex items-start gap-3 py-3 text-[17px] text-ink">
                  <Check size={18} className="mt-1 shrink-0 text-brand-purple" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
              {OFFER.additionalBusiness} {OFFER.freelanceNote}
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
