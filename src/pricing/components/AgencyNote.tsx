import { AGENCY_CARD } from '../content'
import { ROUTES, type BillingPeriod } from '../plans'
import { track } from '../../lib/analytics'

interface AgencyNoteProps {
  billing: BillingPeriod
  placement: string
  /** `inverse` for white text on the gradient band. */
  tone?: 'default' | 'inverse'
  className?: string
}

/**
 * The two lines that follow every "Choose Agency" button away from the card:
 * checkout starts with a Legiit log-in, and new agencies can start with the
 * Business trial (Legiit's registration drops the chosen plan).
 */
export function AgencyNote({ billing, placement, tone = 'default', className = '' }: AgencyNoteProps) {
  const { altRoute } = AGENCY_CARD
  const inverse = tone === 'inverse'
  return (
    <div className={`text-sm leading-relaxed ${inverse ? 'text-white/90' : 'text-ink-muted'} ${className}`}>
      <p>{AGENCY_CARD.ctaNote}</p>
      <p className={inverse ? '' : 'text-ink-soft'}>
        {altRoute.before}
        <a
          href={ROUTES.trialStart}
          className={`whitespace-nowrap rounded-sm font-medium underline underline-offset-4 btn-focus ${
            inverse ? 'text-white decoration-white/60 hover:decoration-white focus-visible:!outline-white' : 'text-brand-purple decoration-brand-purple/40 hover:decoration-brand-purple'
          }`}
          data-alt-plan="business_dashboard"
          data-cta-route="trial"
          onClick={() => track('plan_cta_click', { plan: 'business_dashboard', billing, placement: `${placement}-alt` })}
        >
          {altRoute.linkLabel}
        </a>
        {altRoute.after}
      </p>
    </div>
  )
}
