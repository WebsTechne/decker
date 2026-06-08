import { Header } from "#/components/sections/header"
import { Badge } from "#/components/ui/badge"
import { Spinner } from "#/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#/components/ui/tooltip"
import { getUnread } from "#/lib/activity"
import { authClient } from "#/lib/auth-client"
import { cn } from "#/lib/utils"
import { useQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  Outlet,
  Link,
  useLocation,
  redirect,
} from "@tanstack/react-router"
import { Bookmark, Bell, Search, Plus } from "lucide-react"

export const Route = createFileRoute("/_app")({
  component: AppLayout,
  pendingComponent: () => (
    <div className="flex-center h-dvh">
      <Spinner className="size-7" />
    </div>
  ),
  pendingMs: 300, // only show pending if it takes more than 300ms
  beforeLoad: async ({ context, location }) => {
    if (!context.session)
      throw redirect({
        to: "/auth/sign-in",
        search: { redirect: location.href },
      })
  },
})

const tabs = [
  { to: "/", label: "Library", icon: Bookmark, fill: true, exactPath: true },
  {
    to: "/activity",
    label: "Activity",
    icon: Bell,
    fill: true,
    isActivity: true,
  },
  { to: "/explore", label: "Explore", icon: Search },
  { to: "/upload", label: "Upload", icon: Plus },
]

function AppLayout() {
  const { data: session, isPending: authPending } = authClient.useSession()
  const { pathname } = useLocation()

  const { data: activities = { hasUnread: false, count: 0 }, isPending } =
    useQuery({
      queryKey: ["activities", "nav"],
      queryFn: () => getUnread(),
      enabled: !!session && !authPending,
    })

  const { hasUnread, count } = activities

  return (
    <div className="app-shell flex h-dvh!">
      {/* Sidebar — desktop only */}
      <aside className="sidebar z-1010 hidden flex-col">
        <div className="flex-center h-12 w-full">{/* Decker */}</div>
        <nav className="flex w-full flex-1 flex-col justify-center gap-2">
          {tabs.map(
            ({ to, label, icon: Icon, exactPath, isActivity, fill }) => {
              const isActive = exactPath
                ? pathname === to
                : pathname.startsWith(to)

              return (
                <Tooltip key={to}>
                  <TooltipTrigger
                    render={
                      <Link
                        to={to}
                        className={cn(
                          "flex-center relative aspect-square w-full",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      />
                    }
                  >
                    {isActivity && hasUnread && (
                      <Badge className="bg-destructive! absolute top-0 right-0 text-white!">
                        {count}
                      </Badge>
                    )}
                    <Icon
                      size={24}
                      fill={isActive && fill ? "currentColor" : "transparent"}
                      strokeWidth={isActive && !fill ? 3 : 2}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    {label}
                  </TooltipContent>
                </Tooltip>
              )
            },
          )}
        </nav>
      </aside>

      {/* Main content */}
      <section className="relative flex h-dvh flex-1 flex-col overflow-y-auto">
        <Header />
        <main className="main-content relative flex-1 [&>section]:p-4">
          <Outlet />
        </main>

        {/* Bottom bar — mobile only */}
        <nav className="bottom-bar bg-background sticky right-0 bottom-0 left-0 z-1000 flex h-max border-t md:hidden">
          {tabs.map(
            ({ to, label, icon: Icon, exactPath, isActivity, fill }) => {
              const isActive = exactPath
                ? pathname === to
                : pathname.startsWith(to)

              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "bottom-tab text-foreground flex-center h-14 flex-1 flex-col gap-0.5 text-xs",
                    isActive ? "font-bold" : "",
                  )}
                >
                  <span className="relative size-max">
                    {isActivity && hasUnread && (
                      <Badge className="bg-destructive! absolute -top-1 -right-3/4 px-1.5! text-white!">
                        {count}
                      </Badge>
                    )}

                    <Icon
                      size={24}
                      fill={isActive && fill ? "currentColor" : "transparent"}
                      strokeWidth={isActive && !fill ? 3 : 2}
                    />
                  </span>
                  <span>{label}</span>
                </Link>
              )
            },
          )}
        </nav>
      </section>
    </div>
  )
}
