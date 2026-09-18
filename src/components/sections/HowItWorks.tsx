import { Container } from '../ui/Container'

const STEPS = [
  {
    number: '01',
    title: 'Add your business',
    text: 'Continue to Legiit, then add your website and business details so Command Center has context to work from.',
  },
  {
    number: '02',
    title: 'Investigate your AI visibility',
    text: 'Check what the four assistants say about your business, then use prompt research and citation information to find opportunities.',
  },
  {
    number: '03',
    title: 'Prepare your next action',
    text: 'Pick a priority in Do This Next, prepare the work with Lara or the content tools, and consider freelance help when a task needs a specialist.',
  },
] as const

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="border-t border-line py-14 sm:py-20">
      <Container>
        <h2 id="how-heading" className="text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[2.125rem]">
          How it works
        </h2>
        <ol className="mt-8 grid gap-8 sm:mt-10 md:grid-cols-3 md:gap-10">
          {STEPS.map((step) => (
            <li key={step.number} className="border-t border-line-strong pt-5">
              <p className="font-mono text-sm font-medium text-brand-purple" aria-hidden="true">
                {step.number}
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.01em] text-ink">
                <span className="sr-only">Step {Number(step.number)}: </span>
                {step.title}
              </h3>
              <p className="mt-2 text-[17px] leading-relaxed text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
