import { LinkButton, iconClass, iconSize } from '../ui/Button'
import { ArrowRight } from '../ui/Icons'
import { CTA_URL, HEADER_CTA_LABEL, PRIMARY_CTA_LABEL } from '../../config/site'
import { track } from '../../lib/analytics'

interface PrimaryCtaProps {
  placement: 'header' | 'hero' | 'offer' | 'final'
  className?: string
}

const config = {
  header: { label: HEADER_CTA_LABEL, size: 'md', variant: 'primary', icon: 'hidden sm:block' },
  hero: { label: PRIMARY_CTA_LABEL, size: 'hero', variant: 'primary', icon: '' },
  offer: { label: PRIMARY_CTA_LABEL, size: 'lg', variant: 'inverse', icon: '' },
  final: { label: PRIMARY_CTA_LABEL, size: 'lg', variant: 'primary', icon: '' },
} as const

/**
 * The shared trial button. Every placement links to CTA_URL exactly.
 * Only the hero placement carries the 25% size increase.
 */
export function PrimaryCta({ placement, className = '' }: PrimaryCtaProps) {
  const { label, size, variant, icon } = config[placement]
  return (
    <LinkButton
      href={CTA_URL}
      size={size}
      variant={variant}
      className={`whitespace-nowrap ${placement === 'header' ? 'shrink-0' : ''} ${className}`}
      data-cta-placement={placement}
      onClick={() => track('cta_click', { placement })}
    >
      {label}
      <ArrowRight size={iconSize[size]} className={`shrink-0 ${icon || iconClass[size]}`} />
    </LinkButton>
  )
}
