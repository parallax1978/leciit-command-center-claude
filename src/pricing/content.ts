import { AGENCY_PLAN, BUSINESS_PLAN, LEGIIT_BUCKS_PERCENT, MARKETPLACE_PLAN, type PaidPlan } from './plans'
import { annualDiscountPercent, annualSavings, formatCount, formatUsd, monthlyEquivalent, perIncludedBusiness, yearlyCost } from './price'
import type { FaqItem } from '../config/faq'

/**
 * Customer-facing copy for the pricing page. Every statement traces to the
 * verified plan data in ./plans or to the product facts the landing page uses.
 * Writing rules: no em dashes or emojis, at most two sentences per paragraph,
 * Initial Caps on the H1 and every button label, sentence case elsewhere.
 */
export const PRICING_HERO = {
  eyebrow: 'Command Center pricing',
  h1Line1: 'Try Command Center',
  h1Line2: `Free For ${BUSINESS_PLAN.trialDays} Days`,
  /** Rendered as one sentence; the link text jumps to the Agency card. */
  subheadBefore: 'Start free on the Business plan, or ',
  subheadLink: 'choose Agency',
  subheadAfter: ` to manage up to ${AGENCY_PLAN.businessesIncluded} businesses.`,
} as const

/** Where a plan link goes: the trial start, the sign-in checkout for a plan, or marketplace registration. */
export type CtaRoute = 'trial' | 'subscribe' | 'register'

export interface PlanCardCopy {
  plan: PaidPlan
  /** Anchor id, so old links such as /pricing/agency-plan can redirect to /pricing#agency. */
  anchorId: string
  persona: string
  /** The same rows in the same order on both cards, so they compare line by line. */
  points: string[]
  ctaLabel: string
  /** One short line under the button. */
  ctaNote: string
  /** A quieter second route under the button, written as a sentence with one link. */
  altRoute: { before: string; linkLabel: string; after: string; route: CtaRoute }
}

const allowanceLine = (plan: PaidPlan) => `${plan.allowances.audits} Audits, ${plan.allowances.keywords} Keywords, ${plan.allowances.backlinkData} Backlink Data`

export const BUSINESS_CARD: PlanCardCopy = {
  plan: BUSINESS_PLAN,
  anchorId: 'business',
  persona: 'For owners running one business',
  points: [
    '1 business included',
    'Full business dashboard access',
    `${formatCount(BUSINESS_PLAN.aiCreditsMonthly)} AI credits each month`,
    allowanceLine(BUSINESS_PLAN),
    `Additional businesses at ${formatUsd(BUSINESS_PLAN.additionalBusinessMonthly)}/month each`,
    'Support included',
  ],
  ctaLabel: 'Start My 7-Day Free Trial',
  ctaNote: 'Begin with your website and email.',
  altRoute: { before: 'Already used your trial? ', linkLabel: 'Subscribe to Business', after: '.', route: 'subscribe' },
}

export const AGENCY_CARD: PlanCardCopy = {
  plan: AGENCY_PLAN,
  anchorId: 'agency',
  persona: 'For agencies and owners running several businesses',
  points: [
    `Up to ${AGENCY_PLAN.businessesIncluded} businesses included`,
    'Full business dashboard access',
    `${formatCount(AGENCY_PLAN.aiCreditsMonthly)} AI credits each month`,
    allowanceLine(AGENCY_PLAN),
    `Businesses beyond ${AGENCY_PLAN.businessesIncluded} at ${formatUsd(AGENCY_PLAN.additionalBusinessMonthly)}/month each`,
    'Support included',
  ],
  ctaLabel: 'Choose Agency',
  ctaNote: 'Log in to your Legiit account to check out.',
  altRoute: { before: 'New to Legiit? ', linkLabel: 'Try Business free for 7 days', after: ', then upgrade to Agency.', route: 'trial' },
}

export const MARKETPLACE_STRIP = {
  title: 'Only buying or selling services?',
  body: `A Legiit marketplace account is free to join, with no subscription and no dashboard access. Sellers pay a ${MARKETPLACE_PLAN.saleFeePercent}% fee per sale, and payments through third-party providers may carry a ${MARKETPLACE_PLAN.processingFeePercent}% processing fee.`,
  ctaLabel: 'Create A Free Account',
} as const

/** Representative setups priced from the published monthly rates (NN/g: show common cases and their prices). */
export interface SetupRow {
  businesses: string
  plan: string
  price: string
}

const extra = BUSINESS_PLAN.additionalBusinessMonthly

export const PER_BUSINESS = {
  eyebrow: 'Managing more than one business?',
  title: `One plan for up to ${AGENCY_PLAN.businessesIncluded} businesses.`,
  lead: `Agency includes up to ${AGENCY_PLAN.businessesIncluded} businesses for ${formatUsd(AGENCY_PLAN.monthlyPrice)}/month billed monthly, which is ${formatUsd(perIncludedBusiness(AGENCY_PLAN, 'monthly'))} per business with all ${AGENCY_PLAN.businessesIncluded} in use. Each additional business is ${formatUsd(extra)}/month on either plan.`,
  tableCaption: 'Common setups on monthly billing',
  rows: [
    { businesses: '1', plan: 'Business', price: `${formatUsd(BUSINESS_PLAN.monthlyPrice)}/month` },
    { businesses: '2', plan: 'Business plus 1 additional business', price: `${formatUsd(BUSINESS_PLAN.monthlyPrice + extra)}/month` },
    { businesses: `Up to ${AGENCY_PLAN.businessesIncluded}`, plan: 'Agency', price: `${formatUsd(AGENCY_PLAN.monthlyPrice)}/month` },
    { businesses: String(AGENCY_PLAN.businessesIncluded + 1), plan: 'Agency plus 1 additional business', price: `${formatUsd(AGENCY_PLAN.monthlyPrice + AGENCY_PLAN.additionalBusinessMonthly)}/month` },
  ] satisfies SetupRow[],
  tableNote: `Annual billing takes ${annualDiscountPercent(AGENCY_PLAN)}% off the plan price: ${formatUsd(monthlyEquivalent(AGENCY_PLAN, 'yearly'))}/month for Agency, billed at ${formatUsd(yearlyCost(AGENCY_PLAN, 'yearly'))} a year.`,
  ctaLabel: AGENCY_CARD.ctaLabel,
  ctaNote: AGENCY_CARD.ctaNote,
  fallbackBefore: 'Prefer to try it first? ',
  fallbackLink: 'Start with the 7-day Business trial',
  fallbackAfter: ' and upgrade as you add businesses.',
} as const

/** What both plans include, from the product facts the landing page uses. */
export const INCLUDED_GROUPS = [
  {
    title: 'Put AI to work',
    items: ['Editable business context built from your website', 'Lara assistance and “Do This Next” recommendations', 'Strategy, experiments, AI advisors, and AI focus groups'],
  },
  {
    title: 'Grow your visibility',
    items: ['Research keywords and customer questions', 'Generate direct answers and content starters', 'Find sources and placement opportunities'],
  },
  {
    title: 'Create what you need',
    items: ['Articles, blog and landing-page starters, and briefs', 'Customer answers and social captions', 'Brand guides, image creation, and your image gallery'],
  },
  {
    title: 'Get expert help',
    items: ['Find specialists for the work your business needs', 'Freelance services purchased separately', 'Follow tasks, orders, and performance in one place'],
  },
] as const

/** A cell value: text, a two-line value, or a yes/no mark. */
export type CompareValue = string | boolean | { main: string; sub: string }

export interface CompareRow {
  label: string
  business: CompareValue
  agency: CompareValue
  note?: string
}

export interface CompareGroup {
  title: string
  rows: CompareRow[]
}

const billedYearly = (plan: PaidPlan) => ({ main: `${formatUsd(yearlyCost(plan, 'yearly'))}/year`, sub: `${formatUsd(monthlyEquivalent(plan, 'yearly'))}/month` })
const perBusiness = (plan: PaidPlan) => ({
  main: `${formatUsd(perIncludedBusiness(plan, 'monthly'))}/month`,
  sub: `${formatUsd(perIncludedBusiness(plan, 'yearly'))}/month billed annually`,
})

export const COMPARE_GROUPS: CompareGroup[] = [
  {
    title: 'Price',
    rows: [
      { label: 'Billed monthly', business: `${formatUsd(BUSINESS_PLAN.monthlyPrice)}/month`, agency: `${formatUsd(AGENCY_PLAN.monthlyPrice)}/month` },
      { label: 'Billed annually', business: billedYearly(BUSINESS_PLAN), agency: billedYearly(AGENCY_PLAN) },
      { label: 'Annual saving', business: `${formatUsd(annualSavings(BUSINESS_PLAN))}/year`, agency: `${formatUsd(annualSavings(AGENCY_PLAN))}/year` },
      { label: 'Free trial', business: `${BUSINESS_PLAN.trialDays} days`, agency: 'Not offered' },
    ],
  },
  {
    title: 'Businesses',
    rows: [
      { label: 'Businesses included', business: String(BUSINESS_PLAN.businessesIncluded), agency: `Up to ${AGENCY_PLAN.businessesIncluded}` },
      { label: 'Additional businesses', business: `${formatUsd(BUSINESS_PLAN.additionalBusinessMonthly)}/month each`, agency: `${formatUsd(AGENCY_PLAN.additionalBusinessMonthly)}/month each` },
      { label: 'Price per included business', business: perBusiness(BUSINESS_PLAN), agency: perBusiness(AGENCY_PLAN), note: 'With every included business in use.' },
    ],
  },
  {
    title: 'Allowances',
    rows: [
      { label: 'AI credits', business: `${formatCount(BUSINESS_PLAN.aiCreditsMonthly)} each month`, agency: `${formatCount(AGENCY_PLAN.aiCreditsMonthly)} each month` },
      { label: 'Audits', business: String(BUSINESS_PLAN.allowances.audits), agency: String(AGENCY_PLAN.allowances.audits) },
      { label: 'Keywords', business: String(BUSINESS_PLAN.allowances.keywords), agency: String(AGENCY_PLAN.allowances.keywords) },
      { label: 'Backlink Data', business: String(BUSINESS_PLAN.allowances.backlinkData), agency: String(AGENCY_PLAN.allowances.backlinkData) },
    ],
  },
  {
    title: 'Included in both',
    rows: [
      { label: 'Full business dashboard access', business: true, agency: true },
      { label: 'Support', business: 'Included', agency: 'Included' },
      { label: 'Legiit Bucks on purchases', business: `${LEGIIT_BUCKS_PERCENT}% back`, agency: `${LEGIIT_BUCKS_PERCENT}% back` },
      { label: 'Freelance services', business: 'Purchased separately', agency: 'Purchased separately' },
    ],
  },
  {
    title: 'Plan changes',
    rows: [{ label: 'Switch plans', business: 'Can upgrade to Agency', agency: 'Can downgrade to Business' }],
  },
]

export const PRICING_FAQ_COPY = {
  eyebrow: 'Before you choose',
  title: 'Pricing questions, answered.',
} as const

/** Every answer restates published plan data or the live trial flow. Questions are buttons, so they use Initial Caps. */
export const PRICING_FAQ: FaqItem[] = [
  {
    id: 'trial-start',
    question: 'How Do I Start The Free Trial?',
    answer: ['Select Start My 7-Day Free Trial and enter your website and email. The next steps set up your account and your business details.'],
  },
  {
    id: 'after-trial',
    question: 'What Does Business Cost After The Trial?',
    answer: [
      `Business is ${formatUsd(BUSINESS_PLAN.monthlyPrice)}/month billed monthly, or ${formatUsd(BUSINESS_PLAN.yearlyPrice)}/year billed annually. Each additional business is ${formatUsd(BUSINESS_PLAN.additionalBusinessMonthly)}/month.`,
    ],
  },
  {
    id: 'agency-trial',
    question: 'Is There A Free Trial For Agency?',
    answer: ['No, the 7-day free trial is for the Business plan. Business can upgrade to Agency when you need more businesses.'],
  },
  {
    id: 'annual',
    question: 'How Does Annual Billing Work?',
    answer: [
      `Annual billing takes ${annualDiscountPercent(BUSINESS_PLAN)}% off the plan price. Business is ${formatUsd(BUSINESS_PLAN.yearlyPrice)}/year (${formatUsd(monthlyEquivalent(BUSINESS_PLAN, 'yearly'))}/month), and Agency is ${formatUsd(AGENCY_PLAN.yearlyPrice)}/year (${formatUsd(monthlyEquivalent(AGENCY_PLAN, 'yearly'))}/month).`,
    ],
  },
  {
    id: 'more-businesses',
    question: 'Can I Add More Businesses?',
    answer: [
      `Yes, each additional business is ${formatUsd(BUSINESS_PLAN.additionalBusinessMonthly)}/month on either plan. Business includes 1 business, and Agency includes up to ${AGENCY_PLAN.businessesIncluded}.`,
    ],
  },
  {
    id: 'switch',
    question: 'Can I Switch Plans Later?',
    answer: ['Yes. Business can upgrade to Agency, and Agency can downgrade to Business.'],
  },
  {
    id: 'freelance',
    question: 'Are Freelance Services Included?',
    answer: [`No, freelance services on Legiit are purchased separately. Both plans give you ${LEGIIT_BUCKS_PERCENT}% back in Legiit Bucks on purchases.`],
  },
  {
    id: 'marketplace',
    question: 'What If I Only Need The Marketplace?',
    answer: [MARKETPLACE_STRIP.body],
  },
  {
    id: 'questions',
    question: 'Who Can I Ask Before I Buy?',
    answer: ['Email help@legiit.com or visit the Legiit support center.'],
  },
]

export const PRICING_FINAL = {
  title: 'Start with one business. Grow to twenty.',
  body: `Try Business free for ${BUSINESS_PLAN.trialDays} days, or choose Agency to manage up to ${AGENCY_PLAN.businessesIncluded} businesses.`,
} as const

/** Footer links on the pricing page. Every destination was checked on the live site. */
export const PRICING_FOOTER_LINKS = [
  { label: 'Privacy', href: 'https://legiit.com/privacy' },
  { label: 'Terms', href: 'https://legiit.com/terms' },
  { label: 'Support', href: 'https://legiit.freshdesk.com/support/home' },
  { label: 'Contact', href: 'mailto:help@legiit.com' },
  { label: 'Log In', href: 'https://legiit.com/sign-in' },
] as const
