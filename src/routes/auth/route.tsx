import { getSession } from "#/lib/auth-session"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const session = context.session
    if (session) throw redirect({ to: "/" })
  },
})

function RouteComponent() {
  return (
    <main className="px-4 pb-4">
      <Outlet />
    </main>
  )
}
