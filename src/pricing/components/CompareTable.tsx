import { Container } from '../../components/ui/Container'
import { Check, Close } from '../../components/ui/Icons'
import { COMPARE_GROUPS, type CompareValue } from '../content'

function Value({ value }: { value: CompareValue }) {
  if (value === true) {
    return (
      <>
        <Check size={18} className="text-brand-purple" />
        <span className="sr-only">Included</span>
      </>
    )
  }
  if (value === false) {
    return (
      <>
        <Close size={16} className="text-ink-muted" />
        <span className="sr-only">Not included</span>
      </>
    )
  }
  if (typeof value === 'object') {
    return (
      <>
        <span className="block">{value.main}</span>
        <span className="block text-sm text-ink-muted">{value.sub}</span>
      </>
    )
  }
  return <span>{value}</span>
}

/** Full side-by-side comparison. A real table, so screen readers announce row and column headers. */
export function CompareTable() {
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
              <col className="w-[40%] sm:w-[44%]" />
              <col className="w-[30%] sm:w-[28%]" />
              <col className="w-[30%] sm:w-[28%]" />
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
                  <th scope="colgroup" colSpan={3} className="pb-2 pt-8 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    {group.title}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.label} className="border-b border-line align-top">
                    <th scope="row" className="py-3 pr-3 font-normal text-ink-soft">
                      {row.label}
                      {row.note && <span className="mt-0.5 block text-xs text-ink-muted">{row.note}</span>}
                    </th>
                    <td className="py-3 pl-3 text-ink [overflow-wrap:anywhere] sm:pl-4">
                      <Value value={row.business} />
                    </td>
                    <td className="py-3 pl-3 text-ink [overflow-wrap:anywhere] sm:pl-4">
                      <Value value={row.agency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </Container>
    </section>
  )
}
