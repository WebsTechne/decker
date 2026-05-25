import {
  createFileRoute,
  Outlet,
  Link,
  useRouterState,
} from '@tanstack/react-router'
import { Bookmark, Bell, Search, Plus } from 'lucide-react'

export const Route = createFileRoute('/_app')({ component: AppLayout })

const tabs = [
  { to: '/', label: 'Library', icon: Bookmark },
  { to: '/activity', label: 'Activity', icon: Bell },
  { to: '/explore', label: 'Explore', icon: Search },
  { to: '/upload', label: 'Upload', icon: Plus },
]

function AppLayout() {
  const { location } = useRouterState()

  return (
    <div className="app-shell flex h-dvh!">
      {/* Sidebar — desktop only */}
      <aside className="sidebar">
        <div className="sidebar-logo">Decker</div>
        <nav className="sidebar-nav">
          {tabs.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`sidebar-tab ${location.pathname === to ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <section className="relative flex h-dvh flex-1 flex-col overflow-x-auto">
        <header className="flex-between bg-background sticky top-0 z-1000 h-14 shrink-0 border-b p-4"></header>
        <main className="main-content min-h-2/1 p-4">
          <Outlet />
        </main>
      </section>

      {/* Bottom bar — mobile only */}
      <nav className="bottom-bar">
        {tabs.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`bottom-tab ${location.pathname === to ? 'active' : ''}`}
          >
            <Icon size={24} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
