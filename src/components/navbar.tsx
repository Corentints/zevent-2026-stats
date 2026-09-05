import { Link } from '@tanstack/react-router'
import { cn } from 'cn'

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

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center">
          <NavLinks className="hidden sm:flex" />
        </div>

        <NavLinks className="pb-3 sm:hidden" />
      </div>
    </header>
  )
}
