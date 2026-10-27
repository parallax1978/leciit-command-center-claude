import { describe, expect, it } from 'vitest'
import { AGENCY_PLAN, BUSINESS_PLAN, LEGIIT_BUCKS_PERCENT, MARKETPLACE_PLAN, subscribeUrl } from './plans'
import { annualDiscountPercent, annualSavings, formatCount, formatUsd, monthlyEquivalent, perIncludedBusiness, yearlyCost } from './price'

describe('verified plan data', () => {
  it('matches the Legiit pricing API captured 2026-10-27', () => {
    expect([BUSINESS_PLAN.monthlyPrice, BUSINESS_PLAN.yearlyPrice]).toEqual([49, 470.4])
    expect([AGENCY_PLAN.monthlyPrice, AGENCY_PLAN.yearlyPrice]).toEqual([169, 1622.4])
    expect(BUSINESS_PLAN.allowances).toEqual({ audits: 3, keywords: 5, backlinkData: 25 })
    expect(AGENCY_PLAN.allowances).toEqual({ audits: 25, keywords: 50, backlinkData: 500 })
    expect([BUSINESS_PLAN.businessesIncluded, AGENCY_PLAN.businessesIncluded]).toEqual([1, 20])
    expect([BUSINESS_PLAN.aiCreditsMonthly, AGENCY_PLAN.aiCreditsMonthly]).toEqual([50000, 50000])
    expect([BUSINESS_PLAN.trialDays, AGENCY_PLAN.trialDays]).toEqual([7, null])
    expect(MARKETPLACE_PLAN.saleFeePercent).toBe(15)
    expect(MARKETPLACE_PLAN.processingFeePercent).toBe(3)
    expect(MARKETPLACE_PLAN.publishedFeatures).toContain('15% fee per sale')
    expect(LEGIIT_BUCKS_PERCENT).toBe(2)
    for (const plan of [BUSINESS_PLAN, AGENCY_PLAN]) expect(plan.publishedFeatures).toContain('2% back in Legiit Bucks on purchases')
  })

  it('keeps the published allowance label exactly', () => {
    expect(BUSINESS_PLAN.publishedFeatures).toContain('3 Audits, 5 Keywords, 25 Backlink Data')
    expect(AGENCY_PLAN.publishedFeatures).toContain('25 Audits, 50 Keywords, 500 Backlink Data')
  })
})

describe('price math', () => {
  it('derives the annual-billed monthly equivalents exactly', () => {
    expect(monthlyEquivalent(BUSINESS_PLAN, 'yearly')).toBe(39.2)
    expect(monthlyEquivalent(AGENCY_PLAN, 'yearly')).toBe(135.2)
    expect(monthlyEquivalent(BUSINESS_PLAN, 'monthly')).toBe(49)
    expect(monthlyEquivalent(AGENCY_PLAN, 'monthly')).toBe(169)
  })

  it('computes yearly cost, savings, and the 20% discount', () => {
    expect(yearlyCost(BUSINESS_PLAN, 'monthly')).toBe(588)
    expect(yearlyCost(AGENCY_PLAN, 'monthly')).toBe(2028)
    expect(annualSavings(BUSINESS_PLAN)).toBe(117.6)
    expect(annualSavings(AGENCY_PLAN)).toBe(405.6)
    expect(annualDiscountPercent(BUSINESS_PLAN)).toBe(20)
    expect(annualDiscountPercent(AGENCY_PLAN)).toBe(20)
  })

  it('computes the agency cost per included business', () => {
    expect(perIncludedBusiness(AGENCY_PLAN, 'monthly')).toBe(8.45)
    expect(perIncludedBusiness(AGENCY_PLAN, 'yearly')).toBe(6.76)
  })

  it('formats prices with cents only when needed', () => {
    expect(formatUsd(49)).toBe('$49')
    expect(formatUsd(39.2)).toBe('$39.20')
    expect(formatUsd(135.2)).toBe('$135.20')
    expect(formatUsd(1622.4)).toBe('$1,622.40')
    expect(formatUsd(470.4)).toBe('$470.40')
    expect(formatUsd(117.6)).toBe('$117.60')
    expect(formatCount(50000)).toBe('50,000')
  })
})

describe('checkout links', () => {
  it('builds the signed-out subscribe link Legiit uses, with the chosen billing period', () => {
    expect(subscribeUrl('business_dashboard', 'yearly')).toBe(
      'https://legiit.com/sign-in?redirect=%2Fsubscription-purchase%3Fplan%3Dbusiness_dashboard%26billing%3Dyearly',
    )
    expect(subscribeUrl('agency_dashboard', 'monthly')).toBe(
      'https://legiit.com/sign-in?redirect=%2Fsubscription-purchase%3Fplan%3Dagency_dashboard%26billing%3Dmonthly',
    )
  })
})
