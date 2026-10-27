import { describe, expect, it } from 'vitest'
import { AGENCY_CARD, BUSINESS_CARD, COMPARE_GROUPS, MARKETPLACE_STRIP, PER_BUSINESS, PRICING_FAQ, PRICING_FINAL, PRICING_HERO } from './content'
import { AGENCY_PLAN, BUSINESS_PLAN } from './plans'

const isInitialCaps = (label: string) =>
  label
    .split(/\s+/)
    .filter((w) => /[A-Za-z]/.test(w))
    .every((w) => /^[^A-Za-z]*[A-Z0-9]/.test(w))

const sentences = (p: string) => p.split(/(?<=[.!?])\s+/).filter(Boolean)

const paragraphs = [
  `${PRICING_HERO.subheadBefore}${PRICING_HERO.subheadLink}${PRICING_HERO.subheadAfter}`,
  BUSINESS_CARD.ctaNote,
  AGENCY_CARD.ctaNote,
  `${AGENCY_CARD.altRoute.before}${AGENCY_CARD.altRoute.linkLabel}${AGENCY_CARD.altRoute.after}`,
  MARKETPLACE_STRIP.body,
  PER_BUSINESS.lead,
  PER_BUSINESS.tableNote,
  PRICING_FINAL.body,
  ...PRICING_FAQ.flatMap((item) => item.answer),
]
const allCopy = JSON.stringify({ PRICING_HERO, BUSINESS_CARD, AGENCY_CARD, MARKETPLACE_STRIP, PER_BUSINESS, COMPARE_GROUPS, PRICING_FAQ, PRICING_FINAL })

describe('pricing copy rules', () => {
  it('uses Initial Caps for the H1, every button label, and every FAQ question', () => {
    expect(`${PRICING_HERO.h1Line1} ${PRICING_HERO.h1Line2}`).toBe('Try Command Center Free For 7 Days')
    for (const label of [PRICING_HERO.h1Line1, PRICING_HERO.h1Line2, BUSINESS_CARD.ctaLabel, AGENCY_CARD.ctaLabel, MARKETPLACE_STRIP.ctaLabel, PER_BUSINESS.ctaLabel]) {
      expect(isInitialCaps(label), label).toBe(true)
    }
    for (const item of PRICING_FAQ) expect(isInitialCaps(item.question), item.question).toBe(true)
  })

  it('keeps every paragraph to two sentences or fewer', () => {
    for (const p of paragraphs) expect(sentences(p).length, p).toBeLessThanOrEqual(2)
  })

  it('has no em dashes, popularity labels, rounded $39, or unverified terms', () => {
    expect(allCopy).not.toMatch(/—/)
    expect(allCopy).not.toMatch(/popular/i)
    expect(allCopy).not.toMatch(/\$39(?!\.20)/)
    expect(allCopy).not.toMatch(/unlimited|guarantee|refund|cancel|no credit card|money back/i)
    expect(allCopy).toContain('25 Backlink Data')
    expect(allCopy).toContain('purchased separately')
  })

  it('gives each FAQ question a unique id', () => {
    const ids = PRICING_FAQ.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('plan cards', () => {
  it('list the same kinds of rows in the same order on both plans', () => {
    expect(BUSINESS_CARD.points).toEqual([
      '1 business included',
      'Full business dashboard access',
      '50,000 AI credits each month',
      '3 Audits, 5 Keywords, 25 Backlink Data',
      'Additional businesses at $10/month each',
      'Support included',
    ])
    expect(AGENCY_CARD.points).toEqual([
      'Up to 20 businesses included',
      'Full business dashboard access',
      '50,000 AI credits each month',
      '25 Audits, 50 Keywords, 500 Backlink Data',
      'Businesses beyond 20 at $10/month each',
      'Support included',
    ])
  })

  it('route Business to the trial and Agency to checkout, each with an alternate route', () => {
    expect(BUSINESS_PLAN.trialDays).toBe(7)
    expect(AGENCY_PLAN.trialDays).toBeNull()
    expect(BUSINESS_CARD.altRoute.route).toBe('subscribe')
    expect(AGENCY_CARD.altRoute.route).toBe('trial')
    expect(BUSINESS_CARD.anchorId).toBe('business')
    expect(AGENCY_CARD.anchorId).toBe('agency')
  })
})

describe('common setups', () => {
  it('price each setup from the published monthly rates', () => {
    expect(PER_BUSINESS.rows).toEqual([
      { businesses: '1', plan: 'Business', price: '$49/month' },
      { businesses: '2', plan: 'Business plus 1 additional business', price: '$59/month' },
      { businesses: 'Up to 20', plan: 'Agency', price: '$169/month' },
      { businesses: '21', plan: 'Agency plus 1 additional business', price: '$179/month' },
    ])
    expect(PER_BUSINESS.lead).toContain('$169/month billed monthly, which is $8.45 per business with all 20 in use')
    expect(PER_BUSINESS.tableNote).toBe('Annual billing takes 20% off the plan price: $135.20/month for Agency, billed at $1,622.40 a year.')
  })
})

describe('comparison table', () => {
  it('shows both billing periods with exact yearly totals', () => {
    const price = COMPARE_GROUPS.find((g) => g.title === 'Price')!
    const annual = price.rows.find((r) => r.label === 'Billed annually')!
    expect(annual.business).toEqual({ main: '$470.40/year', sub: '$39.20/month' })
    expect(annual.agency).toEqual({ main: '$1,622.40/year', sub: '$135.20/month' })
    const saving = price.rows.find((r) => r.label === 'Annual saving')!
    expect([saving.business, saving.agency]).toEqual(['$117.60/year', '$405.60/year'])
  })
})
