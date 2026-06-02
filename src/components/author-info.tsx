import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "./ui/avatar"
import { File02Icon } from "@hugeicons/core-free-icons"
import type { Author, Contributor } from "#/routes/collections/$collectionId"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Link } from "@tanstack/react-router"
import { cn } from "#/lib/utils"

const AuthorInfo = ({
  author,
  contributors,
  className,
  bg = "background",
}: {
  author: Author
  contributors: Contributor[]
  className?: string
  bg?: "background" | "card"
}) => {
  const hasContributors = contributors.length > 0
  const allContributors = hasContributors
    ? [{ user: author }, ...contributors]
    : null

  return (
    <div className={cn("flex", className)}>
      {hasContributors ? (
        <Popover>
          <PopoverTrigger
            nativeButton={false}
            render={
              <AvatarGroup
                className={cn(
                  "cursor-pointer",
                  bg === "card"
                    ? "*:data-[slot=avatar]:ring-card"
                    : "*:data-[slot=avatar]:ring-background",
                )}
              />
            }
          >
            {allContributors!.map((c, i) => (
              <Avatar key={c.user.username + i} className="size-7">
                {c.user.image && (
                  <AvatarImage src={c.user.image} alt={c.user.username} />
                )}
                <AvatarFallback>
                  {c.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </PopoverTrigger>
          <PopoverContent className="w-max rounded-lg! p-2!">
            <div className="flex flex-col gap-1">
              {allContributors!.map((c) => (
                <Link
                  key={c.user.id}
                  to={`/u/$username`}
                  params={{ username: c.user.username }}
                  className="hover:bg-muted flex items-start gap-2 rounded-md p-2"
                >
                  <Avatar className="size-6">
                    {c.user.image && (
                      <AvatarImage src={c.user.image} alt={c.user.username} />
                    )}
                    <AvatarFallback>
                      {c.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start justify-center gap-1">
                    <span>{c.user.username}</span>
                    <span className="text-muted-foreground text-sm">
                      {c.user.school?.name} • {c.user.department?.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Popover>
          <PopoverTrigger
            nativeButton={false}
            render={<Avatar className="size-7" />}
          >
            {author.image && (
              <AvatarImage src={author.image} alt={author.username} />
            )}
            <AvatarFallback>
              {author.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </PopoverTrigger>
          <PopoverContent className="w-max rounded-lg! p-2!">
            <Link
              key={author.id}
              to="/u/$username"
              params={{ username: author.username }}
              className="hover:bg-muted flex items-center gap-2 rounded-md p-2"
            >
              <Avatar className="size-7">
                {author.image && (
                  <AvatarImage src={author.image} alt={author.username} />
                )}
                <AvatarFallback>
                  {author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start justify-center gap-1">
                <span>{author.username}</span>
                <span className="text-muted-foreground text-sm">
                  {author.school?.name} • {author.department?.name}
                </span>
              </div>
            </Link>
          </PopoverContent>
        </Popover>
      )}
      {hasContributors ? (
        <span>
          {author.username} +{contributors.length}
        </span>
      ) : (
        <Link
          className="underline-offset-4 hover:underline"
          to="/u/$username"
          params={{ username: author.username }}
        >
          {author.username}
        </Link>
      )}
    </div>
  )
}

export { AuthorInfo }
