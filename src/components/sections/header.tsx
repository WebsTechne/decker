import type { JSX } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Link, useNavigate } from "@tanstack/react-router"
import type { ServerSession } from "#/lib/types"
import { useHeaderStore } from "#/lib/header-store"
import { Button } from "../ui/button"
import { useTheme } from "../theme-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import { LogoutSquare01Icon, UserCircleIcon } from "@hugeicons/core-free-icons"
import { authClient } from "#/lib/auth-client"
import { toast } from "sonner"

function AvatarBtn({ session }: { session: ServerSession }) {
  const navigate = useNavigate()

  if (!session)
    return (
      <Button
        size="sm"
        nativeButton={false}
        render={<Link to="/auth/sign-in" />}
      >
        Sign in
      </Button>
    )

  const handleSignout = async () => {
    try {
      const res = await authClient.signOut()
      if (res.error) {
        toast.error("Failed to sign out")
        // throw new Error(res.error.message)
      }
      navigate({ to: "/auth/sign-in" })
    } catch (err) {
      toast.error("Failed to sign out")
    }
  }

  const { username, image } = session.user

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton={false}
        render={<Avatar className="cursor-pointer" />}
      >
        <AvatarFallback>
          {(username ?? "").charAt(0).toUpperCase()}
        </AvatarFallback>
        {image && <AvatarImage src={image} alt={username ?? ""} />}
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} className="min-w-37.5">
        <DropdownMenuItem
          render={<Link to="/profile" className="cursor-pointer" />}
        >
          <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onClick={handleSignout}
        >
          <HugeiconsIcon icon={LogoutSquare01Icon} strokeWidth={2} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header(): JSX.Element {
  const { data: session } = authClient.useSession()
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
