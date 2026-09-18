import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from './Button'
import { Close } from './Icons'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, video[controls], iframe, [tabindex]:not([tabindex="-1"])'

/**
 * Accessible modal built on the native <dialog> element.
 *
 * - showModal() makes the rest of the page inert and contains focus.
 * - A Tab handler also loops focus for browsers with partial support.
 * - Escape closes through the native cancel event.
 * - Focus moves to the Close control on open and returns to the opener on close.
 * - Children unmount on close, so any media inside stops.
 */
export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) {
      openerRef.current = document.activeElement as HTMLElement | null
      el.showModal()
      document.documentElement.style.overflow = 'hidden'
      el.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    } else if (!open && el.open) {
      el.close()
    }
  }, [open])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handleCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }
    const handleClose = () => {
      document.documentElement.style.overflow = ''
      const opener = openerRef.current
      openerRef.current = null
      if (opener && document.contains(opener)) opener.focus()
    }
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const nodes = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE))
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    el.addEventListener('cancel', handleCancel)
    el.addEventListener('close', handleClose)
    el.addEventListener('keydown', handleKeydown)
    return () => {
      el.removeEventListener('cancel', handleCancel)
      el.removeEventListener('close', handleClose)
      el.removeEventListener('keydown', handleKeydown)
      document.documentElement.style.overflow = ''
    }
  }, [onClose])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className="m-0 h-[100dvh] max-h-[100dvh] w-screen max-w-[100vw] bg-transparent p-0 text-ink sm:m-auto sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:max-w-6xl"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {open && (
        <div className="flex h-full max-h-[100dvh] flex-col overflow-hidden bg-canvas sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl sm:border sm:border-line sm:shadow-frame">
          <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <h2 id={titleId} className="text-base font-semibold leading-snug text-ink sm:text-lg">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-0.5 text-sm text-ink-muted">
                  {description}
                </p>
              )}
            </div>
            <Button variant="secondary" onClick={onClose} aria-label="Close" className="shrink-0 !px-3" data-autofocus>
              <Close size={18} />
              <span className="hidden sm:inline">Close</span>
            </Button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      )}
    </dialog>
  )
}
