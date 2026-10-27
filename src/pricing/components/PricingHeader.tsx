import { Container } from '../../components/ui/Container'
import { Logo } from '../../components/brand/Logo'
import { PrimaryCta } from '../../components/cta/PrimaryCta'
import { PRODUCT_NAME } from '../../config/site'
import { ROUTES, type BillingPeriod } from '../plans'
import { track } from '../../lib/analytics'

/** Same lockup and trial button as the landing page, plus Log In (Legiit's own label) for customers who want to upgrade. */
export function PricingHeader({ billing }: { billing: BillingPeriod }) {
  return (
    <header className="border-b border-line bg-canvas">
      <Container className="flex min-h-[64px] items-center justify-between gap-3 py-3">
        <a href="#top" className="-ml-2 inline-flex min-h-[44px] min-w-0 items-center gap-2 rounded-md px-2 btn-focus sm:gap-3" aria-label={`Legiit ${PRODUCT_NAME}, back to top`}>
          <Logo height={26} className="sm:!h-7" />
          <span aria-hidden="true" className="h-5 w-px shrink-0 bg-line-strong" />
          <span className="whitespace-nowrap text-[13px] font-medium text-ink sm:text-[15px]">{PRODUCT_NAME}</span>
        </a>
        <div className="flex items-center gap-1 sm:gap-3">
          <a href={ROUTES.signIn} className="hidden min-h-[44px] items-center rounded-md px-3 text-[15px] font-medium text-ink-soft hover:text-ink btn-focus sm:inline-flex">
            Log In
          </a>
          <PrimaryCta placement="header" className="!px-3 sm:!px-4" onTrack={() => track('plan_cta_click', { plan: 'business_dashboard', billing, placement: 'header' })} />
        </div>
      </Container>
    </header>
  )
}
