import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "#/components/ui/avatar"
import { Button } from "#/components/ui/button"
import { Spinner } from "#/components/ui/spinner"
import { authClient } from "#/lib/auth-client"
import { cn } from "#/lib/utils"
import { getProfileByUsername } from "#/server/profile"
import {
  ArrowLeft02Icon,
  Edit02Icon,
  File02Icon,
} from "@hugeicons/core-free-icons"
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

  const { image, collections, displayUsername, department, school } = profile

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

      <main className="pb-4">
        <div className="bg-card flex-center relative h-50">
          <span className="bg-primary absolute inset-0 rounded-b-2xl" />
          <div className="bg-background absolute top-37.5 left-5 size-25 rounded-full p-1">
            <Avatar className="size-full">
              {profile.image && (
                <AvatarImage src={profile.image} alt="avatar" />
              )}
              <AvatarFallback className="text-2xl!">
                {username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="bg-card mb-4 flex flex-col gap-2 p-4 pt-14.5">
          <span className="font-heading text-lg font-semibold">
            {displayUsername}
          </span>

          <p className="text-muted-foreground mb-2 text-sm">
            {school?.name ?? "No school"} •{" "}
            {department?.name ?? "No department"}
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

        <p className="text-muted-foreground px-4 py-2">Collections</p>
        <section className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {collections.map((col) => {
            const { id: collectionId, contributors } = col
            const hasContributors = contributors.length > 0
            const allContributors = hasContributors
              ? [{ user: { image, username } }, ...contributors]
              : null

            return (
              <Link
                key={col.id}
                to="/collections/$collectionId"
                params={{ collectionId }}
                className="relative flex flex-col gap-2 overflow-clip rounded-xl border pb-2"
              >
                <div
                  className={cn(
                    "card-img z-1",
                    !col.bannerUrl && "card-img-fallback",
                  )}
                >
                  <img
                    src={col.bannerUrl ?? "/card-loading-skeleton-unsplash.jpg"}
                    alt={col.name}
                    draggable={false}
                  />
                </div>

                <div className="to-background via-background/60 absolute inset-0 z-2 bg-linear-to-b from-transparent" />

                <div className="absolute bottom-0 z-3 flex w-full flex-col gap-1 p-2">
                  <p className="truncate">{col.name}</p>
                  <div className="flex-between">
                    <AvatarGroup>
                      {allContributors?.map((contributor) => (
                        <Avatar
                          key={contributor.user.username}
                          className="size-6.5"
                        >
                          {contributor.user.image && (
                            <AvatarImage
                              src={contributor.user.image}
                              alt={contributor.user.username}
                            />
                          )}
                          <AvatarFallback>
                            {contributor.user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </AvatarGroup>

                    <div className="flex-center text-muted-foreground gap-1 text-xs sm:text-sm">
                      <HugeiconsIcon icon={File02Icon} size={16} />
                      <span>
                        {col._count.pages} page{col._count.pages !== 1 && "s"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </section>
      </main>
    </div>
  )
}
