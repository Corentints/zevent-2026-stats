import { useMemo, useState } from 'react'
import { useTable, type SortingState } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react'
import { streamerColumns } from '@/components/streamer-columns'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { zeventTableFeatures } from '@/lib/table-features'
import { cn } from 'cn'
import type { Streamer } from '@/types/zevent'

interface StreamerTableProps {
  streamers: Streamer[]
}

export function StreamerTable({ streamers }: StreamerTableProps) {
  const [search, setSearch] = useState('')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'donationAmount', desc: true },
  ])

  const data = useMemo(
    () => (onlineOnly ? streamers.filter((s) => s.online) : streamers),
    [streamers, onlineOnly],
  )

  const table = useTable({
    features: zeventTableFeatures,
    data,
    columns: streamerColumns,
    getRowId: (row) => row.twitch_id,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    globalFilterFn: 'includesString',
  })

  const rows = table.getRowModel().rows

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un streamer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 focus-visible:ring-primary/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="online-only" checked={onlineOnly} onCheckedChange={setOnlineOnly} />
          <Label htmlFor="online-only" className="text-sm text-muted-foreground">
            En ligne uniquement
          </Label>
        </div>
      </div>

      <div className="overflow-hidden border-y border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sortDirection = header.column.getIsSorted()
                  return (
                    <TableHead
                      key={header.id}
                      className="text-xs font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          disabled={!canSort}
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'flex items-center gap-1',
                            canSort && 'cursor-pointer select-none hover:text-primary',
                            sortDirection && 'text-primary',
                          )}
                        >
                          <table.FlexRender header={header} />
                          {canSort &&
                            (sortDirection === 'asc' ? (
                              <ArrowUp className="size-3.5" />
                            ) : sortDirection === 'desc' ? (
                              <ArrowDown className="size-3.5" />
                            ) : (
                              <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
                            ))}
                        </button>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-primary/5">
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={streamerColumns.length} className="h-24 text-center text-muted-foreground">
                  Aucun streamer ne correspond à votre recherche.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {data.length} streamer{data.length > 1 ? 's' : ''} affiché{data.length > 1 ? 's' : ''}
      </p>
    </div>
  )
}
