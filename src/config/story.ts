/**
 * Optional customer story. The component renders nothing until a real,
 * approved story is configured here. See README, "Customer story inputs".
 * Never fill this with fabricated quotes or platform testimonials recast as
 * Command Center results.
 */
export interface CustomerStory {
  businessName: string
  personName: string
  role: string
  /** The problem the business faced, in its own words or an approved summary. */
  problem: string
  /** What the business used inside Command Center. */
  used: string
  /** An attributable result or experience, exactly as approved. */
  result: string
  /** Internal reference to the written publication permission. */
  permissionReference: string
}

export const CUSTOMER_STORY: CustomerStory | null = null
