import type { CollectionListData } from "#/server/collections"
import { Link } from "@tanstack/react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { cn } from "#/lib/utils"
import { Badge } from "../ui/badge"
import type { ServerSession } from "#/lib/types"
import { HugeiconsIcon } from "@hugeicons/react"
import { AuthorInfo } from "./author-info"
import { File02Icon } from "@hugeicons/core-free-icons"
import { Skeleton } from "../ui/skeleton"

function CollectionCardSkeleton() {
  return (
    <Card size="sm" className="pt-0!">
      <div>
        <Skeleton className="aspect-2/1 w-full" />
      </div>
      <CardHeader>
        <Skeleton className="h-13.75 w-full rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

function CollectionCard({
  collection,
  session,
}: {
  collection: CollectionListData
  session: ServerSession
}) {
  const {
    author,
    bannerUrl,
    contributors,
    id: collectionId,
    name,
    saves,
    tags,
    _count,
  } = collection
  if (!session) return <CollectionCardSkeleton />

  const isMine = session.user.id === author.id
  const isSaved = saves.length > 0

  return (
    <Card size="sm" key={collectionId} className="pt-0!">
      <Link
        to="/collections/$collectionId"
        params={{ collectionId }}
        className="contents"
      >
        <div className={cn("card-img", !bannerUrl && "card-img-fallback")}>
          <img
            src={bannerUrl ?? "/card-loading-skeleton-unsplash.jpg"}
            alt={name}
            draggable={false}
          />
          {(isMine || isSaved) && (
            <Badge
              className={cn(
                "text-foreground dark:text-background absolute top-2 right-2",
                !isMine ? "bg-amber-300" : "bg-blue-300",
              )}
            >
              {isMine ? "created" : isSaved ? "saved" : ""}
            </Badge>
          )}
        </div>
      </Link>
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-1">{name}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          {tags.slice(0, 3).map((tag, tagIndex) => (
            <Badge
              key={`${tag.tagId}-${tagIndex}`}
              className="h-max px-2 py-1 text-xs"
              variant="secondary"
            >
              {tag.tag.name}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge className="h-max py-1 text-xs" variant="outline">
              +{tags.length - 3}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-between py-0!">
        <AuthorInfo
          author={author}
          contributors={contributors}
          bg="card"
          className="flex-1 items-center gap-2 overflow-x-hidden"
        />

        <div className="flex-center text-muted-foreground gap-1 text-xs sm:text-sm">
          <HugeiconsIcon icon={File02Icon} size={16} />
          <span>
            {_count.pages} page{_count.pages !== 1 && "s"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export { CollectionCardSkeleton, CollectionCard }
