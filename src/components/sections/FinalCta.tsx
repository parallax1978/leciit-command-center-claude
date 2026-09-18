import { Container } from '../ui/Container'
import { PrimaryCta } from '../cta/PrimaryCta'
import { FINAL_CTA } from '../../config/copy'
import { OFFER } from '../../config/offer'

export function FinalCta() {
  return (
    <section aria-labelledby="final-heading" className="border-t border-line bg-brand-tint/50 py-16 sm:py-20">
      <Container className="text-center">
        <h2 id="final-heading" className="h2 mx-auto max-w-2xl">
          {FINAL_CTA.title}
        </h2>
        <p className="lead mx-auto mt-4 max-w-xl">{FINAL_CTA.body}</p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <PrimaryCta placement="final" className="w-full sm:w-auto" />
          <p className="text-[15px] font-medium text-ink">{OFFER.heroTerms}</p>
        </div>
      </Container>
    </section>
  )
}
