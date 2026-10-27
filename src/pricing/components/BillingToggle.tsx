import { useId } from 'react'
import type { BillingPeriod } from '../plans'

interface BillingToggleProps {
  value: BillingPeriod
  onChange: (next: BillingPeriod) => void
  /** Whole-number annual discount shown next to the Annual option, e.g. 20. */
  annualDiscountPercent: number
  className?: string
}

/**
 * Monthly / Annual switch built on native radio inputs inside a fieldset, so
 * keyboard and screen-reader behaviour come from the browser (arrow keys move
 * between options, the group is announced as "Billing period").
 */
export function BillingToggle({ value, onChange, annualDiscountPercent, className = '' }: BillingToggleProps) {
  const name = useId()
  const options: { value: BillingPeriod; label: string }[] = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Annual' },
  ]

  return (
    <fieldset className={`inline-flex ${className}`}>
      <legend className="sr-only">Billing period</legend>
      <div className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-canvas p-1">
        {options.map((opt) => {
          const id = `${name}-${opt.value}`
          const checked = value === opt.value
          return (
            <span key={opt.value} className="relative">
              <input
                id={id}
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={`inline-flex min-h-[44px] cursor-pointer select-none items-center gap-2 rounded-full px-4 text-[15px] font-semibold transition-colors motion-reduce:transition-none peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-purple ${
                  checked ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {opt.label}
                {opt.value === 'yearly' && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${checked ? 'bg-white/15 text-white' : 'bg-brand-tint text-brand-purple'}`}
                  >
                    Save {annualDiscountPercent}%
                  </span>
                )}
              </label>
            </span>
          )
        })}
      </div>
    </fieldset>
  )
}
