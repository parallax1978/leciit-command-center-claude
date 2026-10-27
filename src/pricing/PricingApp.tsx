import { useState } from 'react'
import { Container } from '../components/ui/Container'
import { Footer } from '../components/sections/Footer'
import { Faq } from '../components/sections/Faq'
import { PricingHeader } from './components/PricingHeader'
import { BillingToggle } from './components/BillingToggle'
import { PlanCard } from './components/PlanCard'
import { MarketplaceStrip } from './components/MarketplaceStrip'
import { IncludedSection } from './components/IncludedSection'
import { CompareTable } from './components/CompareTable'
import { PricingFinal } from './components/PricingFinal'
import { AGENCY_CARD, BUSINESS_CARD, PRICING_FAQ, PRICING_FAQ_COPY, PRICING_HERO } from './content'
import { BUSINESS_PLAN, ROUTES, type BillingPeriod } from './plans'
import { annualDiscountPercent } from './price'
import { COMPANY_LINE } from '../config/site'
import { track } from '../lib/analytics'

const H1_GRADIENT = 'linear-gradient(95deg, #6A13CF 12%, #C71E92 98%)'

export default function PricingApp() {
  const [billing, setBilling] = useState<BillingPeriod>('monthly')

  const changeBilling = (next: BillingPeriod) => {
    track('billing_change', { billing: next })
    setBilling(next)
  }

  return (
    <div id="top" className="min-h-dvh bg-canvas text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-canvas focus:px-4 focus:py-3 focus:text-ink focus:shadow-frame btn-focus"
      >
        Skip To Content
      </a>
      <PricingHeader />
      <main id="main">
        <section aria-labelledby="pricing-heading" className="pb-14 pt-12 sm:pb-20 sm:pt-16">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow">{PRICING_HERO.eyebrow}</p>
              <h1 id="pricing-heading" className="mt-4 text-[2.375rem] font-semibold leading-[1.08] tracking-[-0.025em] text-ink sm:text-[2.75rem] lg:text-[3.25rem]">
                <span className="block">{PRICING_HERO.h1Line1}</span>
                <span className="block bg-clip-text text-transparent" style={{ backgroundImage: H1_GRADIENT }}>
                  {PRICING_HERO.h1Line2}
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl sm:leading-relaxed">{PRICING_HERO.subhead}</p>
              <div className="mt-8 flex justify-center">
                <BillingToggle value={billing} onChange={changeBilling} annualDiscountPercent={annualDiscountPercent(BUSINESS_PLAN)} />
              </div>
            </div>

            <h2 className="sr-only">Plans and prices</h2>
            <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8">
              <PlanCard copy={BUSINESS_CARD} billing={billing} highlighted />
              <div className="flex flex-col">
                <PlanCard copy={AGENCY_CARD} billing={billing} />
                <p className="mt-3 text-center text-sm text-ink-muted">
                  Not sure yet?{' '}
                  <a href={ROUTES.trialStart} className="font-medium text-brand-purple underline-offset-4 hover:underline btn-focus rounded-sm">
                    Start with the Business trial
                  </a>{' '}
                  and upgrade later.
                </p>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-5xl">
              <MarketplaceStrip />
            </div>

            <p className="mx-auto mt-10 max-w-5xl text-center text-sm text-ink-muted">{COMPANY_LINE}</p>
          </Container>
        </section>
        <IncludedSection />
        <CompareTable />
        <Faq eyebrow={PRICING_FAQ_COPY.eyebrow} title={PRICING_FAQ_COPY.title} items={PRICING_FAQ} headingId="pricing-faq-heading" />
        <PricingFinal billing={billing} />
      </main>
      <Footer />
    </div>
  )
}
