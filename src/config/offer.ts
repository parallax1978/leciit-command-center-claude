/**
 * The published offer. Every price and inclusion on the page reads from here.
 * Unverified terms are deliberately absent (card requirement, cancellation,
 * refunds, annual pricing). Only the AI credits have a confirmed monthly
 * reset, so no other allowance states a period.
 */
export const OFFER = {
  trialLabel: '7-day free trial',
  priceLabel: '$39/month',
  termsShort: 'Then $39/month for one business.',
  covers:
    'Your subscription covers the research and marketing tools, Lara AI assistance, Do This Next priorities, and the tasks, orders, reports, and analytics you use to manage the work, within the plan allowances.',
  coversList: [
    'Website, search, AI visibility, and competitor checks',
    'Do This Next priorities with reasons and impact',
    'Marketing and content tools, with Lara AI assistance',
    'Tasks, orders, reports, and connected analytics',
  ],
  separateServices: 'Freelancer services are purchased separately.',
  additionalBusiness: 'Additional businesses are $10/month each.',
  allowancesLabel: 'Plan allowances',
  /** Labels kept exactly as published. "25 Backlink Data" is not a count of delivered backlinks. */
  allowances: ['3 audits', '5 keywords', '25 Backlink Data', '50,000 AI credits per month'],
  allowancesNote: 'Allowance names are shown as Legiit publishes them.',
} as const
