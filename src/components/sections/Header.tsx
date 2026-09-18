import { Container } from '../ui/Container'
import { Logo } from '../brand/Logo'
import { PrimaryCta } from '../cta/PrimaryCta'

export function Header() {
  return (
    <header className="border-b border-line bg-canvas">
      <Container className="flex min-h-[64px] items-center justify-between gap-4 py-3">
        <a href="#top" className="-ml-2 inline-flex min-h-[44px] items-center rounded-md px-2 btn-focus" aria-label="Legiit, back to top">
          <Logo height={34} />
        </a>
        <PrimaryCta placement="header" size="md" />
      </Container>
    </header>
  )
}
