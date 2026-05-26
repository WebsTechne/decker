import { Header } from "#/components/sections/header"
import { getSession } from "#/lib/auth-session"
import { cn } from "#/lib/utils"
import {
  createFileRoute,
  Outlet,
  Link,
  useRouterState,
  useLocation,
} from "@tanstack/react-router"
import { Bookmark, Bell, Search, Plus } from "lucide-react"

export const Route = createFileRoute("/_app")({
  component: AppLayout,
  beforeLoad: async () => {
    const session = await getSession()
    return { session }
  },
})

const tabs = [
  { to: "/", label: "Library", icon: Bookmark, fill: true, exactPath: true },
  { to: "/activity", label: "Activity", icon: Bell, fill: true },
  { to: "/explore", label: "Explore", icon: Search },
  { to: "/upload", label: "Upload", icon: Plus },
]

function AppLayout() {
  const { location } = useRouterState()

  const { pathname } = useLocation()

  return (
    <div className="app-shell flex h-dvh!">
      {/* Sidebar — desktop only */}
      <aside className="sidebar hidden">
        <div className="sidebar-logo">Decker</div>
        <nav className="sidebar-nav">
          {tabs.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`sidebar-tab ${location.pathname === to ? "active" : ""}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <section className="relative flex h-dvh flex-1 flex-col overflow-y-auto">
        <Header />
        <main className="main-content relative [&>section]:p-4">
          <Outlet />
        </main>

        {/* Bottom bar — mobile only */}
        <nav className="bottom-bar bg-background sticky right-0 bottom-0 left-0 z-1000 flex h-max border-t md:hidden">
          {tabs.map(({ to, label, icon: Icon, exactPath, fill }) => {
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
                <Icon
                  size={24}
                  fill={isActive && fill ? "currentColor" : "transparent"}
                  strokeWidth={isActive && !fill ? 3 : 2}
                />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </section>
    </div>
  )
}
