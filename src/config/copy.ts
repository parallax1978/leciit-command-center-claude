import type { ScreenId } from './media'

/**
 * All customer-facing copy. Broad business positioning: plan, create,
 * delegate, grow. Body copy and section headings stay in sentence case;
 * the H1 and every button label use Initial Caps.
 */
export const HERO = {
  eyebrow: 'Your AI Powered Business Command Center',
  h1Line1: 'Run Your Business.',
  h1Line2: 'Without Doing Everything Yourself.',
  subhead: 'AI tools and expert freelancers to help you plan, create, delegate, and grow.',
  walkthroughAction: 'Explore Command Center',
} as const

export const INTRO = {
  eyebrow: 'Built around your business',
  title: 'One place to move your business forward.',
  body: 'Get help deciding what comes next, creating what you need, and getting the work done.',
} as const

export interface SectionMedia {
  screen: ScreenId
  caption: string
}

export interface ProductSectionCopy {
  id: string
  label: string
  title: string
  paragraphs: [string, string]
  bullets: string[]
  note?: string
  media: SectionMedia[]
  mediaSide: 'left' | 'right'
  tinted: boolean
}

export const PRODUCT_SECTIONS: ProductSectionCopy[] = [
  {
    id: 'business-ai',
    label: '01 · Put AI to work',
    title: 'Put AI to work on your business.',
    paragraphs: [
      'Build from your business details, offers, customer profiles, and brand voice. Command Center helps create that context from your website, so you can review and refine it as you get started.',
      'Work through your next steps with Lara, explore ideas with AI advisors, and develop your direction with strategy tools. AI focus groups give you simulated feedback to consider as you work on business ideas and decisions.',
    ],
    bullets: ['Editable business context built from your website', 'Lara assistance and “Do This Next” recommendations', 'Strategy, experiments, AI advisors, and AI focus groups'],
    media: [{ screen: 'priorities', caption: 'Actual screen: a Do This Next recommendation with its reason and the Do it with Lara option.' }],
    mediaSide: 'right',
    tinted: false,
  },
  {
    id: 'visibility',
    label: '02 · Grow your visibility',
    title: 'Get found on Google and in AI answers.',
    paragraphs: [
      'Give potential customers more ways to find your business when they search for what you sell. Use built-in SEO, GEO, and AEO tools to research relevant searches, generate answers to customer questions, and create content around those opportunities.',
      'Find articles and “best-of” lists to approach for coverage, with contact routes where available. Use keyword research, site health checks, and on-page SEO checks to support the work on your own website.',
    ],
    bullets: ['Research keywords and customer questions', 'Generate direct answers and content starters', 'Find sources and placement opportunities'],
    media: [{ screen: 'ai-visibility', caption: 'Actual screen: the AI Visibility tools for finding what to target, answering buyer questions, and seeing how AI answers.' }],
    mediaSide: 'left',
    tinted: true,
  },
  {
    id: 'content',
    label: '03 · Create what you need',
    title: 'Create the content and visuals your business needs.',
    paragraphs: [
      'Turn a topic into an article draft, build a brief for a writer, or create social captions and images. Keep the work connected to what your business sells, who it serves, and how it should sound.',
      'Open content in the editor to build it out, refine it with AI, and save your work. You have a starting point and tools to develop it into something you can use.',
    ],
    bullets: ['Articles, blog and landing-page starters, and briefs', 'Customer answers and social captions', 'Brand guides, image creation, and your image gallery'],
    media: [{ screen: 'brief-builder', caption: 'Actual screen: Brief Builder at step 1, before a keyword has been chosen.' }],
    mediaSide: 'right',
    tinted: false,
  },
  {
    id: 'expert-help',
    label: '04 · Get expert help',
    title: 'Bring in expert help when you need it.',
    paragraphs: [
      'Use the tools yourself or choose a Legiit freelancer to help carry out the work. Relevant services are available alongside your business tools, so you have a way to get help when a task needs a specialist.',
      'Keep tasks and orders connected to your business, with reports and connected analytics available to review progress. Return to the same workspace to continue the work and check the results.',
    ],
    bullets: ['Find specialists for the work your business needs', 'Choose the services your business needs', 'Follow tasks, orders, and performance in one place'],
    note: 'Freelance services are purchased separately.',
    media: [
      { screen: 'specialist-help', caption: 'Actual screen: backlink data with a Browse Backlink Services action, the route from a business need to specialist help.' },
      { screen: 'services', caption: 'Actual screen: a recommended service, alongside your business tools.' },
    ],
    mediaSide: 'left',
    tinted: true,
  },
]

export const FINAL_CTA = {
  title: 'Put your next business move into action.',
  body: 'Bring your plans, tools, and expert help together in Command Center.',
} as const

export const FOOTER = {
  line: 'Command Center by Legiit',
} as const

export interface WalkthroughChapter {
  id: string
  /** Also used as a chapter button label, so Initial Caps. */
  title: string
  body: string
  screen: ScreenId | null
  noScreenNote?: string
  caption?: string
}

/** Chapters for the "Explore Command Center" walkthrough. Text where no screen was supplied. */
export const WALKTHROUGH: WalkthroughChapter[] = [
  {
    id: 'overview',
    title: 'Business Overview',
    body: 'Command Center starts from your business details: what you offer, who you serve, your brand voice, your competitors, and your focus keywords. The overview brings your numbers and your Legiit Score together in one place.',
    screen: 'performance',
    caption: 'Actual screen: the Your numbers area of the overview before analytics are connected. N/A means no data source is linked yet.',
  },
  {
    id: 'priority',
    title: 'Do This Next',
    body: 'Do This Next turns findings into a single recommended action, with the reason and the expected impact. You can do it yourself, do it with Lara, or mark it done.',
    screen: 'priorities',
    caption: 'Actual screen: a Do This Next recommendation.',
  },
  {
    id: 'visibility',
    title: 'Online Visibility',
    body: 'See how your website, keywords, backlinks, local presence, and reviews look from the outside, and how competitors compare. The Backlinks tab shown here is one part of that picture.',
    screen: 'visibility',
    caption: 'Actual screen: Online Visibility, Backlinks tab.',
  },
  {
    id: 'ai-visibility',
    title: 'AI Visibility',
    body: 'Research the questions customers ask, generate direct answers, and see how AI assistants answer, so you can create content around real opportunities.',
    screen: 'ai-visibility',
    caption: 'Actual screen: AI Visibility, before the first check has been run.',
  },
  {
    id: 'content',
    title: 'Content And Visuals',
    body: 'Turn a topic into an article draft, build a brief for a writer, or create social captions and images. Brief Builder, shown here, is one of the content tools.',
    screen: 'brief-builder',
    caption: 'Actual screen: Brief Builder at step 1.',
  },
  {
    id: 'specialists',
    title: 'Expert Help',
    body: 'When a task needs a specialist, Command Center points to relevant Legiit freelancers. You choose who to hire, and services are purchased separately.',
    screen: 'specialist-help',
    caption: 'Actual screen: backlink data with a Browse Backlink Services action.',
  },
  {
    id: 'ongoing',
    title: 'Tasks And Orders',
    body: 'Tasks hold the actions you decided to take, and orders track the freelancer work you purchased and its status. Reports keep a record of progress, and connected analytics show performance once your accounts are linked.',
    screen: null,
    noScreenNote: 'No capture of the tasks, orders, or reports screens was supplied for this page, so this chapter is described in text.',
  },
]
