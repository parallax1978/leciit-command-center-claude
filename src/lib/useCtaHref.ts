import { useMemo } from 'react'
import { buildCtaUrl } from './ctaUrl'

/**
 * Builds the CTA href once from the page's own query string. The result is
 * identical for every CTA on the page, so attribution stays consistent.
 */
export function useCtaHref(): string {
  return useMemo(() => buildCtaUrl(typeof window === 'undefined' ? '' : window.location.search), [])
}
