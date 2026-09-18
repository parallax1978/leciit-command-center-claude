import { useRef } from 'react'
import { Container } from '../ui/Container'
import { Button } from '../ui/Button'
import { Play } from '../ui/Icons'
import { PrimaryCta } from '../cta/PrimaryCta'
import { ProductOverviewVideo } from '../media/ProductOverviewVideo'
import { HERO } from '../../config/copy'
import { OFFER } from '../../config/offer'
import { COMPANY_LINE } from '../../config/site'

/** Split hero: message, offer, and CTA beside the actual product overview. */
export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)

  const watch = () => {
    const video = videoRef.current
    const target = video ?? document.getElementById('product-overview')
    target?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' })
    if (video) {
      video.focus({ preventScroll: true })
      void video.play().catch(() => {
        /* The visitor can use the native controls. */
      })
    }
  }

  return (
    <section aria-labelledby="hero-heading" className="pb-12 pt-10 sm:pb-16 sm:pt-14 lg:pt-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          <div className="max-w-[34rem]">
            <h1 id="hero-heading" className="text-balance text-[2.125rem] font-semibold leading-[1.08] tracking-[-0.025em] text-ink sm:text-[2.5rem] lg:text-[2.75rem]">
              {HERO.headline}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl sm:leading-relaxed">{HERO.support}</p>
            <div className="mt-8">
              <PrimaryCta placement="hero" className="w-full sm:w-auto" />
              <p className="mt-3 text-[15px] font-medium text-ink">{OFFER.termsShort}</p>
            </div>
            <Button variant="ghost" size="md" onClick={watch} className="-ml-3 mt-4 text-ink-soft">
              <Play size={14} className="text-brand-purple" />
              {HERO.secondaryAction}
            </Button>
          </div>

          <ProductOverviewVideo ref={videoRef} />
        </div>

        <p className="mt-10 border-t border-line pt-5 text-sm text-ink-muted sm:mt-14">{COMPANY_LINE}</p>
      </Container>
    </section>
  )
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
