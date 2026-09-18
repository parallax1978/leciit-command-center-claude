import type { ScreenId } from './media'

/**
 * All customer-facing copy for the landing page. Plain language for business
 * owners. Usefulness before module names. No unverified claims.
 */
export const HERO = {
  headline: 'Take control of your marketing, from plan to done.',
  support:
    'See where your business stands online, decide what needs attention, and get the work done. Command Center puts marketing tools, Lara AI, and Legiit freelancers in one place.',
  secondaryAction: 'Watch product overview',
  walkthroughAction: 'Explore Command Center',
} as const

export interface CapabilityItem {
  lead?: string
  text: string
}

export interface SectionMedia {
  screen: ScreenId
  caption: string
}

export interface ProductSectionCopy {
  id: string
  eyebrow: string
  title: string
  lead: string
  /** Optional second paragraph, used to place business context or an example naturally. */
  note?: string
  listTitle: string
  items: CapabilityItem[]
  media: SectionMedia[]
  mediaSide: 'left' | 'right'
  /** Wider media column for short, wide captures. */
  mediaWidth: 'balanced' | 'wide'
  tinted: boolean
}

export const PRODUCT_SECTIONS: ProductSectionCopy[] = [
  {
    id: 'position',
    eyebrow: 'Online position',
    title: 'Understand your online position',
    lead:
      'Before you spend time or money, see what customers and search engines actually find. Command Center checks your website, your search and AI visibility, your local presence and reviews, and how you compare with competitors, then keeps it all in one place.',
    note: 'It works from the business details you set up: what you offer, who you serve, your brand voice, your competitors, and your focus keywords.',
    listTitle: 'What you can check',
    items: [
      { text: 'Website and SEO health, with technical and on-page checks' },
      { text: 'Keywords and backlinks' },
      { text: 'Visibility in search results and in AI assistants' },
      { text: 'Local presence and reviews' },
      { text: 'Competitor research' },
      { text: 'Connected performance data from your analytics' },
    ],
    media: [{ screen: 'visibility', caption: 'Actual screen: the Online Visibility area, open on the Backlinks tab.' }],
    mediaSide: 'right',
    mediaWidth: 'balanced',
    tinted: false,
  },
  {
    id: 'priorities',
    eyebrow: 'Priorities',
    title: 'Know what deserves attention',
    lead:
      'Checks produce long lists. Do This Next turns them into one clear next move. Each action shows the finding behind it, why it matters, and what it affects, so you can decide what to do first.',
    note: 'In the screen shown, the finding is an unconnected Google Business Profile. The action explains what connecting it unlocks and offers three ways forward: do it yourself, do it with Lara, or mark it done.',
    listTitle: 'How priorities work',
    items: [
      { text: 'Business overview and Legiit Score summarize where you stand' },
      { text: 'Do This Next shows the recommended action' },
      { text: 'Every action explains its reason and expected impact' },
      { text: 'Strategy playbooks put actions in context' },
      { text: 'Prioritized tasks carry the plan into your work list' },
    ],
    media: [{ screen: 'priorities', caption: 'Actual screen: a Do This Next recommendation with its reason, impact note, and available actions.' }],
    mediaSide: 'left',
    mediaWidth: 'balanced',
    tinted: true,
  },
  {
    id: 'execution',
    eyebrow: 'Execution',
    title: 'Get the marketing work done',
    lead:
      'Every priority comes with a way to act on it. Do the work yourself with the built-in tools, work through it with Lara, or find a Legiit freelancer who does this kind of work. You choose the route and stay in control.',
    listTitle: 'Three ways to get it done',
    items: [
      { lead: 'Use the tools.', text: 'Research and marketing tools, SEO and visibility tools, and content tools: briefs, an editor, and social content.' },
      { lead: 'Work with Lara.', text: 'Lara AI helps you understand a finding, prepare the work, and draft it. You review the result before anything goes live.' },
      { lead: 'Hire a specialist.', text: 'When a task needs an expert, Command Center shows relevant Legiit freelancers. You pick who to hire, and services are purchased separately.' },
    ],
    media: [
      { screen: 'specialist-help', caption: 'Actual screen: backlink data with a Browse Backlink Services action, the route from a finding to specialist help.' },
      { screen: 'services', caption: 'Actual screen: a recommended service card. Freelancer services are purchased separately.' },
    ],
    mediaSide: 'right',
    mediaWidth: 'wide',
    tinted: false,
  },
  {
    id: 'management',
    eyebrow: 'Ongoing management',
    title: 'Keep work and progress connected',
    lead:
      'Marketing rarely finishes in one sitting. Tasks, orders, reports, and connected analytics live together, so you can see what is in progress, what a freelancer delivered, and how your numbers change over time.',
    listTitle: 'What stays connected',
    items: [
      { lead: 'Tasks.', text: 'The actions you decided to take, in one list.' },
      { lead: 'Orders.', text: 'Freelancer work you purchased, with its status.' },
      { lead: 'Reports.', text: 'A record of checks and progress you can revisit.' },
      { lead: 'Connected analytics.', text: 'Performance data once your accounts are linked.' },
    ],
    media: [{ screen: 'performance', caption: 'Actual screen: the Your numbers area before analytics are connected. Values show N/A until you connect a data source.' }],
    mediaSide: 'left',
    mediaWidth: 'wide',
    tinted: true,
  },
]

export const OFFER_COPY = {
  eyebrow: 'Pricing',
  title: 'Try it for 7 days. Then one price for one business.',
  coversTitle: 'What your subscription covers',
} as const

export const FINAL_CTA = {
  title: 'Start with one business.',
  body: 'Sign in or create your Legiit account, set up your business, and see your first priorities.',
} as const

export const FOOTER = {
  line: 'Command Center by Legiit',
} as const

export interface WalkthroughChapter {
  id: string
  title: string
  body: string
  screen: ScreenId | null
  /** Shown when no capture exists for the chapter. */
  noScreenNote?: string
  caption?: string
}

/** Chapters for the "Explore Command Center" walkthrough. Text where no screen was supplied. */
export const WALKTHROUGH: WalkthroughChapter[] = [
  {
    id: 'overview',
    title: 'Business overview',
    body: 'Command Center starts from your business details: what you offer, who you serve, your brand voice, your competitors, and your focus keywords. The overview brings your numbers and your Legiit Score together in one place.',
    screen: 'performance',
    caption: 'Actual screen: the Your numbers area of the overview before analytics are connected. N/A means no data source is linked yet.',
  },
  {
    id: 'visibility',
    title: 'Online visibility',
    body: 'See how your website, keywords, backlinks, local presence, and reviews look from the outside, and how competitors compare. The Backlinks tab shown here is one part of that picture.',
    screen: 'visibility',
    caption: 'Actual screen: Online Visibility, Backlinks tab.',
  },
  {
    id: 'ai-visibility',
    title: 'AI visibility',
    body: 'Check whether AI assistants mention your business when people ask about a business like yours, find the questions worth targeting, and track changes over time.',
    screen: 'ai-visibility',
    caption: 'Actual screen: AI Visibility, before the first check has been run.',
  },
  {
    id: 'priority',
    title: 'A useful priority',
    body: 'Do This Next turns findings into a single recommended action, with the reason and the expected impact. You can do it yourself, do it with Lara, or mark it done.',
    screen: 'priorities',
    caption: 'Actual screen: a Do This Next recommendation.',
  },
  {
    id: 'tools',
    title: 'Tools and Lara',
    body: 'Research, marketing, and content tools sit alongside the checks. Lara AI helps you understand a finding, prepare the work, and draft it. You review the result. Brief Builder, shown here, is one of the content tools.',
    screen: 'brief-builder',
    caption: 'Actual screen: Brief Builder, one of the content tools.',
  },
  {
    id: 'specialists',
    title: 'Access to specialists',
    body: 'When a task needs an expert, Command Center points to relevant Legiit freelancers. You choose who to hire, and services are purchased separately.',
    screen: 'specialist-help',
    caption: 'Actual screen: backlink data with a Browse Backlink Services action.',
  },
  {
    id: 'ongoing',
    title: 'Ongoing work',
    body: 'Tasks hold the actions you decided to take. Orders track freelancer work you purchased and its status. Reports keep a record of checks and progress, and connected analytics show performance once your accounts are linked.',
    screen: null,
    noScreenNote: 'No capture of the tasks, orders, or reports screens was supplied for this page, so this chapter is described in text.',
  },
]
