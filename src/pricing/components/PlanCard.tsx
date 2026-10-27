import type { BillingPeriod } from '../plans'
import { ROUTES, subscribeUrl } from '../plans'
import { annualSavings, formatUsd, monthlyEquivalent, perIncludedBusiness, yearlyCost } from '../price'
import type { PlanCardCopy } from '../content'
import { LinkButton, iconSize } from '../../components/ui/Button'
import { ArrowRight, Check } from '../../components/ui/Icons'
import { track } from '../../lib/analytics'

interface PlanCardProps {
  copy: PlanCardCopy
  billing: BillingPeriod
  highlighted?: boolean
  headingLevel?: 'h2' | 'h3'
}

/**
 * One paid plan. The price block always states how the price is billed and
 * shows the other billing period, so the annual default never hides a cost.
 */
export function PlanCard({ copy, billing, highlighted = false, headingLevel = 'h3' }: PlanCardProps) {
  const { plan } = copy
  const Heading = headingLevel
  const price = monthlyEquivalent(plan, billing)
  const headingId = `plan-${plan.id}`
  const isAgency = plan.businessesIncluded > 1
  const href = plan.trialDays ? ROUTES.trialStart : subscribeUrl(plan.id, billing)

  const billingLine =
    billing === 'yearly'
      ? `Billed annually at ${formatUsd(yearlyCost(plan, 'yearly'))}. ${formatUsd(plan.monthlyPrice)}/month if billed monthly.`
      : `Billed monthly. Pay annually and save ${formatUsd(annualSavings(plan))} a year.`

  const card = (
    <article aria-labelledby={headingId} className={`flex h-full flex-col rounded-2xl bg-white p-6 sm:p-8 ${highlighted ? '' : 'border border-line'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading id={headingId} className="text-2xl font-semibold tracking-[-0.01em] text-ink">
          {plan.name}
        </Heading>
        <div className="flex flex-wrap gap-2">
          {plan.trialDays && <span className="rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand-purple">{plan.trialDays}-day free trial</span>}
          {copy.badge && <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">{copy.badge}</span>}
        </div>
      </div>
      <p className="mt-1 text-sm font-medium text-ink-soft">{copy.persona}</p>

      <div className="mt-6" aria-live="polite">
        <p className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-5xl font-semibold tracking-[-0.03em] text-ink">{formatUsd(price)}</span>{' '}
          <span className="text-lg text-ink-soft">/month</span>
        </p>
        <p className="mt-2 min-h-[2.75rem] text-sm leading-relaxed text-ink-muted">{billingLine}</p>
        {isAgency && (
          <p className="mt-1 text-sm font-medium text-brand-purple">
            {formatUsd(perIncludedBusiness(plan, billing))} per business per month with all {plan.businessesIncluded} in use
          </p>
        )}
      </div>

      <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{copy.summary}</p>

      <ul className="mt-5 space-y-2.5">
        {copy.points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-[15px] leading-snug text-ink">
            <Check size={16} className="mt-0.5 shrink-0 text-brand-purple" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <LinkButton
          href={href}
          variant={highlighted ? 'primary' : 'outline'}
          size="lg"
          className="w-full whitespace-nowrap"
          data-plan-cta={plan.id}
          onClick={() => track('plan_cta_click', { plan: plan.id, billing, placement: 'plan-card' })}
        >
          {copy.ctaLabel}
          <ArrowRight size={iconSize.lg} className="shrink-0" />
        </LinkButton>
        <p className="mt-3 text-center text-sm text-ink-muted">{copy.ctaNote}</p>
      </div>
    </article>
  )

  if (!highlighted) return card
  // A 2px brand-gradient frame marks the recommended plan without changing its legibility.
  return <div className="h-full rounded-[18px] p-[2px] shadow-[0_24px_48px_-28px_rgba(98,16,192,0.55)]" style={{ backgroundImage: 'linear-gradient(115deg, #6A13CF 0%, #C71E92 100%)' }}>{card}</div>
}
