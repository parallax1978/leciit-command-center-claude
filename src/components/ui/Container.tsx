import type { ElementType, PropsWithChildren } from 'react'

interface ContainerProps extends PropsWithChildren {
  as?: ElementType
  className?: string
  id?: string
}

/** 1200px outer width with 16 to 32px gutters, so content runs about 1136 to 1168px. */
export function Container({ as: Tag = 'div', className = '', children, id }: ContainerProps) {
  return (
    <Tag id={id} className={`mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </Tag>
  )
}
