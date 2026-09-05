import { Outlet } from '@tanstack/react-router'
import { Navbar } from '@/components/navbar'
import { StreamerSidebar } from '@/components/streamer-sidebar'
import { useZeventData } from '@/hooks/use-zevent-data'

export function RootLayout() {
  const { data, isPending, isFetching, refetch } = useZeventData()

  return (
    <div className="min-h-screen">
      <Navbar data={data} isFetching={isFetching} onRefresh={() => refetch()} />

      <div className="flex flex-col lg:flex-row">
        <StreamerSidebar streamers={data?.live ?? []} isPending={isPending} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1280px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
