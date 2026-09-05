import type { ReactNode } from 'react'
import { cn } from 'cn'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return <div className={cn('w-full space-y-8', className)}>{children}</div>
}

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  leading?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, description, leading, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 pb-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        {leading}
        <div className="min-w-0 space-y-1.5">
          <h1 className="truncate text-[1.75rem] font-medium tracking-[-0.04em] sm:text-[2rem]">{title}</h1>
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  )
}
