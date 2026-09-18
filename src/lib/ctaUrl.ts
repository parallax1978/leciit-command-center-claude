import { CTA_BASE_URL, PAGE_VARIANT, type PageVariant } from '../config/cta'

/**
 * Builds the commercial destination URL.
 *
 * Rules (see README, section "CTA attribution"):
 * - The origin and path are always CTA_BASE_URL. Incoming input can never change them.
 * - Only utm_source, utm_medium, utm_campaign, utm_content, utm_term pass through,
 *   and only when the value matches CAMPAIGN_SLUG. Everything else is discarded.
 * - cc_variant is always set by this page. An incoming cc_variant is ignored.
 * - UTMs must carry campaign labels, never personal data.
 */
export const ALLOWED_UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
export type AllowedUtmKey = (typeof ALLOWED_UTM_KEYS)[number]

export const CAMPAIGN_SLUG = /^[a-zA-Z0-9._~-]{1,128}$/

export const VARIANT_PARAM = 'cc_variant' as const

export function isCampaignSlug(value: string): boolean {
  return CAMPAIGN_SLUG.test(value)
}

export function pickAttribution(input: string | URLSearchParams | null | undefined): Partial<Record<AllowedUtmKey, string>> {
  const params = input instanceof URLSearchParams ? input : new URLSearchParams(input ?? '')
  const picked: Partial<Record<AllowedUtmKey, string>> = {}
  for (const key of ALLOWED_UTM_KEYS) {
    const value = params.get(key)
    if (value !== null && isCampaignSlug(value)) picked[key] = value
  }
  return picked
}

export function buildCtaUrl(
  input: string | URLSearchParams | null | undefined,
  options: { variant?: PageVariant } = {},
): string {
  const url = new URL(CTA_BASE_URL)
  const attribution = pickAttribution(input)
  for (const key of ALLOWED_UTM_KEYS) {
    const value = attribution[key]
    if (value) url.searchParams.set(key, value)
  }
  url.searchParams.set(VARIANT_PARAM, options.variant ?? PAGE_VARIANT)
  return url.toString()
}
