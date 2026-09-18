import type { ElementType, PropsWithChildren } from 'react'

interface ContainerProps extends PropsWithChildren {
  as?: ElementType
  className?: string
  id?: string
}

export function Container({ as: Tag = 'div', className = '', children, id }: ContainerProps) {
  return (
    <Tag id={id} className={`mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </Tag>
  )
}
