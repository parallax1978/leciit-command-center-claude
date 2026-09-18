import { describe, expect, it } from 'vitest'
import { buildCtaUrl, pickAttribution } from './ctaUrl'
import { CTA_BASE_URL } from '../config/cta'

const origin = new URL(CTA_BASE_URL)

function parsed(href: string) {
  const u = new URL(href)
  return { host: u.host, pathname: u.pathname, params: Object.fromEntries(u.searchParams.entries()) }
}

describe('buildCtaUrl', () => {
  it('returns the fixed destination with only the variant when there is no attribution input', () => {
    const result = parsed(buildCtaUrl(''))
    expect(result.host).toBe(origin.host)
    expect(result.pathname).toBe('/')
    expect(result.params).toEqual({ cc_variant: 'C' })
    expect(buildCtaUrl(undefined)).toBe('https://dashboard.legiit.com/?cc_variant=C')
    expect(buildCtaUrl(null)).toBe('https://dashboard.legiit.com/?cc_variant=C')
  })

  it('passes through valid campaign UTMs', () => {
    const result = parsed(
      buildCtaUrl('?utm_source=meta&utm_medium=paid_social&utm_campaign=cc-ai-visibility_2026.q3&utm_content=video-v1&utm_term=water~heater'),
    )
    expect(result.params).toEqual({
      utm_source: 'meta',
      utm_medium: 'paid_social',
      utm_campaign: 'cc-ai-visibility_2026.q3',
      utm_content: 'video-v1',
      utm_term: 'water~heater',
      cc_variant: 'C',
    })
  })

  it('discards unsupported parameters, including anything that looks personal', () => {
    const result = parsed(
      buildCtaUrl('?utm_source=meta&email=owner%40example.com&fbclid=abc123&phone=5551234&name=Pat&site=https%3A%2F%2Fexample.com&token=xyz&account_id=42'),
    )
    expect(result.params).toEqual({ utm_source: 'meta', cc_variant: 'C' })
  })

  it('rejects malformed values instead of sanitizing them', () => {
    const tooLong = 'a'.repeat(129)
    const result = parsed(
      buildCtaUrl(`?utm_source=meta%20ads&utm_medium=%3Cscript%3E&utm_campaign=${tooLong}&utm_content=&utm_term=ok-term`),
    )
    expect(result.params).toEqual({ utm_term: 'ok-term', cc_variant: 'C' })
  })

  it('accepts exactly 128 characters and rejects unicode', () => {
    const max = 'b'.repeat(128)
    expect(pickAttribution(`utm_campaign=${max}`)).toEqual({ utm_campaign: max })
    expect(pickAttribution('utm_campaign=caf%C3%A9')).toEqual({})
  })

  it('never lets incoming input override the destination or the variant', () => {
    const result = parsed(
      buildCtaUrl('?cc_variant=A&utm_source=meta&redirect=https%3A%2F%2Fevil.example&host=evil.example&path=%2Fadmin'),
    )
    expect(result.host).toBe(origin.host)
    expect(result.pathname).toBe('/')
    expect(result.params).toEqual({ utm_source: 'meta', cc_variant: 'C' })
  })

  it('keeps the destination fixed even when values contain URL-like text', () => {
    const href = buildCtaUrl('?utm_source=%2F%2Fevil.example%2F')
    expect(href.startsWith('https://dashboard.legiit.com/?')).toBe(true)
    expect(parsed(href).params).toEqual({ cc_variant: 'C' })
  })

  it('accepts URLSearchParams input and repeated keys use the first value only', () => {
    const params = new URLSearchParams('utm_source=first&utm_source=second')
    expect(parsed(buildCtaUrl(params)).params).toEqual({ utm_source: 'first', cc_variant: 'C' })
  })

  it('lets the page choose the variant explicitly but never from input', () => {
    expect(parsed(buildCtaUrl('?cc_variant=C', { variant: 'B' })).params).toEqual({ cc_variant: 'B' })
  })
})
