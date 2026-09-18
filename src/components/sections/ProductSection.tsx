import { Container } from '../ui/Container'
import { Check } from '../ui/Icons'
import { ProductImage } from '../media/ProductImage'
import type { ProductSectionCopy } from '../../config/copy'

/**
 * One open text-and-image row. Desktop alternates the image left or right;
 * mobile shows the text, then its image.
 */
export function ProductSection({ section }: { section: ProductSectionCopy }) {
  const headingId = `${section.id}-heading`
  const mediaLeft = section.mediaSide === 'left'

  return (
    <section aria-labelledby={headingId} className={`py-16 sm:py-20 lg:py-24 ${section.tinted ? 'bg-brand-tint/50' : 'bg-canvas'}`}>
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className={`max-w-[34rem] ${mediaLeft ? 'lg:col-start-2' : 'lg:col-start-1'} lg:row-start-1`}>
            <p className="eyebrow">{section.label}</p>
            <h2 id={headingId} className="h2 mt-3">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="lead mt-4">
                {paragraph}
              </p>
            ))}
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {section.bullets.map((item) => (
                <li key={item} className="flex items-start gap-3 py-2.5 text-[15px] leading-snug text-ink">
                  <Check size={16} className="mt-0.5 shrink-0 text-brand-purple" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {section.note && <p className="mt-4 text-sm text-ink-muted">{section.note}</p>}
          </div>

          <div className={`${mediaLeft ? 'lg:col-start-1' : 'lg:col-start-2'} lg:row-start-1`}>
            <div className="flex flex-col gap-6">
              {section.media.map((m) => (
                <ProductImage key={m.screen} screen={m.screen} caption={m.caption} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
