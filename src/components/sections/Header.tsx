import { Container } from '../ui/Container'
import { Logo } from '../brand/Logo'
import { PrimaryCta } from '../cta/PrimaryCta'
import { PRODUCT_NAME } from '../../config/site'

/** Simple header: logo, product name, trial button. No navigation or exits. */
export function Header() {
  return (
    <header className="border-b border-line bg-canvas">
      <Container className="flex min-h-[64px] items-center justify-between gap-3 py-3">
        <a href="#top" className="-ml-2 inline-flex min-h-[44px] items-center gap-2.5 rounded-md px-2 btn-focus sm:gap-3" aria-label={`Legiit ${PRODUCT_NAME}, back to top`}>
          <Logo height={28} />
          <span aria-hidden="true" className="h-5 w-px bg-line-strong" />
          <span className="whitespace-nowrap text-[14px] font-medium text-ink sm:text-[15px]">{PRODUCT_NAME}</span>
        </a>
        <PrimaryCta placement="header" className="!px-3 sm:!px-4" />
      </Container>
    </header>
  )
}
