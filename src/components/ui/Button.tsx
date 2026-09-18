import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

const baseClass =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold leading-none transition-colors motion-reduce:transition-none btn-focus disabled:cursor-not-allowed disabled:opacity-60 select-none'

const variantClass: Record<Variant, string> = {
  primary:
    'text-white bg-gradient-to-r from-brand-purple to-brand-magenta shadow-[0_1px_0_rgba(255,255,255,0.15)_inset] hover:from-[#5a0fb3] hover:to-[#ad1a7f]',
  secondary: 'text-ink border border-line-strong bg-canvas hover:bg-canvas-sunken',
  ghost: 'text-ink hover:bg-canvas-sunken',
}

const sizeClass: Record<Size, string> = {
  md: 'min-h-[44px] px-4 text-[15px]',
  lg: 'min-h-[52px] px-6 text-base',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className = '') {
  return `${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  type = 'button',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  )
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </a>
  )
}
