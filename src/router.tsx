import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { RootLayout } from '@/components/root-layout'
import { LeaderboardPage } from '@/pages/leaderboard-page'
import { OverviewPage } from '@/pages/overview-page'
import { StreamerPage } from '@/pages/streamer-page'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: OverviewPage,
})

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/classement',
  component: LeaderboardPage,
})

const streamerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/streamer/$streamerKey',
  component: StreamerPage,
})

const routeTree = rootRoute.addChildren([indexRoute, leaderboardRoute, streamerRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
