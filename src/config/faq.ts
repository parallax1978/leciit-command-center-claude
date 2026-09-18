export interface FaqItem {
  id: string
  question: string
  answer: string[]
}

export const FAQ_COPY = {
  eyebrow: 'A few things to know',
  title: 'Before you start.',
} as const

/** Questions are button labels, so they use Initial Caps. Answers stay in sentence case. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'create',
    question: 'What Can I Actually Create In Command Center?',
    answer: [
      'Create article drafts, direct answers to customer questions, content briefs, social captions, and images. Research can also become a blog or landing-page starter that you develop in the Content Editor.',
    ],
  },
  {
    id: 'search',
    question: 'Can It Help With Google And AI Search?',
    answer: [
      'Yes. Built-in SEO, GEO, and AEO tools help you research opportunities, create relevant content and answers, identify placement targets, and review your visibility as you work.',
    ],
  },
  {
    id: 'business-info',
    question: 'Does It Use Information About My Business?',
    answer: [
      'Command Center helps gather information from your website during setup, including your offers, customer profiles, and brand voice. You can review and edit that information so the workspace reflects your business.',
    ],
  },
  {
    id: 'do-it-for-me',
    question: 'Can I Get Someone To Do The Work For Me?',
    answer: [
      'You can find and hire Legiit freelancers for the work you want help with. You choose and purchase those services separately from the Command Center subscription.',
    ],
  },
  {
    id: 'automatic',
    question: 'Does Command Center Publish Or Run Everything Automatically?',
    answer: [
      'You choose which actions to take, review the work you create, and decide what to publish or delegate. Available tools and Lara assistance help you carry out those steps.',
    ],
  },
  {
    id: 'trial',
    question: 'What Happens When I Start My Trial?',
    answer: [
      'You’ll go to Legiit to create an account or sign in, then set up your business and review the trial terms. Some features need connected accounts or a separate tool run.',
    ],
  },
  {
    id: 'more-businesses',
    question: 'Can I Add More Than One Business?',
    answer: ['Yes. One business is included at $39/month after the trial, and additional businesses are $10/month each.'],
  },
]
