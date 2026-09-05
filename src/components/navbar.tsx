import { Heart, RefreshCw } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'
import type { ZeventResponse } from '@/types/zevent'

interface NavbarProps {
  data?: ZeventResponse
  isFetching: boolean
  onRefresh: () => void
}

const navLinks = [
  { to: '/', label: "Vue d'ensemble" },
  { to: '/classement', label: 'Classement complet' },
] as const

function NavLinks({ className }: { className?: string }) {
  return (
    <nav className={cn('flex items-center gap-5', className)} aria-label="Navigation principale">
      {navLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="border-b border-transparent py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          activeOptions={{ exact: true }}
          activeProps={{ className: 'border-foreground text-foreground' }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

export function Navbar({ data, isFetching, onRefresh }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          <NavLinks className="hidden sm:flex" />

          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isFetching}>
              <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
            {data && (
              <Button asChild size="sm">
                <a href={data.globalDonationUrl} target="_blank" rel="noreferrer">
                  <Heart className="size-4" />
                  <span className="hidden sm:inline">Faire un don</span>
                </a>
              </Button>
            )}
          </div>
        </div>

        <NavLinks className="pb-3 sm:hidden" />
      </div>
    </header>
  )
}
