import { Container } from '../ui/Container'
import { Logo } from '../brand/Logo'
import { FOOTER } from '../../config/copy'

/** Minimal footer. Legal links are omitted until their destinations are verified. */
export function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <Container className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Logo height={22} />
        <p className="text-sm text-ink-muted">{FOOTER.line}</p>
      </Container>
    </footer>
  )
}
