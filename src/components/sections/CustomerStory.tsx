import { Container } from '../ui/Container'
import { CUSTOMER_STORY } from '../../config/story'

/**
 * Renders one real customer story when CUSTOMER_STORY is configured with an
 * approved, attributable account. Otherwise renders nothing at all.
 */
export function CustomerStory() {
  const story = CUSTOMER_STORY
  if (!story || !story.permissionReference.trim()) return null

  return (
    <section aria-labelledby="story-heading" className="border-t border-line py-16 sm:py-20">
      <Container>
        <p className="eyebrow">Customer story</p>
        <h2 id="story-heading" className="h2 mt-3 max-w-3xl">
          {story.businessName}
        </h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">The problem</h3>
            <p className="lead mt-2">{story.problem}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">What they used</h3>
            <p className="lead mt-2">{story.used}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">The result</h3>
            <blockquote className="mt-2">
              <p className="lead">{story.result}</p>
              <footer className="mt-3 text-sm text-ink-muted">
                {story.personName}, {story.role}, {story.businessName}
              </footer>
            </blockquote>
          </div>
        </div>
      </Container>
    </section>
  )
}
