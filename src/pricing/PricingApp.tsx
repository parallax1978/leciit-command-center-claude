import { useEffect, useState } from 'react'
import { Container } from '../components/ui/Container'
import { Footer } from '../components/sections/Footer'
import { Faq } from '../components/sections/Faq'
import { PricingHeader } from './components/PricingHeader'
import { BillingToggle } from './components/BillingToggle'
import { PlanCard } from './components/PlanCard'
import { MarketplaceStrip } from './components/MarketplaceStrip'
import { PerBusiness } from './components/PerBusiness'
import { CompareTable } from './components/CompareTable'
import { IncludedSection } from './components/IncludedSection'
import { PricingFinal } from './components/PricingFinal'
import { AGENCY_CARD, BUSINESS_CARD, PRICING_FAQ, PRICING_FAQ_COPY, PRICING_FOOTER_LINKS, PRICING_HERO, billingAnnouncement } from './content'
import { BUSINESS_PLAN, DEFAULT_BILLING, type BillingPeriod } from './plans'
import { annualDiscountPercent } from './price'
import { COMPANY_LINE } from '../config/site'
import { track } from '../lib/analytics'

const H1_GRADIENT = 'linear-gradient(95deg, #6A13CF 12%, #C71E92 98%)'

export default function PricingApp() {
  const [billing, setBilling] = useState<BillingPeriod>(DEFAULT_BILLING)
  // Empty on load, so nothing is announced until the visitor changes billing.
  const [announcement, setAnnouncement] = useState('')

  // The page renders after the browser's own jump to a fragment such as #agency (the planned
  // redirect target for /pricing/agency-plan), so repeat the jump once the sections exist.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  const changeBilling = (next: BillingPeriod) => {
    track('billing_change', { billing: next })
    setBilling(next)
    setAnnouncement(billingAnnouncement(next))
  }

  return (
    <div id="top" className="min-h-dvh bg-canvas text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-canvas focus:px-4 focus:py-3 focus:text-ink focus:shadow-frame btn-focus"
      >
        Skip To Content
      </a>
      <PricingHeader billing={billing} />
      <main id="main">
        <section aria-labelledby="pricing-heading" className="pb-14 pt-6 sm:pb-20 sm:pt-10 short:!pt-6">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <p className="eyebrow hidden sm:block short:!hidden">{PRICING_HERO.eyebrow}</p>
              <h1 id="pricing-heading" className="text-[1.875rem] font-semibold leading-[1.1] tracking-[-0.025em] text-ink sm:mt-3 sm:text-[2.75rem] lg:text-[3rem] lg:leading-[1.08] short:!mt-0 short:!text-[2.5rem]">
                <span className="block">{PRICING_HERO.h1Line1}</span>
                <span className="block bg-clip-text text-transparent" style={{ backgroundImage: H1_GRADIENT }}>
                  {PRICING_HERO.h1Line2}
                </span>
              </h1>
              <p className="mx-auto mt-3 max-w-[46rem] text-balance text-base leading-relaxed text-ink-soft sm:mt-4 sm:text-lg short:!mt-3">
                {PRICING_HERO.subheadBefore}
                <a href="#agency" className="whitespace-nowrap rounded-sm font-medium text-brand-purple underline decoration-brand-purple/40 underline-offset-4 hover:decoration-brand-purple btn-focus">
                  {PRICING_HERO.subheadLink}
                </a>
                {PRICING_HERO.subheadAfter}
              </p>
              <div className="mt-5 flex justify-center sm:mt-6 short:!mt-4">
                <BillingToggle value={billing} onChange={changeBilling} annualDiscountPercent={annualDiscountPercent(BUSINESS_PLAN)} />
              </div>
              <div role="status" className="sr-only">
                {announcement}
              </div>
            </div>

            <h2 className="sr-only">Plans and prices</h2>
            <div className="mx-auto mt-5 grid max-w-[1000px] gap-6 sm:mt-6 md:grid-cols-2 md:gap-x-8 md:gap-y-0 short:!mt-4">
              <PlanCard copy={BUSINESS_CARD} billing={billing} highlighted />
              <PlanCard copy={AGENCY_CARD} billing={billing} />
            </div>

            <div className="mx-auto mt-8 max-w-[1000px]">
              <MarketplaceStrip />
            </div>

            <p className="mx-auto mt-10 max-w-[1000px] text-center text-sm text-ink-muted">{COMPANY_LINE}</p>
          </Container>
        </section>
        <PerBusiness billing={billing} />
        <CompareTable billing={billing} />
        <IncludedSection />
        <Faq eyebrow={PRICING_FAQ_COPY.eyebrow} title={PRICING_FAQ_COPY.title} items={PRICING_FAQ} headingId="pricing-faq-heading" />
        <PricingFinal billing={billing} />
      </main>
      <Footer links={PRICING_FOOTER_LINKS} navLabel="Footer" />
    </div>
  )
}
