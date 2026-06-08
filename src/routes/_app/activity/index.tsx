import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar"
import { Spinner } from "#/components/ui/spinner"
import { getActivities, markActivityRead } from "#/lib/activity"
import { authClient } from "#/lib/auth-client"
import { cn } from "#/lib/utils"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { formatListTimestamp } from "../../../lib/format-timestamp"

export const Route = createFileRoute("/_app/activity/")({
  component: ActivityPage,
})

function ActivityPage() {
  const { data: session, isPending: authPending } = authClient.useSession()
  const queryClient = useQueryClient()

  const { data: activities = [], isPending } = useQuery({
    queryKey: ["activities", "list"],
    queryFn: getActivities,
    enabled: !!session && !authPending,
    staleTime: 1000 * 60 * 5,
  })

  if (authPending)
    return (
      <div className="flex-center h-[calc(100dvh-48px-56px)]">
        <Spinner className="size-7" />
      </div>
    )

  if (!isPending && activities.length < 1)
    return (
      <div className="flex-center h-[calc(100dvh-48px-56px)] px-5">
        <div>
          <h1 className="font-heading mb-2 text-4xl font-bold">
            All quiet here.
          </h1>
          <p className="text-muted-foreground max-w-prose text-base md:text-lg">
            When someone saves or comments on your collections, or a collection
            you follow gets updated, you'll see it here.
          </p>
        </div>
      </div>
    )

  const handleActivityClick = (activityId: string) => {
    // optimistically update cache immediately
    queryClient.setQueryData(["activities"], (old: typeof activities) =>
      old.map((a) => (a.id === activityId ? { ...a, read: true } : a)),
    )

    // fire and forget — server updates in background
    markActivityRead({ data: { activityId } }).catch(() => {
      // rollback on failure
      queryClient.setQueryData(["activities"], (old: typeof activities) =>
        old.map((a) => (a.id === activityId ? { ...a, read: false } : a)),
      )
    })
  }

  return (
    <div className="flex flex-col">
      {activities.map((activity) => {
        const isUnread = !activity.read

        return (
          <Link
            key={activity.id}
            to="/collections/$collectionId"
            params={{ collectionId: activity.collectionId }}
            onClick={() => {
              if (isUnread) handleActivityClick(activity.id)
            }}
            className={cn(
              "flex-center cursor-pointer",
              isUnread
                ? "text-foreground bg-cyan-600/20 font-semibold"
                : "text-muted-foreground",
            )}
          >
            <div className="flex w-full shrink-0 items-center gap-2 overflow-x-clip px-2 py-4 sm:max-w-160 md:max-w-3xl">
              {isUnread && (
                <span className="size-2 shrink-0 grow-0 rounded-full bg-blue-500" />
              )}

              <div className="grid flex-1 grid-cols-[36px_1fr_auto] items-center gap-2">
                <Avatar className="size-9">
                  {activity.actor.image && (
                    <AvatarImage
                      src={activity.actor.image}
                      alt={activity.actor.username}
                    />
                  )}
                  <AvatarFallback>
                    {activity.actor.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="flex-1 truncate text-sm select-none">
                  {activity.body}
                </p>
                <span className="text-muted-foreground! text-sm font-normal!">
                  {formatListTimestamp({
                    createdAt: activity.createdAt,
                    now: new Date(),
                  })}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
