import { Outlet } from '@tanstack/react-router'
import { Navbar } from '@/components/navbar'
import { StreamerSidebar } from '@/components/streamer-sidebar'
import { useZeventData } from '@/hooks/use-zevent-data'

export function RootLayout() {
  const { data, isPending, isFetching, refetch } = useZeventData()

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 -left-24 size-[420px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 size-[360px] rounded-full bg-gold/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 size-[300px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <Navbar data={data} isFetching={isFetching} onRefresh={() => refetch()} />

      <div className="flex flex-col lg:flex-row">
        <StreamerSidebar streamers={data?.live ?? []} isPending={isPending} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1280px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
