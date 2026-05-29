import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="px-4 pb-4">
      <Outlet />
    </main>
  )
}
