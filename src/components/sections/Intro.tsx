import { Container } from '../ui/Container'
import { INTRO } from '../../config/copy'

/** Short product introduction between the hero and the four product sections. */
export function Intro() {
  return (
    <section aria-labelledby="intro-heading" className="border-t border-line py-14 sm:py-16">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{INTRO.eyebrow}</p>
          <h2 id="intro-heading" className="h2 mt-3">
            {INTRO.title}
          </h2>
          <p className="lead mt-4">{INTRO.body}</p>
        </div>
      </Container>
    </section>
  )
}
