import { Container } from '../../components/ui/Container'
import { LinkButton } from '../../components/ui/Button'
import { Check } from '../../components/ui/Icons'
import { AGENCY_CARD, BUSINESS_CARD, COMPARE_GROUPS, type CompareValue } from '../content'
import { ROUTES, subscribeUrl, type BillingPeriod } from '../plans'
import { track } from '../../lib/analytics'
import { breakBeforeUnit } from './breakBeforeUnit'
import { AgencyNote } from './AgencyNote'

function Value({ value }: { value: CompareValue }) {
  if (value === true) {
    return (
      <>
        <Check size={18} className="text-brand-purple" />
        <span className="sr-only">Included</span>
      </>
    )
  }
  if (typeof value === 'object') {
    return (
      <>
        <span className="block">{breakBeforeUnit(value.main)}</span>
        <span className="block text-sm text-ink-muted">{breakBeforeUnit(value.sub)}</span>
      </>
    )
  }
  return <span>{breakBeforeUnit(value)}</span>
}

/** Full side-by-side comparison. A real table, so screen readers announce row and column headers. */
export function CompareTable({ billing }: { billing: BillingPeriod }) {
  return (
    <section aria-labelledby="compare-heading" className="border-t border-line py-16 sm:py-20" id="compare">
      <Container>
        <div className="max-w-2xl">
          <p className="eyebrow">Compare plans</p>
          <h2 id="compare-heading" className="h2 mt-3">
            Business and Agency, side by side.
          </h2>
        </div>
        <div className="mt-10">
          <table className="w-full table-fixed border-collapse text-left text-[15px]">
            <caption className="sr-only">Business and Agency plan comparison</caption>
            <colgroup>
              <col className="w-[34%] sm:w-[44%]" />
              <col className="w-[33%] sm:w-[28%]" />
              <col className="w-[33%] sm:w-[28%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-line-strong">
                <td className="py-3" />
                <th scope="col" className="py-3 pl-3 text-base font-semibold text-ink sm:pl-4 sm:text-lg">
                  Business
                </th>
                <th scope="col" className="py-3 pl-3 text-base font-semibold text-ink sm:pl-4 sm:text-lg">
                  Agency
                </th>
              </tr>
            </thead>
            {COMPARE_GROUPS.map((group) => (
              <tbody key={group.title}>
                <tr>
                  <th scope="rowgroup" colSpan={3} className="pb-2 pt-8 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    {group.title}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.label} className="border-b border-line align-top">
                    <th scope="row" className="py-3 pr-3 font-normal text-ink-soft">
                      {row.label}
                      {row.note && <span className="mt-0.5 block text-xs text-ink-muted">{row.note}</span>}
                    </th>
                    <td className="py-3 pl-3 text-ink sm:pl-4">
                      <Value value={row.business} />
                    </td>
                    <td className="py-3 pl-3 text-ink sm:pl-4">
                      <Value value={row.agency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <LinkButton
            href={ROUTES.trialStart}
            variant="primary"
            size="md"
            className="whitespace-nowrap"
            data-plan-cta="business_dashboard"
            data-cta-route="trial"
            onClick={() => track('plan_cta_click', { plan: 'business_dashboard', billing, placement: 'compare' })}
          >
            {BUSINESS_CARD.ctaLabel}
          </LinkButton>
          <LinkButton
            href={subscribeUrl('agency_dashboard', billing)}
            variant="outline"
            size="md"
            className="whitespace-nowrap"
            data-plan-cta="agency_dashboard"
            data-cta-route="subscribe"
            onClick={() => track('plan_cta_click', { plan: 'agency_dashboard', billing, placement: 'compare' })}
          >
            {AGENCY_CARD.ctaLabel}
          </LinkButton>
        </div>
        <AgencyNote billing={billing} placement="compare" className="mt-3 sm:text-right" />
      </Container>
    </section>
  )
}
