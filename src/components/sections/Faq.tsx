import { useId, useState } from 'react'
import { Container } from '../ui/Container'
import { Plus } from '../ui/Icons'
import { FAQ_ITEMS } from '../../config/faq'
import { track } from '../../lib/analytics'

export function Faq() {
  const baseId = useId()
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())

  const toggle = (id: string) => {
    const expanded = !openIds.has(id)
    track('faq_toggle', { placement: `faq:${id}`, expanded })
    setOpenIds((current) => {
      const next = new Set(current)
      if (expanded) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <section aria-labelledby="faq-heading" className="border-t border-line py-14 sm:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <h2 id="faq-heading" className="text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[2.125rem]">
            Common questions
          </h2>
          <div className="border-t border-line-strong">
            {FAQ_ITEMS.map((item) => {
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
                      className="flex min-h-[56px] w-full items-center justify-between gap-4 py-4 text-left text-[17px] font-medium text-ink btn-focus rounded-md sm:text-lg"
                    >
                      <span>{item.question}</span>
                      <Plus
                        size={20}
                        className={`shrink-0 text-brand-purple transition-transform motion-reduce:transition-none ${expanded ? 'rotate-45' : ''}`}
                      />
                    </button>
                  </h3>
                  <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded} className="pb-5">
                    {item.answer.map((paragraph) => (
                      <p key={paragraph} className="mt-2 max-w-prose text-[16px] leading-relaxed text-ink-soft first:mt-0">
                        {paragraph}
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
