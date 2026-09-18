import { Container } from '../ui/Container'
import { PrimaryCta } from '../cta/PrimaryCta'
import { DemoMedia } from '../video/DemoMedia'
import { OFFER } from '../../config/offer'
import { CUSTOMER_EVIDENCE } from '../../config/customerEvidence'

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="pb-14 pt-12 sm:pb-20 sm:pt-16 lg:pt-20">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-4">Legiit Command Center</p>
          <h1 id="hero-heading" className="text-balance text-[2.375rem] font-semibold leading-[1.04] tracking-[-0.025em] text-ink sm:text-[3.25rem] lg:text-[3.875rem]">
            See what AI says about your business.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-ink-soft sm:text-xl">
            Check your visibility in ChatGPT, Gemini, Claude, and Grok. Use what you learn to choose your next marketing task in Command Center.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-5">
            <PrimaryCta placement="hero" className="w-full sm:w-auto" />
            <p className="text-[15px] font-medium text-ink">{OFFER.heroTerms}</p>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-5xl sm:mt-16">
          <DemoMedia />
          {CUSTOMER_EVIDENCE && (
            <blockquote className="mx-auto mt-8 max-w-2xl border-l-2 border-brand-purple pl-5 text-left">
              <p className="text-lg leading-relaxed text-ink">{CUSTOMER_EVIDENCE.quote}</p>
              <footer className="mt-2 text-sm text-ink-muted">{CUSTOMER_EVIDENCE.attribution}</footer>
            </blockquote>
          )}
        </div>
      </Container>
    </section>
  )
}
