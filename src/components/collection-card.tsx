import type { CollectionListData } from "#/server/collections"
import { Link } from "@tanstack/react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { cn } from "#/lib/utils"
import { Badge } from "./ui/badge"
import type { ServerSession } from "#/lib/types"
import { HugeiconsIcon } from "@hugeicons/react"
import { AuthorInfo } from "./author-info"
import { File02Icon } from "@hugeicons/core-free-icons"

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
  const isMine = session!.user.id === author.id
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
          />
          {(isMine || isSaved) && (
            <Badge
              className={cn(
                "text-foreground dark:text-background absolute top-2 right-2",
                !isMine ? "bg-amber-300" : "bg-blue-300",
              )}
            >
              {isMine ? "created" : "saved"}
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
        {/* <div className="flex flex-1 items-center gap-1 overflow-x-hidden">
          <Avatar className="size-7">
            {author.image && (
              <AvatarImage src={author.image} alt={author.username} />
            )}
            <AvatarFallback>
              {author.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="flex-1 truncate">{author.username}</span>
        </div> */}
        <AuthorInfo
          author={author}
          contributors={contributors}
          bg="card"
          className="flex-1 items-center gap-1 overflow-x-hidden"
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

export { CollectionCard }
