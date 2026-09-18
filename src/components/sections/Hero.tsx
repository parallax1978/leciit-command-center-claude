import { Container } from '../ui/Container'
import { PrimaryCta } from '../cta/PrimaryCta'
import { ProductOverviewVideo } from '../media/ProductOverviewVideo'
import { HERO } from '../../config/copy'
import { OFFER } from '../../config/offer'
import { COMPANY_LINE } from '../../config/site'

const H1_GRADIENT = 'linear-gradient(95deg, #6A13CF 12%, #C71E92 98%)'

/** Centered hero with one trial button, the playable product demo beneath it, then the company line. */
export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="pb-12 pt-12 sm:pb-16 sm:pt-16 lg:pt-20">
      <Container>
        <div className="mx-auto max-w-5xl text-center">
          <p className="eyebrow">{HERO.eyebrow}</p>
          <h1 id="hero-heading" className="mt-4 text-[2.375rem] font-semibold leading-[1.08] tracking-[-0.025em] text-ink sm:text-[2.75rem] lg:text-[3rem] xl:text-[3.25rem]">
            <span className="block">{HERO.h1Line1}</span>
            <span className="block bg-clip-text text-transparent" style={{ backgroundImage: H1_GRADIENT }}>
              {HERO.h1Line2}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl sm:leading-relaxed">{HERO.subhead}</p>
          <div className="mt-8 flex justify-center">
            <PrimaryCta placement="hero" className="w-full sm:w-auto" />
          </div>
          <p className="mt-4 text-[15px] font-medium leading-relaxed text-ink">
            {OFFER.heroTerms}
            <br />
            <span className="font-normal text-ink-soft">{OFFER.heroTermsNote}</span>
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl sm:mt-14">
          <ProductOverviewVideo />
        </div>

        <p className="mx-auto mt-10 max-w-5xl border-t border-line pt-5 text-center text-sm text-ink-muted sm:mt-12">{COMPANY_LINE}</p>
      </Container>
    </section>
  )
}
