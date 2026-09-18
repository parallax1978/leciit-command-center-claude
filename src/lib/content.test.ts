import { describe, expect, it } from 'vitest'
import { CTA_URL, HEADER_CTA_LABEL, PRIMARY_CTA_LABEL } from '../config/site'
import { OFFER } from '../config/offer'
import { HERO, INTRO, PRODUCT_SECTIONS, WALKTHROUGH, FINAL_CTA } from '../config/copy'
import { FAQ_ITEMS, FAQ_COPY } from '../config/faq'
import { CUSTOMER_STORY } from '../config/story'
import { PRODUCT_OVERVIEW, SCREENS } from '../config/media'

const allCopy = JSON.stringify({ HERO, INTRO, PRODUCT_SECTIONS, WALKTHROUGH, FINAL_CTA, FAQ_ITEMS, FAQ_COPY, OFFER })

const isInitialCaps = (label: string) =>
  label
    .split(/\s+/)
    .filter((w) => /[A-Za-z]/.test(w))
    .every((w) => /^[^A-Za-z]*[A-Z0-9]/.test(w))

describe('trial destination and labels', () => {
  it('links every trial button to the start page with no parameters', () => {
    expect(CTA_URL).toBe('https://legiit.com/command-center/start')
  })
  it('uses Initial Caps button labels', () => {
    expect(PRIMARY_CTA_LABEL).toBe('Start My 7-Day Free Trial')
    expect(HEADER_CTA_LABEL).toBe('Start Free Trial')
    expect(isInitialCaps(OFFER.allowancesControl)).toBe(true)
    for (const item of FAQ_ITEMS) expect(isInitialCaps(item.question), item.question).toBe(true)
    for (const c of WALKTHROUGH) expect(isInitialCaps(c.title), c.title).toBe(true)
  })
})

describe('hero and intro copy', () => {
  it('matches the exact H1 and the 13-word subhead', () => {
    expect(HERO.h1Line1).toBe('Run Your Business.')
    expect(HERO.h1Line2).toBe('Without Doing Everything Yourself.')
    expect(HERO.subhead).toBe('AI tools and expert freelancers to help you plan, create, delegate, and grow.')
    expect(HERO.subhead.split(/\s+/)).toHaveLength(13)
    expect(HERO.eyebrow).toBe('Your AI Powered Business Command Center')
    expect(INTRO.title).toBe('One place to move your business forward.')
  })
})

describe('product sections', () => {
  it('are the four sections in the required order with two paragraphs each', () => {
    expect(PRODUCT_SECTIONS.map((s) => s.title)).toEqual([
      'Put AI to work on your business.',
      'Get found on Google and in AI answers.',
      'Create the content and visuals your business needs.',
      'Bring in expert help when you need it.',
    ])
    expect(PRODUCT_SECTIONS.map((s) => s.label)).toEqual(['01 · Put AI to work', '02 · Grow your visibility', '03 · Create what you need', '04 · Get expert help'])
    for (const s of PRODUCT_SECTIONS) {
      expect(s.paragraphs).toHaveLength(2)
      expect(s.bullets).toHaveLength(3)
      for (const p of s.paragraphs) expect(p.split(/(?<=[.!?])\s+/).length, p).toBeLessThanOrEqual(2)
    }
    expect(PRODUCT_SECTIONS[3]?.note).toBe('Freelance services are purchased separately.')
  })
})

describe('offer terms', () => {
  it('keeps the published allowance labels and the confirmed monthly reset only for AI credits', () => {
    expect(OFFER.allowancesText).toBe('3 audits · 5 keywords · 25 Backlink Data · 50,000 monthly AI credits · 2% back in Legiit Bucks on purchases.')
    expect(OFFER.heroTerms).toBe('7 days free. Then $39/month for one business.')
    expect(OFFER.priceLabel).toBe('$39 / month after your trial')
    expect(OFFER.additionalBusiness).toContain('$10/month')
    expect(OFFER.benefits).toHaveLength(4)
  })

  it('does not contain unverified or prohibited claims', () => {
    for (const phrase of ['no credit card', 'cancel anytime', 'refund', 'money back', 'guarantee', 'unlimited', 'automatically publish']) {
      expect(allCopy.toLowerCase(), phrase).not.toContain(phrase)
    }
  })
})

describe('copy hygiene', () => {
  it('has no em dashes or emoji', () => {
    expect(allCopy).not.toMatch(/—/)
    expect(allCopy).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u)
  })
  it('has seven FAQs with the exact first question', () => {
    expect(FAQ_ITEMS).toHaveLength(7)
    expect(FAQ_ITEMS[0]?.question).toBe('What Can I Actually Create In Command Center?')
    expect(FAQ_COPY.title).toBe('Before you start.')
  })
})

describe('media configuration', () => {
  it('has the MP4 first, a WebM fallback, a poster, and an English caption track', () => {
    expect(PRODUCT_OVERVIEW.sources.map((s) => s.type)).toEqual(['video/mp4', 'video/webm'])
    expect(PRODUCT_OVERVIEW.sources[0]?.src).toMatch(/\.mp4$/)
    expect(PRODUCT_OVERVIEW.poster).toMatch(/\.jpe?g$/)
    expect(PRODUCT_OVERVIEW.captions.some((c) => c.srcLang === 'en' && c.default)).toBe(true)
  })

  it('references only configured screens with alt text and dimensions', () => {
    for (const screen of Object.values(SCREENS)) {
      expect(screen.width).toBeGreaterThan(0)
      expect(screen.alt.length).toBeGreaterThan(40)
    }
    for (const s of PRODUCT_SECTIONS) for (const m of s.media) expect(SCREENS[m.screen]).toBeDefined()
    for (const c of WALKTHROUGH) if (c.screen) expect(SCREENS[c.screen]).toBeDefined()
  })
})

describe('proof', () => {
  it('ships with no customer story configured', () => {
    expect(CUSTOMER_STORY).toBeNull()
  })
})
