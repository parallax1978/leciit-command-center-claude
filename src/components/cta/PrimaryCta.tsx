import { LinkButton } from '../ui/Button'
import { ArrowRight } from '../ui/Icons'
import { CTA_URL, PRIMARY_CTA_LABEL, COMPACT_CTA_LABEL } from '../../config/site'
import { track } from '../../lib/analytics'

interface PrimaryCtaProps {
  placement: 'header' | 'hero' | 'offer' | 'final'
  size?: 'md' | 'lg'
  className?: string
  /** Header only: show the compact label below the sm breakpoint. */
  compactOnMobile?: boolean
}

/** The one commercial CTA treatment. Every instance links to CTA_URL exactly. */
export function PrimaryCta({ placement, size = 'lg', className = '', compactOnMobile = false }: PrimaryCtaProps) {
  return (
    <LinkButton href={CTA_URL} size={size} className={className} data-cta-placement={placement} onClick={() => track('cta_click', { placement })}>
      {compactOnMobile ? (
        <>
          <span className="sm:hidden">{COMPACT_CTA_LABEL}</span>
          <span className="hidden sm:inline">{PRIMARY_CTA_LABEL}</span>
        </>
      ) : (
        PRIMARY_CTA_LABEL
      )}
      <ArrowRight size={18} className={compactOnMobile ? 'hidden sm:block' : ''} />
    </LinkButton>
  )
}
