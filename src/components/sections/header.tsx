import type { JSX } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useRouteContext } from "@tanstack/react-router"
import type { ServerSession } from "#/routes/__root"
import { useHeaderStore } from "#/lib/header-store"
import { Button } from "../ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings02Icon } from "@hugeicons/core-free-icons"

function AvatarBtn({ session }: { session: ServerSession }) {
  if (!session)
    return (
      <Avatar>
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    )

  const { username, image } = session.user

  return (
    <Avatar>
      <AvatarFallback>{username.charAt(0)}</AvatarFallback>
      <AvatarImage src={image ?? ""} alt={username} />
    </Avatar>
  )
}

export function Header(): JSX.Element {
  const { session } = useRouteContext({ from: "/_app" })
  const { rightSlot } = useHeaderStore()

  return (
    <header className="flex-between bg-background sticky top-0 z-1000 h-14 shrink-0 p-4">
      <AvatarBtn session={session} />

      <div className="flex items-center gap-2">
        {rightSlot ? (
          rightSlot
        ) : (
          <Button variant="outline" size="icon-lg">
            <HugeiconsIcon icon={Settings02Icon} className="size-5!" />
          </Button>
        )}
      </div>
    </header>
  )
}
