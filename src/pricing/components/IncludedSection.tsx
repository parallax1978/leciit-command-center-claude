import { Container } from '../../components/ui/Container'
import { Check } from '../../components/ui/Icons'
import { INCLUDED_GROUPS } from '../content'

/** What both plans include: the full Command Center, grouped the way the landing page describes it. */
export function IncludedSection() {
  return (
    <section aria-labelledby="included-heading" className="border-t border-line bg-brand-tint/50 py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="eyebrow">Included in both plans</p>
          <h2 id="included-heading" className="h2 mt-3 text-balance">
            The full Command Center, on either plan.
          </h2>
          <p className="lead mt-4 text-pretty">Plans differ by businesses included, allowances, and the free trial. Both include full business dashboard access.</p>
        </div>
        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {INCLUDED_GROUPS.map((group) => (
            <div key={group.title} className="border-t border-line-strong pt-5">
              <h3 className="text-[17px] font-semibold text-ink">{group.title}</h3>
              <ul className="mt-3 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] leading-snug text-ink-soft">
                    <Check size={16} className="mt-0.5 shrink-0 text-brand-purple" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
