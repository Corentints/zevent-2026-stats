import type { ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useZeventData } from '@/hooks/use-zevent-data'
import type { ZeventResponse } from '@/types/zevent'

interface ZeventDataGateProps {
  children: (data: ZeventResponse) => ReactNode
}

export function ZeventDataGate({ children }: ZeventDataGateProps) {
  const { data, isPending, isError, error, refetch } = useZeventData()

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px]" />
          ))}
        </div>
        <Skeleton className="h-[280px]" />
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-sm border border-destructive/50 bg-destructive/5 p-8 text-center">
        <TriangleAlert className="size-8 text-destructive" />
        <p className="font-medium">Impossible de récupérer les données ZEvent</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Erreur inconnue'}
        </p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  return <>{children(data)}</>
}
