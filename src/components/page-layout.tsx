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
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        {leading}
        <div className="min-w-0 space-y-1">
          <h1 className="truncate text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  )
}
