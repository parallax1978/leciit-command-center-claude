import type { BillingPeriod } from '../plans'
import { ROUTES, subscribeUrl } from '../plans'
import { annualSavings, formatUsd, monthlyEquivalent, perIncludedBusiness, yearlyCost } from '../price'
import type { CtaRoute, PlanCardCopy } from '../content'
import { LinkButton, iconClass, iconSize } from '../../components/ui/Button'
import { ArrowRight, Check } from '../../components/ui/Icons'
import { track } from '../../lib/analytics'

interface PlanCardProps {
  copy: PlanCardCopy
  billing: BillingPeriod
  highlighted?: boolean
}

const BRAND_FRAME = 'linear-gradient(115deg, #6A13CF 0%, #C71E92 100%)'
/** On two-column layouts each card spans three rows of the parent grid, so prices, buttons, and lists line up. */
const SUBGRID = 'md:row-span-3 md:grid md:grid-rows-subgrid md:gap-0'

/**
 * One paid plan, laid out in three parts: price, button, points. Price,
 * billing terms, and the button come first so they are in the first screen.
 * The billing line always says how the price is charged and what annual
 * billing costs and saves, so the annual rate is visible in both states.
 */
export function PlanCard({ copy, billing, highlighted = false }: PlanCardProps) {
  const { plan, altRoute } = copy
  const headingId = `plan-${plan.id}`
  const isAgency = plan.businessesIncluded > 1
  const routeHref = (route: CtaRoute) => (route === 'trial' ? ROUTES.trialStart : subscribeUrl(plan.id, billing))
  const primaryRoute: CtaRoute = plan.trialDays ? 'trial' : 'subscribe'
  // The trial is a Business trial, so a trial link always counts as Business.
  const altPlan = altRoute.route === 'trial' ? 'business_dashboard' : plan.id

  const billingLine =
    billing === 'yearly'
      ? `Billed annually at ${formatUsd(yearlyCost(plan, 'yearly'))}. Save ${formatUsd(annualSavings(plan))} a year.`
      : `Billed monthly. Or ${formatUsd(monthlyEquivalent(plan, 'yearly'))}/month billed annually, saving ${formatUsd(annualSavings(plan))} a year.`

  const card = (
    <article aria-labelledby={headingId} className={`flex h-full flex-col rounded-2xl bg-white p-5 sm:p-7 ${SUBGRID} ${highlighted ? '' : 'border border-line-strong'}`}>
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 id={headingId} className="text-2xl font-semibold tracking-[-0.01em] text-ink">
            {plan.name}
          </h3>
          {plan.trialDays && <span className="rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand-purple">{plan.trialDays}-day free trial</span>}
        </div>
        <p className="mt-1 text-sm font-medium text-ink-soft">{copy.persona}</p>

        <div className="mt-4 sm:mt-5" aria-live="polite">
          <p className="flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-5xl font-semibold tracking-[-0.03em] text-ink">{formatUsd(monthlyEquivalent(plan, billing))}</span>{' '}
            <span className="text-lg text-ink-soft">/month</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{billingLine}</p>
          {isAgency && (
            <p className="mt-1 text-sm font-medium leading-relaxed text-brand-purple">
              {formatUsd(perIncludedBusiness(plan, billing))} per business per month with all {plan.businessesIncluded} in use
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <LinkButton
          href={routeHref(primaryRoute)}
          variant={highlighted ? 'primary' : 'outline'}
          size="lg"
          className="w-full whitespace-nowrap"
          data-plan-cta={plan.id}
          data-cta-route={primaryRoute}
          onClick={() => track('plan_cta_click', { plan: plan.id, billing, placement: 'plan-card' })}
        >
          {copy.ctaLabel}
          <ArrowRight size={iconSize.lg} className={`shrink-0 ${iconClass.lg}`} />
        </LinkButton>
        <p className="mt-3 text-balance text-center text-sm text-ink-muted">{copy.ctaNote}</p>
        <p className="mt-1 text-balance text-center text-sm leading-relaxed text-ink-soft">
          {altRoute.before}
          <a
            href={routeHref(altRoute.route)}
            className="whitespace-nowrap rounded-sm font-medium text-brand-purple underline decoration-brand-purple/40 underline-offset-4 hover:decoration-brand-purple btn-focus"
            data-alt-plan={altPlan}
            data-cta-route={altRoute.route}
            onClick={() => track('plan_cta_click', { plan: altPlan, billing, placement: 'plan-card-alt' })}
          >
            {altRoute.linkLabel}
          </a>
          {altRoute.after}
        </p>
      </div>

      <ul className="mt-6 space-y-2.5 border-t border-line pt-6">
        {copy.points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-[15px] leading-snug text-ink">
            <Check size={16} className="mt-0.5 shrink-0 text-brand-purple" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </article>
  )

  return (
    <div id={copy.anchorId} className={`scroll-mt-6 ${SUBGRID}`}>
      {highlighted ? (
        // A 2px brand-gradient frame marks the recommended plan without changing its legibility.
        <div className={`h-full rounded-[18px] p-[2px] shadow-[0_24px_48px_-28px_rgba(98,16,192,0.55)] ${SUBGRID}`} style={{ backgroundImage: BRAND_FRAME }}>
          {card}
        </div>
      ) : (
        card
      )}
    </div>
  )
}
