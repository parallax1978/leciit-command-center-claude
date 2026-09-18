import { describe, expect, it } from 'vitest'
import { CTA_URL, PRIMARY_CTA_LABEL } from '../config/site'
import { OFFER } from '../config/offer'
import { HERO, PRODUCT_SECTIONS, WALKTHROUGH, FINAL_CTA } from '../config/copy'
import { FAQ_ITEMS } from '../config/faq'
import { CUSTOMER_STORY } from '../config/story'
import { PRODUCT_OVERVIEW, SCREENS } from '../config/media'

const allCopy = JSON.stringify({ HERO, PRODUCT_SECTIONS, WALKTHROUGH, FINAL_CTA, FAQ_ITEMS, OFFER })

describe('commercial destination', () => {
  it('is exactly the dashboard root', () => {
    expect(CTA_URL).toBe('https://dashboard.legiit.com/')
    expect(PRIMARY_CTA_LABEL).toBe('Start my 7-day free trial')
  })
})

describe('offer terms', () => {
  it('keeps the published allowance labels and the confirmed monthly reset only for AI credits', () => {
    expect(OFFER.allowances).toContain('25 Backlink Data')
    expect(OFFER.allowances).toContain('3 audits')
    expect(OFFER.allowances).toContain('5 keywords')
    expect(OFFER.allowances.filter((a) => /month/i.test(a))).toEqual(['50,000 AI credits per month'])
    expect(OFFER.termsShort).toBe('Then $39/month for one business.')
    expect(OFFER.additionalBusiness).toContain('$10/month')
  })

  it('does not contain unverified terms', () => {
    for (const phrase of ['no credit card', 'cancel anytime', 'refund', 'money back', 'guarantee']) {
      expect(allCopy.toLowerCase()).not.toContain(phrase)
    }
  })
})

describe('copy hygiene', () => {
  it('uses the exact hero copy', () => {
    expect(HERO.headline).toBe('Take control of your marketing, from plan to done.')
    expect(HERO.support).toBe(
      'See where your business stands online, decide what needs attention, and get the work done. Command Center puts marketing tools, Lara AI, and Legiit freelancers in one place.',
    )
  })

  it('has no em dashes or emoji', () => {
    expect(allCopy).not.toMatch(/—/)
    expect(allCopy).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u)
  })

  it('covers the four required product sections in order', () => {
    expect(PRODUCT_SECTIONS.map((s) => s.title)).toEqual([
      'Understand your online position',
      'Know what deserves attention',
      'Get the marketing work done',
      'Keep work and progress connected',
    ])
  })
})

describe('media configuration', () => {
  it('has the MP4 first, a WebM fallback, a poster, and an English caption track', () => {
    expect(PRODUCT_OVERVIEW.sources.map((s) => s.type)).toEqual(['video/mp4', 'video/webm'])
    expect(PRODUCT_OVERVIEW.sources[0]?.src).toMatch(/\.mp4$/)
    expect(PRODUCT_OVERVIEW.poster).toMatch(/\.jpe?g$/)
    expect(PRODUCT_OVERVIEW.captions.some((c) => c.srcLang === 'en' && c.default)).toBe(true)
  })

  it('reserves dimensions and alt text for every screen', () => {
    for (const screen of Object.values(SCREENS)) {
      expect(screen.width).toBeGreaterThan(0)
      expect(screen.height).toBeGreaterThan(0)
      expect(screen.alt.length).toBeGreaterThan(40)
    }
  })

  it('references only configured screens from sections and the walkthrough', () => {
    for (const s of PRODUCT_SECTIONS) for (const m of s.media) expect(SCREENS[m.screen]).toBeDefined()
    for (const c of WALKTHROUGH) if (c.screen) expect(SCREENS[c.screen]).toBeDefined()
  })
})

describe('proof', () => {
  it('ships with no customer story configured', () => {
    expect(CUSTOMER_STORY).toBeNull()
  })
})
