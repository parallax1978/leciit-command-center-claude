/**
 * The verified offer (checked September 18, 2026). Every price and inclusion
 * on the page reads from this object so terms cannot drift between sections.
 *
 * Unconfirmed terms are deliberately absent: card requirement, cancellation,
 * refunds, annual pricing, trial restrictions. Do not add them here or in copy.
 */
export const OFFER = {
  planName: 'Command Center',
  monthlyPrice: 39,
  trialDays: 7,
  /** Exact hero wording requested by the brief. */
  heroTerms: '7-day free trial. Then $39/month.',
  priceLine: '$39/month after a 7-day free trial',
  inclusions: ['One business, full dashboard access, and support', '50,000 monthly AI credits', '2% back in Legiit Bucks on purchases'],
  additionalBusiness: 'Each additional business is $10/month.',
  freelanceNote: 'Freelance services are purchased separately.',
  /** Published allowance labels, kept verbatim. "25 Backlink Data" is a label, not delivered backlinks. */
  allowances: ['3 audits', '5 keywords', '25 Backlink Data'],
} as const

export type Offer = typeof OFFER
