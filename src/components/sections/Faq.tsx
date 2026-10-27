import { useId, useState } from 'react'
import { Container } from '../ui/Container'
import { Plus } from '../ui/Icons'
import { FAQ_COPY, FAQ_ITEMS, type FaqItem } from '../../config/faq'
import { track } from '../../lib/analytics'

interface FaqProps {
  eyebrow?: string
  title?: string
  items?: FaqItem[]
  /** Id of the section heading, so two FAQ sections on one page never share it. */
  headingId?: string
}

/** Splits a paragraph around each link text so those words render as links. */
function withLinks(paragraph: string, links: FaqItem['links']) {
  if (!links?.length) return paragraph
  const pattern = new RegExp(`(${links.map((l) => l.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`)
  return paragraph.split(pattern).map((part, i) => {
    const link = links.find((l) => l.text === part)
    return link ? (
      <a key={i} href={link.href} className="rounded-sm font-medium text-brand-purple underline decoration-brand-purple/40 underline-offset-4 hover:decoration-brand-purple btn-focus">
        {part}
      </a>
    ) : (
      part
    )
  })
}

/** Accordion FAQ. Defaults to the landing page copy; the pricing page passes its own. */
export function Faq({ eyebrow = FAQ_COPY.eyebrow, title = FAQ_COPY.title, items = FAQ_ITEMS, headingId = 'faq-heading' }: FaqProps = {}) {
  const baseId = useId()
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())

  const toggle = (id: string) => {
    const expanded = !openIds.has(id)
    track('faq_toggle', { id, expanded })
    setOpenIds((current) => {
      const next = new Set(current)
      if (expanded) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <section aria-labelledby={headingId} className="border-t border-line py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id={headingId} className="h2 mt-3">
              {title}
            </h2>
          </div>
          <div className="border-t border-line-strong">
            {items.map((item) => {
              const expanded = openIds.has(item.id)
              const buttonId = `${baseId}-${item.id}-button`
              const panelId = `${baseId}-${item.id}-panel`
              return (
                <div key={item.id} className="border-b border-line">
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => toggle(item.id)}
                      className="flex min-h-[56px] w-full items-center justify-between gap-4 rounded-md py-4 text-left text-[17px] font-medium text-ink btn-focus sm:text-lg"
                    >
                      <span>{item.question}</span>
                      <Plus size={20} className={`shrink-0 text-brand-purple transition-transform motion-reduce:transition-none ${expanded ? 'rotate-45' : ''}`} />
                    </button>
                  </h3>
                  <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded} className="pb-5">
                    {item.answer.map((paragraph) => (
                      <p key={paragraph} className="mt-2 max-w-prose text-[16px] leading-relaxed text-ink-soft first:mt-0">
                        {withLinks(paragraph, item.links)}
                      </p>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}
