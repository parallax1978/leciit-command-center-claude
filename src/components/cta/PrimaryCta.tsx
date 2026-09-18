import { LinkButton } from '../ui/Button'
import { ArrowRight } from '../ui/Icons'
import { PRIMARY_CTA_LABEL } from '../../config/cta'
import { useCtaHref } from '../../lib/useCtaHref'
import { track } from '../../lib/analytics'

interface PrimaryCtaProps {
  placement: 'header' | 'hero' | 'offer'
  size?: 'md' | 'lg'
  className?: string
}

/** The one commercial CTA. Every instance shares the same label and href. */
export function PrimaryCta({ placement, size = 'lg', className = '' }: PrimaryCtaProps) {
  const href = useCtaHref()
  return (
    <LinkButton href={href} size={size} className={className} data-cta-placement={placement} onClick={() => track('cta_click', { placement })}>
      {PRIMARY_CTA_LABEL}
      <ArrowRight size={18} />
    </LinkButton>
  )
}
