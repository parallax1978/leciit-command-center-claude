import { Container } from '../../components/ui/Container'
import { LinkButton, iconClass, iconSize } from '../../components/ui/Button'
import { ArrowRight } from '../../components/ui/Icons'
import { PRICING_FINAL, BUSINESS_CARD, AGENCY_CARD } from '../content'
import { ROUTES, subscribeUrl, type BillingPeriod } from '../plans'
import { track } from '../../lib/analytics'
import { AgencyNote } from './AgencyNote'

const BOX_GRADIENT = 'linear-gradient(115deg, #6A13CF 0%, #C71E92 100%)'

/** Closing call to action on the landing page's offer-box gradient. The trial stays the primary route. */
export function PricingFinal({ billing }: { billing: BillingPeriod }) {
  return (
    <section aria-labelledby="pricing-final-heading" className="border-t border-line py-16 sm:py-20">
      <Container>
        <div className="rounded-2xl px-6 py-12 text-center text-white sm:px-10 sm:py-16" style={{ background: BOX_GRADIENT }}>
          <h2 id="pricing-final-heading" className="mx-auto max-w-2xl text-balance text-[1.875rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-[2.25rem] lg:text-[2.5rem]">
            {PRICING_FINAL.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-[17px] leading-relaxed text-white/95 sm:text-lg">{PRICING_FINAL.body}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton
              href={ROUTES.trialStart}
              variant="inverse"
              size="lg"
              className="w-full whitespace-nowrap sm:w-auto"
              data-plan-cta="business_dashboard"
              data-cta-route="trial"
              onClick={() => track('plan_cta_click', { plan: 'business_dashboard', billing, placement: 'final' })}
            >
              {BUSINESS_CARD.ctaLabel}
              <ArrowRight size={iconSize.lg} className={`shrink-0 ${iconClass.lg}`} />
            </LinkButton>
            <LinkButton
              href={subscribeUrl('agency_dashboard', billing)}
              variant="outlineInverse"
              size="lg"
              className="w-full whitespace-nowrap sm:w-auto"
              data-plan-cta="agency_dashboard"
              data-cta-route="subscribe"
              onClick={() => track('plan_cta_click', { plan: 'agency_dashboard', billing, placement: 'final' })}
            >
              {AGENCY_CARD.ctaLabel}
            </LinkButton>
          </div>
          <AgencyNote billing={billing} placement="final" tone="inverse" className="mt-5" />
        </div>
      </Container>
    </section>
  )
}
