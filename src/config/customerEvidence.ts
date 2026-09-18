/**
 * Optional approved customer evidence. Leave null until a quote or
 * substantiated result has written publication permission (see README).
 * When null, the page renders nothing: no placeholder, no empty section.
 */
export interface CustomerEvidence {
  /** Approved quote or substantiated result, verbatim. */
  quote: string
  /** Approved attribution, for example "Name, Role, Business". */
  attribution: string
}

export const CUSTOMER_EVIDENCE: CustomerEvidence | null = null
