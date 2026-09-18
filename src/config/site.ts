/**
 * Site-wide constants. Every commercial CTA links to CTA_URL exactly.
 * The signed-out route asks for account access before business setup, so
 * copy never implies that a click runs an audit.
 */
export const CTA_URL = 'https://dashboard.legiit.com/' as const
export const PRIMARY_CTA_LABEL = 'Start my 7-day free trial' as const
/** Shorter label used only where the full label cannot fit (header on narrow phones). */
export const COMPACT_CTA_LABEL = 'Start free trial' as const
export const PRODUCT_NAME = 'Command Center' as const
/** Legiit company history. Not a claim about Command Center's age or customer outcomes. */
export const COMPANY_LINE = 'From Legiit. Connecting businesses and freelancers since 2018.' as const
