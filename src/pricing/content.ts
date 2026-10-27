import { AGENCY_PLAN, BUSINESS_PLAN, MARKETPLACE_PLAN, type PaidPlan } from './plans'
import { annualSavings, formatCount, formatUsd, perIncludedBusiness, yearlyCost } from './price'
import type { FaqItem } from '../config/faq'

/**
 * Customer-facing copy for the pricing page. Every statement traces to the
 * verified plan data in ./plans or to the product facts the landing page uses.
 * Writing rules: no em dashes or emojis, at most two sentences per paragraph,
 * Initial Caps on the H1 and every button label, sentence case elsewhere.
 */
export const PRICING_HERO = {
  eyebrow: 'Command Center pricing',
  h1Line1: 'One Business Or Twenty.',
  h1Line2: 'One Command Center.',
  subhead: 'Try the Business plan free for 7 days, or manage up to 20 businesses on Agency. Both plans include the full Command Center.',
} as const

export interface PlanCardCopy {
  plan: PaidPlan
  persona: string
  summary: string
  badge?: string
  /** Up to five short points; the full list lives in the comparison table. */
  points: string[]
  ctaLabel: string
  /** One short line under the button. */
  ctaNote: string
}

export const BUSINESS_CARD: PlanCardCopy = {
  plan: BUSINESS_PLAN,
  persona: 'For owners running one business',
  summary: 'Everything in Command Center for your business, with a free trial to start.',
  badge: 'Popular',
  points: [
    '1 business included',
    'Full Command Center access with Lara AI',
    `${formatCount(BUSINESS_PLAN.aiCreditsMonthly)} AI credits each month`,
    '3 Audits, 5 Keywords, 25 Backlink Data',
    'Support included',
  ],
  ctaLabel: 'Start My 7-Day Free Trial',
  ctaNote: 'Add your website and email to begin.',
}

export const AGENCY_CARD: PlanCardCopy = {
  plan: AGENCY_PLAN,
  persona: 'For agencies and multi-business owners',
  summary: 'Run up to 20 businesses from one login, with higher allowances.',
  points: [
    'Up to 20 businesses included',
    'Full Command Center access with Lara AI',
    `${formatCount(AGENCY_PLAN.aiCreditsMonthly)} AI credits each month`,
    '25 Audits, 50 Keywords, 500 Backlink Data',
    'Support included',
  ],
  ctaLabel: 'Get The Agency Plan',
  ctaNote: 'Sign in or create an account to check out.',
}

export const MARKETPLACE_STRIP = {
  title: 'Only buying or selling services?',
  body: `A Legiit marketplace account is free, with no subscription and no dashboard access. Sellers pay a ${MARKETPLACE_PLAN.saleFeePercent}% fee per sale.`,
  ctaLabel: 'Create A Free Account',
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

const billedYearly = (plan: PaidPlan) => ({ main: `${formatUsd(yearlyCost(plan, 'yearly'))}/year`, sub: `${formatUsd(yearlyCost(plan, 'yearly') / 12)}/month` })

export const COMPARE_GROUPS: CompareGroup[] = [
  {
    title: 'Price',
    rows: [
      { label: 'Billed monthly', business: `${formatUsd(BUSINESS_PLAN.monthlyPrice)}/month`, agency: `${formatUsd(AGENCY_PLAN.monthlyPrice)}/month` },
      { label: 'Billed annually', business: billedYearly(BUSINESS_PLAN), agency: billedYearly(AGENCY_PLAN) },
      { label: 'Annual saving', business: `${formatUsd(annualSavings(BUSINESS_PLAN))}/year`, agency: `${formatUsd(annualSavings(AGENCY_PLAN))}/year` },
      { label: 'Free trial', business: '7 days', agency: false },
    ],
  },
  {
    title: 'Businesses',
    rows: [
      { label: 'Businesses included', business: '1', agency: 'Up to 20' },
      { label: 'Additional businesses', business: '$10/month each', agency: '$10/month each' },
      {
        label: 'Cost per included business',
        business: `${formatUsd(BUSINESS_PLAN.monthlyPrice)}/month`,
        agency: `${formatUsd(perIncludedBusiness(AGENCY_PLAN, 'monthly'))}/month`,
        note: 'Billed monthly, with every included business in use.',
      },
    ],
  },
  {
    title: 'Command Center',
    rows: [
      { label: 'Full business dashboard access', business: true, agency: true },
      { label: 'AI credits', business: `${formatCount(BUSINESS_PLAN.aiCreditsMonthly)} each month`, agency: `${formatCount(AGENCY_PLAN.aiCreditsMonthly)} each month` },
      { label: 'Audits', business: String(BUSINESS_PLAN.allowances.audits), agency: String(AGENCY_PLAN.allowances.audits) },
      { label: 'Keywords', business: String(BUSINESS_PLAN.allowances.keywords), agency: String(AGENCY_PLAN.allowances.keywords) },
      { label: 'Backlink Data', business: String(BUSINESS_PLAN.allowances.backlinkData), agency: String(AGENCY_PLAN.allowances.backlinkData) },
      { label: 'Support', business: 'Included', agency: 'Included' },
    ],
  },
  {
    title: 'Marketplace and plan changes',
    rows: [
      { label: 'Legiit Bucks back on purchases', business: '2%', agency: '2%' },
      { label: 'Freelance services', business: 'Purchased separately', agency: 'Purchased separately' },
      { label: 'Change plans', business: 'Can upgrade to Agency', agency: 'Can downgrade to Business' },
    ],
  },
]

export const PRICING_FAQ_COPY = {
  eyebrow: 'Before you choose',
  title: 'Pricing questions, answered.',
} as const

export const PRICING_FAQ: FaqItem[] = [
  {
    id: 'trial',
    question: 'How Does The 7-Day Free Trial Work?',
    answer: [
      'Start with your website and email, then create your account and add your business details. When the 7 days end, upgrade to keep access to your dashboard data and insights.',
    ],
  },
  {
    id: 'agency-trial',
    question: 'Is There A Free Trial For The Agency Plan?',
    answer: ['The free trial is for the Business plan. Business can upgrade to Agency when you are ready to manage more businesses.'],
  },
  {
    id: 'annual',
    question: 'How Much Do I Save With Annual Billing?',
    answer: [
      `Annual billing costs 20% less. Business is ${formatUsd(BUSINESS_PLAN.yearlyPrice)} a year instead of ${formatUsd(yearlyCost(BUSINESS_PLAN, 'monthly'))}, and Agency is ${formatUsd(AGENCY_PLAN.yearlyPrice)} a year instead of ${formatUsd(yearlyCost(AGENCY_PLAN, 'monthly'))}.`,
    ],
  },
  {
    id: 'more-businesses',
    question: 'Can I Add More Businesses?',
    answer: ['Yes. Business includes one business and Agency includes up to 20, and each additional business is $10/month on either plan.'],
  },
  {
    id: 'switch',
    question: 'Can I Switch Plans Later?',
    answer: ['Yes. Business can upgrade to Agency, and Agency can downgrade to Business.'],
  },
  {
    id: 'freelance',
    question: 'Are Freelance Services Included?',
    answer: ['No. Freelance services on the Legiit marketplace are purchased separately, and both plans give you 2% back in Legiit Bucks on purchases.'],
  },
  {
    id: 'marketplace',
    question: 'What If I Only Need The Marketplace?',
    answer: [`A marketplace account is free, with no subscription and no dashboard access. Sellers pay a ${MARKETPLACE_PLAN.saleFeePercent}% fee per sale.`],
  },
  {
    id: 'questions',
    question: 'Who Can I Ask About Billing?',
    answer: ['Contact Legiit support before you buy. You can reach the team at help@legiit.com or through the support center.'],
  },
]

export const PRICING_FINAL = {
  title: 'Start with one business. Grow to twenty.',
  body: 'Try Business free for 7 days, or bring every client into Command Center with Agency.',
} as const
