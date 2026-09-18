import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'inverse' | 'secondary' | 'ghost'
/** `hero` is the standard `lg` size scaled by 25% (font, padding, gap, icon, border, radius). */
type Size = 'sm' | 'md' | 'lg' | 'hero'

/*
 * Each CSS property is set by exactly one class per size or variant, so the
 * hero values (weight, line height, radius, border width) are never
 * overridden by a shared base class.
 */
const baseClass =
  'inline-flex items-center justify-center transition-colors motion-reduce:transition-none btn-focus disabled:cursor-not-allowed disabled:opacity-50 select-none'

const variantClass: Record<Variant, string> = {
  primary: 'border-brand-purple bg-brand-purple text-white hover:border-[#5a0fb3] hover:bg-[#5a0fb3]',
  inverse: 'border-white bg-white text-brand-purple hover:bg-[#F3EBFC] focus-visible:!outline-white',
  secondary: 'border-line-strong bg-canvas text-ink hover:bg-canvas-sunken',
  ghost: 'border-transparent text-ink hover:bg-canvas-sunken',
}

const sizeClass: Record<Size, string> = {
  sm: 'min-h-[44px] gap-2 rounded-lg border px-3 text-sm font-semibold leading-none',
  md: 'min-h-[44px] gap-2 rounded-lg border px-4 text-[15px] font-semibold leading-none',
  lg: 'min-h-[54px] gap-5 rounded-lg border px-6 py-[15px] text-base font-semibold leading-none',
  hero:
    'min-h-[67.5px] max-w-full gap-[25px] rounded-[8.75px] border-[1.25px] px-[30px] py-[18.75px] text-[20px] font-bold leading-[1.4] max-[900px]:text-[18.75px] max-[379px]:px-5',
}

/** Icon size that matches each button size; the hero icon is 19px scaled by 25%. */
export const iconSize: Record<Size, number> = { sm: 16, md: 18, lg: 19, hero: 23.75 }

/** Large-button icons are hidden on narrow phones so labels stay on one line without overflowing. */
export const iconClass: Record<Size, string> = { sm: '', md: '', lg: 'max-[419px]:hidden', hero: 'max-[419px]:hidden' }

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className = '') {
  return `${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className = '', children, type = 'button', ...rest }: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  )
}

export function LinkButton({ variant = 'primary', size = 'md', className = '', children, ...rest }: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </a>
  )
}
