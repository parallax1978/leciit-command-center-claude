/**
 * Single source of truth for the commercial destination and page variant.
 *
 * Every conversion link is built from CTA_BASE_URL by `buildCtaUrl` in
 * src/lib/ctaUrl.ts. The hostname and path never change; only allow-listed
 * campaign parameters and the fixed variant are added.
 */
export const CTA_BASE_URL = 'https://dashboard.legiit.com/' as const

/** A is the existing page, B the Lovable build, C this Claude Code build. */
export type PageVariant = 'B' | 'C'
export const PAGE_VARIANT: PageVariant = 'C'

/** The one label used on every commercial CTA (header, hero, offer). */
export const PRIMARY_CTA_LABEL = 'Start my free trial' as const
