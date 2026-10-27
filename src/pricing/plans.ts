/**
 * Verified plan data for the pricing page. Single source of truth for every
 * price, allowance, and route shown on the page.
 *
 * Source: https://legiit.com/api/frontend/pricing/basic-plans and
 * https://legiit.com/api/frontend/pricing/advanced-plans, plus the rendered
 * https://legiit.com/pricing and https://legiit.com/pricing/agency-plan pages,
 * captured 2026-10-27. Feature wording is kept as Legiit publishes it.
 *
 * Unverified terms are deliberately absent: trial card requirement,
 * cancellation, refunds, whether the trial applies to annual billing,
 * add-on pricing on annual plans, the Business plan's add-on cap, and what an
 * AI credit buys.
 */
export type BillingPeriod = 'monthly' | 'yearly'
export type PaidPlanId = 'business_dashboard' | 'agency_dashboard'

/**
 * Billing period selected when the page loads. Monthly puts the real
 * month-to-month price beside the trial. Most competitors default to annual,
 * so test this against 'yearly' on paid conversion (see PRICING.md).
 */
export const DEFAULT_BILLING: BillingPeriod = 'monthly'

export interface Allowances {
  audits: number
  keywords: number
  /** Published label is "Backlink Data"; the unit is not published. */
  backlinkData: number
}

export interface PaidPlan {
  id: PaidPlanId
  /** Name used on the page. */
  name: string
  /** Name Legiit uses in billing and on its current pages. */
  billingName: string
  /** Monthly price in USD when billed monthly. */
  monthlyPrice: number
  /** Price in USD per year when billed annually. */
  yearlyPrice: number
  businessesIncluded: number
  /** USD per month for each business beyond those included. */
  additionalBusinessMonthly: number
  allowances: Allowances
  aiCreditsMonthly: number
  /** Free trial length in days, only where Legiit publishes one. */
  trialDays: number | null
  /** Published feature list, verbatim. */
  publishedFeatures: string[]
}

export const BUSINESS_PLAN: PaidPlan = {
  id: 'business_dashboard',
  name: 'Business',
  billingName: 'Business Dashboard',
  monthlyPrice: 49,
  yearlyPrice: 470.4,
  businessesIncluded: 1,
  additionalBusinessMonthly: 10,
  allowances: { audits: 3, keywords: 5, backlinkData: 25 },
  aiCreditsMonthly: 50000,
  trialDays: 7,
  publishedFeatures: [
    '7 day free trial of the Business Dashboard',
    '1 business included',
    'Full business dashboard access',
    'Support included',
    '2% back in Legiit Bucks on purchases',
    'Can upgrade to Agency Dashboard',
    'Can purchase additional businesses ($10/month each)',
    '3 Audits, 5 Keywords, 25 Backlink Data',
    '50,000 AI Credits Monthly',
  ],
}

export const AGENCY_PLAN: PaidPlan = {
  id: 'agency_dashboard',
  name: 'Agency',
  billingName: 'Agency Dashboard',
  monthlyPrice: 169,
  yearlyPrice: 1622.4,
  businessesIncluded: 20,
  additionalBusinessMonthly: 10,
  allowances: { audits: 25, keywords: 50, backlinkData: 500 },
  aiCreditsMonthly: 50000,
  trialDays: null,
  publishedFeatures: [
    'Up to 20 businesses included',
    'Full business dashboard access',
    'Support included',
    '2% back in Legiit Bucks on purchases',
    'Can downgrade to Business Dashboard',
    'Can purchase additional businesses ($10/month each)',
    '25 Audits, 50 Keywords, 500 Backlink Data',
    '50,000 AI Credits Monthly',
  ],
}

export const PAID_PLANS: PaidPlan[] = [BUSINESS_PLAN, AGENCY_PLAN]

/** The free marketplace account. Not part of Command Center (no dashboard access). */
export const MARKETPLACE_PLAN = {
  id: 'marketplace',
  name: 'Marketplace',
  priceLabel: 'Free',
  /** Legiit's published fee on marketplace sales. */
  saleFeePercent: 15,
  /** Legiit Terms: payments through third-party payment providers "may be subject to a 3% processing fee"; wallet payments are not. */
  processingFeePercent: 3,
  publishedFeatures: ['Buy and sell services', '15% fee per sale', 'No dashboard access', 'No subscription required'],
} as const

/** Legiit Bucks cashback on marketplace purchases, published for both paid plans. */
export const LEGIIT_BUCKS_PERCENT = 2

/**
 * Routes. The trial start is the entry Legiit's own navigation and the
 * landing page use. The subscription route is what Legiit's live Business
 * "Subscribe" button builds for signed-out visitors; the agency variant
 * follows the same pattern (the live agency button drops the plan, a bug).
 */
export const ROUTES = {
  trialStart: 'https://legiit.com/command-center/start',
  register: 'https://legiit.com/register',
  signIn: 'https://legiit.com/sign-in',
  support: 'https://legiit.freshdesk.com/support/home',
  contactEmail: 'mailto:help@legiit.com',
  terms: 'https://legiit.com/terms',
  privacy: 'https://legiit.com/privacy',
} as const

/** Signed-out checkout link: sign in, then return to the plan purchase with the chosen billing period. */
export function subscribeUrl(planId: PaidPlanId, billing: BillingPeriod): string {
  const purchase = `/subscription-purchase?plan=${planId}&billing=${billing}`
  const url = new URL(ROUTES.signIn)
  url.searchParams.set('redirect', purchase)
  return url.toString()
}
