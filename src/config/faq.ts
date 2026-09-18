export interface FaqItem {
  id: string
  question: string
  answer: string[]
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'who',
    question: 'Who is Command Center for?',
    answer: [
      'Business owners who want to run their own marketing with a clear plan, whether they do the work themselves, use Lara, or hire help for specific tasks. You do not need an agency or a marketing background to use it.',
    ],
  },
  {
    id: 'manage',
    question: 'What does it help me manage?',
    answer: [
      'Your online position: website health, search and AI visibility, local presence and reviews, and competitors. The priorities that come out of it. The work you do with the tools or with Lara, the freelancers you hire, and the tasks, orders, reports, and analytics that keep it connected.',
    ],
  },
  {
    id: 'after-click',
    question: 'What happens after I click the trial button?',
    answer: [
      'You go to the Legiit dashboard, where you sign in or create an account first. Then you set up your business: details, offers, customer avatars, brand voice, competitors, and focus keywords.',
      'Command Center builds its overview and priorities from that setup. The click itself does not run an audit.',
    ],
  },
  {
    id: 'included',
    question: 'What is included, and what costs extra?',
    answer: [
      'Your subscription covers the platform tools, Lara AI assistance, Do This Next priorities, and the management features for one business, within the plan allowances.',
      'Freelancer services are separate. You choose a Legiit freelancer and pay for that service when you order it.',
    ],
  },
  {
    id: 'another-business',
    question: 'Can I add another business?',
    answer: ['Yes. Each additional business is $10/month and gets its own setup, overview, and priorities.'],
  },
  {
    id: 'lara',
    question: 'What does Lara do?',
    answer: [
      'Lara is the AI assistant inside Command Center. Lara helps you understand a finding, prepare the work behind a priority, and draft content. You review what Lara produces and decide what to publish or send.',
      'Lara does not carry out every recommendation for you and does not hire freelancers on your behalf.',
    ],
  },
]
