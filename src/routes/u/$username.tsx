import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar"
import { Button } from "#/components/ui/button"
import { Spinner } from "#/components/ui/spinner"
import { authClient } from "#/lib/auth-client"
import { getProfileByUsername } from "#/server/profile"
import { ArrowLeft02Icon, Edit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  useParams,
  useRouter,
  Link,
} from "@tanstack/react-router"

export const Route = createFileRoute("/u/$username")({
  component: ProfilePage,
})

function ProfilePage() {
  const router = useRouter()
  const { data: session, isPending: authPending } = authClient.useSession()
  const { username } = useParams({ from: "/u/$username" })
  const { data: profile, isPending } = useQuery({
    queryKey: ["profile", username],
    enabled: !!session && !authPending,
    queryFn: () => getProfileByUsername({ data: { username } }),
  })

  if (authPending || isPending)
    return (
      <div className="flex-center h-dvh">
        <Spinner className="size-7" />
      </div>
    )

  if (!session)
    return (
      <div className="flex-center h-dvh px-5">
        <div>
          <h1 className="font-heading mb-2 text-4xl font-bold">
            You aren&apos;t signed in :(
          </h1>
          <p className="text-muted-foreground max-w-prose text-base md:text-lg">
            This collection is only available to signed-in users. Sign in to
            continue. Sign in at the{" "}
            <Link
              to="/auth/sign-in"
              className="text-foreground! whitespace-nowrap underline underline-offset-4"
            >
              Sign in
            </Link>{" "}
            page
          </p>
        </div>
      </div>
    )

  if (!profile) return null

  const totalSavesReceived = profile.collections.reduce(
    (sum, col) => sum + col._count.saves,
    0,
  )

  const isMine = session.user.username === username

  return (
    <div className="relative">
      <header className="flex-between pointer-events-none absolute top-0 z-1000 h-12 w-full px-1">
        <Button
          variant="ghost"
          size="icon-lg"
          className="pointer-events-auto rounded-full"
          onClick={() => router.history.back()}
        >
          <HugeiconsIcon
            icon={ArrowLeft02Icon}
            strokeWidth={2}
            className="size-6!"
          />
        </Button>

        {isMine && (
          <Button
            variant="ghost"
            size="icon-lg"
            className="pointer-events-auto rounded-full"
            onClick={() => {}}
          >
            <HugeiconsIcon
              icon={Edit02Icon}
              strokeWidth={2}
              className="size-5!"
            />
          </Button>
        )}
      </header>

      <main className="">
        <div className="bg-card flex-center relative h-50">
          <span className="bg-primary absolute inset-0 rounded-b-2xl" />
          <div className="bg-background absolute top-37.5 left-5 size-25 rounded-full p-1">
            <Avatar className="size-full">
              {profile.image && (
                <AvatarImage src={profile.image} alt="avatar" />
              )}
              <AvatarFallback className="text-2xl!">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="bg-card flex flex-col gap-2 p-4 pt-14.5">
          <span className="font-heading text-lg font-semibold">{username}</span>

          <p className="text-muted-foreground mb-2 text-sm">
            {profile.school?.name ?? "No school"} •{" "}
            {profile.department?.name ?? "No department"}
          </p>

          <div className="bg-border flex w-9/10 max-w-md gap-px">
            <div className="bg-card flex flex-1 flex-col gap-2 pr-4">
              <span className="text-muted-foreground text-sm">
                Collection{profile._count.collections !== 1 ? "s" : ""}
              </span>
              <span className="font-heading text-xl font-semibold">
                {profile._count.collections}
              </span>
            </div>
            <div className="bg-card flex flex-1 flex-col gap-2 px-4">
              <span className="text-muted-foreground text-sm">
                Contribution{profile._count.contributing !== 1 ? "s" : ""}
              </span>
              <span className="font-heading text-xl font-semibold">
                {profile._count.contributing}
              </span>
            </div>
            <div className="bg-card flex flex-1 flex-col gap-2 px-4">
              <span className="text-muted-foreground text-sm">
                Save{totalSavesReceived !== 1 ? "s" : ""}
              </span>
              <span className="font-heading text-xl font-semibold">
                {totalSavesReceived}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
