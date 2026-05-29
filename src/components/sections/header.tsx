import type { JSX } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useRouteContext, Link } from "@tanstack/react-router"
import type { ServerSession } from "#/lib/types"
import { useHeaderStore } from "#/lib/header-store"
import { Button } from "../ui/button"
import { useTheme } from "../theme-provider"

function AvatarBtn({ session }: { session: ServerSession }) {
  if (!session)
    return (
      <Button
        size="sm"
        nativeButton={false}
        render={<Link to="/auth/sign-up" />}
      >
        Sign in
      </Button>
    )

  const { username, image } = session.user

  return (
    <Avatar>
      <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
      <AvatarImage src={image ?? ""} alt={username} />
    </Avatar>
  )
}

export function Header(): JSX.Element {
  const { session } = useRouteContext({ from: "/_app" })
  const { rightSlot } = useHeaderStore()
  const { resolvedTheme: theme, setTheme } = useTheme()

  return (
    <header className="flex-between bg-background sticky top-0 z-1000 h-12 shrink-0 px-4 py-2">
      <span className="font-heading text-2xl font-extrabold">Decker</span>
      <div className="flex items-center gap-2">
        {rightSlot}
        <Button
          variant="ghost"
          size="icon-lg"
          className="rounded-full"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6!"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M12 3l0 18" />
            <path d="M12 9l4.65 -4.65" />
            <path d="M12 14.3l7.37 -7.37" />
            <path d="M12 19.6l8.85 -8.85" />
          </svg>
        </Button>
        <AvatarBtn session={session} />
      </div>
    </header>
  )
}
