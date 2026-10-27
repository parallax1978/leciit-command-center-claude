import type { BillingPeriod, PaidPlan } from './plans'

/** Round to cents without floating-point drift. */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

/** "$49", "$39.20", "$1,622.40": cents only when the amount is not a whole dollar. */
export function formatUsd(amount: number): string {
  const cents = toCents(amount)
  const whole = cents % 100 === 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100)
}

/** Effective monthly price for the chosen billing period. */
export function monthlyEquivalent(plan: PaidPlan, billing: BillingPeriod): number {
  return billing === 'monthly' ? plan.monthlyPrice : toCents(plan.yearlyPrice / 12) / 100
}

/** What a year costs on each billing period. */
export function yearlyCost(plan: PaidPlan, billing: BillingPeriod): number {
  return billing === 'monthly' ? toCents(plan.monthlyPrice * 12) / 100 : plan.yearlyPrice
}

/** Dollars saved per year by paying annually. */
export function annualSavings(plan: PaidPlan): number {
  return (toCents(plan.monthlyPrice * 12) - toCents(plan.yearlyPrice)) / 100
}

/** Whole-number annual discount, e.g. 20. */
export function annualDiscountPercent(plan: PaidPlan): number {
  return Math.round((annualSavings(plan) / (plan.monthlyPrice * 12)) * 100)
}

/** Monthly cost per included business, e.g. Agency $8.45 monthly or $6.76 billed annually. */
export function perIncludedBusiness(plan: PaidPlan, billing: BillingPeriod): number {
  return toCents(monthlyEquivalent(plan, billing) / plan.businessesIncluded) / 100
}

/** Whole number with thousands separators: 50000 -> "50,000". */
export function formatCount(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}
