import { Container } from '../ui/Container'
import { Logo } from '../brand/Logo'
import { FOOTER } from '../../config/copy'

/** Simple footer. Both legal destinations were checked and return 200. */
const LEGAL_LINKS = [
  { label: 'Privacy', href: 'https://legiit.com/privacy' },
  { label: 'Terms', href: 'https://legiit.com/terms' },
] as const

export function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Logo height={22} />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
          <p>{FOOTER.line}</p>
          <nav aria-label="Legal">
            <ul className="flex items-center gap-x-5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="-mx-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md px-2 text-ink-soft underline-offset-4 hover:underline btn-focus">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  )
}
