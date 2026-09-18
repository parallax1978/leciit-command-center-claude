export interface FaqItem {
  id: string
  question: string
  answer: string[]
}

/** Answers use only the verified product and offer facts. Keep paragraphs to two sentences. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'after-click',
    question: 'What happens after I click?',
    answer: [
      'You continue to Legiit and sign in or create an account. Then you add your website and business details, and choose your first task in Command Center.',
      'The button on this page does not run a check or complete setup by itself.',
    ],
  },
  {
    id: 'lara',
    question: 'What does Lara help with? Is the work automatic?',
    answer: [
      'Lara gives AI assistance inside Command Center, such as preparing a brief or a draft from a Do This Next priority.',
      'You review the result. Nothing is published or changed on your website for you.',
    ],
  },
  {
    id: 'subscription',
    question: 'What does the subscription include?',
    answer: [
      '$39/month after the 7-day free trial covers one business, full dashboard access, support, and 50,000 monthly AI credits. Published allowances are 3 audits, 5 keywords, and 25 Backlink Data.',
      'Each additional business is $10/month. Purchases earn 2% back in Legiit Bucks.',
    ],
  },
  {
    id: 'freelance',
    question: 'Are freelance services included?',
    answer: [
      'No. When a task needs paid help, Command Center points you to relevant freelance-service categories on the Legiit platform, and you buy those services separately.',
      'A recommended category is not an assigned freelancer or a completed order.',
    ],
  },
  {
    id: 'assistants',
    question: 'Which AI assistants are checked?',
    answer: [
      'The AI Visibility checkup covers ChatGPT, Gemini, Claude, and Grok. Tracking shows what changes after you act.',
      'Better visibility or new customers are not guaranteed.',
    ],
  },
]
