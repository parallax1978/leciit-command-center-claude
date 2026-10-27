import { Container } from '../../components/ui/Container'
import { LinkButton, iconClass, iconSize } from '../../components/ui/Button'
import { ArrowRight } from '../../components/ui/Icons'
import { PER_BUSINESS } from '../content'
import { ROUTES, subscribeUrl, type BillingPeriod } from '../plans'
import { track } from '../../lib/analytics'

/**
 * For agencies and multi-business owners: Agency's price per business and a
 * few common setups, priced from the published monthly rates. The Business
 * add-on cap is not published, so the table never prices more than one
 * additional business on Business.
 */
export function PerBusiness({ billing }: { billing: BillingPeriod }) {
  return (
    <section id="per-business" aria-labelledby="per-business-heading" className="border-t border-line py-16 sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <p className="eyebrow">{PER_BUSINESS.eyebrow}</p>
            <h2 id="per-business-heading" className="h2 mt-3 text-balance">
              {PER_BUSINESS.title}
            </h2>
            <p className="lead mt-4 text-pretty">{PER_BUSINESS.lead}</p>
            <div className="mt-8">
              <LinkButton
                href={subscribeUrl('agency_dashboard', billing)}
                variant="primary"
                size="lg"
                className="w-full whitespace-nowrap sm:w-auto"
                data-plan-cta="agency_dashboard"
                data-cta-route="subscribe"
                onClick={() => track('plan_cta_click', { plan: 'agency_dashboard', billing, placement: 'per-business' })}
              >
                {PER_BUSINESS.ctaLabel}
                <ArrowRight size={iconSize.lg} className={`shrink-0 ${iconClass.lg}`} />
              </LinkButton>
              <p className="mt-3 text-sm text-ink-muted">{PER_BUSINESS.ctaNote}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {PER_BUSINESS.fallbackBefore}
                <a
                  href={ROUTES.trialStart}
                  className="rounded-sm font-medium text-brand-purple underline decoration-brand-purple/40 underline-offset-4 hover:decoration-brand-purple btn-focus"
                  data-alt-plan="business_dashboard"
                  data-cta-route="trial"
                  onClick={() => track('plan_cta_click', { plan: 'business_dashboard', billing, placement: 'per-business-alt' })}
                >
                  {PER_BUSINESS.fallbackLink}
                </a>
                {PER_BUSINESS.fallbackAfter}
              </p>
            </div>
          </div>

          <div>
            <table className="w-full table-fixed border-collapse text-left text-[15px]">
              <caption className="pb-3 text-left text-sm font-semibold text-ink">{PER_BUSINESS.tableCaption}</caption>
              <colgroup>
                <col className="w-[26%] sm:w-[22%]" />
                <col className="w-[40%] sm:w-[42%]" />
                <col className="w-[34%] sm:w-[36%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-line-strong text-sm text-ink-muted">
                  <th scope="col" className="py-3 pr-3 font-semibold">
                    Businesses
                  </th>
                  <th scope="col" className="py-3 pr-3 font-semibold">
                    Plan
                  </th>
                  <th scope="col" className="py-3 font-semibold">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {PER_BUSINESS.rows.map((row) => (
                  <tr key={row.businesses} className="border-b border-line align-top">
                    <th scope="row" className="py-4 pr-3 text-lg font-semibold text-ink">
                      {row.businesses}
                    </th>
                    <td className="py-4 pr-3 text-ink-soft [overflow-wrap:anywhere]">{row.plan}</td>
                    <td className="py-4 font-medium text-ink [overflow-wrap:anywhere]">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-muted">{PER_BUSINESS.tableNote}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}
