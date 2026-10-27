import { ROUTES } from '../plans'
import { MARKETPLACE_STRIP } from '../content'
import { LinkButton } from '../../components/ui/Button'
import { track } from '../../lib/analytics'

/** The free marketplace account, kept available but out of the Command Center plan comparison. Terms in plain words, no asterisk. */
export function MarketplaceStrip() {
  return (
    <aside aria-labelledby="marketplace-strip" className="flex flex-col gap-4 rounded-2xl border border-line bg-canvas-sunken px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 id="marketplace-strip" className="text-[15px] font-semibold text-ink">
          {MARKETPLACE_STRIP.title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{MARKETPLACE_STRIP.body}</p>
      </div>
      <LinkButton
        href={ROUTES.register}
        variant="secondary"
        size="md"
        className="shrink-0 whitespace-nowrap"
        data-plan-cta="marketplace"
        data-cta-route="register"
        onClick={() => track('plan_cta_click', { plan: 'marketplace', placement: 'marketplace-strip' })}
      >
        {MARKETPLACE_STRIP.ctaLabel}
      </LinkButton>
    </aside>
  )
}
