import { Container } from '../ui/Container'
import { Logo } from '../brand/Logo'

export function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Logo height={22} />
        <p className="text-sm text-ink-muted">Command Center is part of the Legiit platform for business owners.</p>
      </Container>
    </footer>
  )
}
