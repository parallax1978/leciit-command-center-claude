import { Container } from '../ui/Container'
import { Check } from '../ui/Icons'
import { ProductImage } from '../media/ProductImage'
import type { ProductSectionCopy } from '../../config/copy'

/**
 * One open image/text section. Desktop alternates media left or right.
 * Mobile order is heading and explanation, then media, then the list.
 */
export function ProductSection({ section }: { section: ProductSectionCopy }) {
  const headingId = `${section.id}-heading`
  const mediaLeft = section.mediaSide === 'left'
  const cols =
    section.mediaWidth === 'wide'
      ? mediaLeft
        ? 'lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'
        : 'lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]'
      : 'lg:grid-cols-2'
  const copyCol = mediaLeft ? 'lg:col-start-2' : 'lg:col-start-1'
  const mediaCol = mediaLeft ? 'lg:col-start-1' : 'lg:col-start-2'

  return (
    <section aria-labelledby={headingId} className={`py-16 sm:py-20 lg:py-24 ${section.tinted ? 'bg-brand-tint/50' : 'bg-canvas'}`}>
      <Container>
        <div className={`grid gap-8 lg:grid-rows-[auto_auto] lg:gap-x-16 lg:gap-y-8 ${cols}`}>
          <div className={`max-w-[34rem] ${copyCol} lg:row-start-1`}>
            <p className="eyebrow">{section.eyebrow}</p>
            <h2 id={headingId} className="h2 mt-3">
              {section.title}
            </h2>
            <p className="lead mt-4">{section.lead}</p>
            {section.note && <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{section.note}</p>}
          </div>

          <div className={`${mediaCol} lg:row-start-1 lg:row-span-2 lg:self-center`}>
            <div className="flex flex-col gap-6">
              {section.media.map((m) => (
                <ProductImage key={m.screen} screen={m.screen} caption={m.caption} />
              ))}
            </div>
          </div>

          <div className={`max-w-[34rem] ${copyCol} lg:row-start-2`}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{section.listTitle}</h3>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {section.items.map((item) => (
                <li key={item.text} className="flex items-start gap-3 py-2.5 text-[15px] leading-snug text-ink">
                  <Check size={16} className="mt-0.5 shrink-0 text-brand-purple" />
                  <span>
                    {item.lead && <span className="font-semibold">{item.lead} </span>}
                    <span className={item.lead ? 'text-ink-soft' : ''}>{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}
