/**
 * The published offer. Every price and inclusion on the page reads from here.
 * Unverified terms are deliberately absent (card requirement, cancellation,
 * refunds, annual pricing, unlimited usage). Only the AI credits have a
 * confirmed monthly reset, so no other allowance states a period.
 */
export const OFFER = {
  eyebrow: 'One business. One command center.',
  title: 'Put Command Center to work for your business.',
  body: 'Explore your next move, put AI to work, and get help turning plans into progress.',
  benefits: [
    'Full business dashboard and support',
    'Business AI, SEO/GEO/AEO, and content tools',
    '50,000 AI credits each month',
    'Tasks, orders, reports and connected analytics',
  ],
  trialBadge: 'Try it free for 7 days',
  /** Rendered as two spans with a real space between them so the DOM text reads exactly "$39 / month after your trial". */
  priceAmount: '$39',
  priceRest: '/ month after your trial',
  supportingLine: 'One business included',
  accountNote: 'Continue to Legiit to create an account or sign in, then set up your business and review the trial terms.',
  additionalBusiness: 'Additional businesses: $10/month each.',
  separateServices: 'Freelance services purchased separately.',
  allowancesControl: 'See Plan Allowances And Benefits',
  /** Labels kept exactly as published. "25 Backlink Data" is not a count of delivered backlinks. */
  allowancesText: '3 audits · 5 keywords · 25 Backlink Data · 50,000 monthly AI credits · 2% back in Legiit Bucks on purchases.',
  /** Offer line under the hero button and under the closing button. */
  heroTerms: '7 days free. Then $39/month for one business.',
  heroTermsNote: 'Freelance services purchased separately.',
} as const
