import { useTheme } from "#/components/theme-provider"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "#/components/ui/avatar"
import { Badge } from "#/components/ui/badge"
import { Button } from "#/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover"
import { Spinner } from "#/components/ui/spinner"
import { authClient } from "#/lib/auth-client"
import { cn } from "#/lib/utils"
import {
  getCollectionById,
  toggleSaveCollection,
  type CollectionData,
} from "#/server/collections"
import {
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  Bookmark02Icon,
  Comment01Icon,
  File02Icon,
  PencilEdit02Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  useParams,
  Link,
  useRouter,
} from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export const Route = createFileRoute("/collections/$collectionId")({
  component: RouteComponent,
})

const ThemeToggle = ({ className }: { className?: string }) => {
  const { resolvedTheme: theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className={cn("rounded-full", className)}
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
  )
}

export type Author = {
  id: string
  image: string | null
  username: string
  school: {
    id: string
    name: string
  } | null
  department: {
    id: string
    name: string
  } | null
}
export type Contributor = { user: Author }

const AuthorInfo = ({
  author,
  contributors,
}: {
  author: Author
  contributors: Contributor[]
}) => {
  const hasContributors = contributors.length > 0
  const allContributors = hasContributors
    ? [{ user: author }, ...contributors]
    : null

  return (
    <div className="flex w-full items-center gap-2 py-2">
      {hasContributors ? (
        <Popover>
          <PopoverTrigger
            nativeButton={false}
            render={<AvatarGroup className="cursor-pointer" />}
          >
            {allContributors!.map((c, i) => (
              <Avatar key={c.user.username + i}>
                {c.user.image && (
                  <AvatarImage src={c.user.image} alt={c.user.username} />
                )}
                <AvatarFallback>
                  {author.username.charAt(0).toUpperCase()}
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
          {" "}
          <PopoverTrigger nativeButton={false} render={<Avatar />}>
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

const CollectionInfo = ({
  collection,
  author,
  contributors,
}: {
  collection: CollectionData
  author: Author
  contributors: Contributor[]
}) => (
  <div
    className={cn(
      "relative z-3 flex w-full flex-col gap-2",
      "px-3 pt-2 md:p-0!",
    )}
  >
    <h1 className={cn("font-heading font-bold", "text-2xl md:text-4xl!")}>
      {collection.name}
    </h1>
    <p className={cn("text-muted-foreground", "text-sm md:text-lg!")}>
      {collection.description}
    </p>
    <div className="flex flex-wrap gap-2">
      {collection.tags.map((tag) => (
        <Badge
          key={tag.tagId}
          variant="secondary"
          className="not-dark:bg-muted px-2 py-2!"
        >
          {tag.tag.name}
        </Badge>
      ))}
    </div>
    <AuthorInfo author={author} contributors={contributors} />
  </div>
)

function RouteComponent() {
  const router = useRouter()
  const { data: session, isPending: authPending } = authClient.useSession()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const { collectionId } = useParams({ from: "/collections/$collectionId" })
  const { data: collection, isPending } = useQuery({
    queryKey: ["collection", collectionId],
    queryFn: () => getCollectionById({ data: { collectionId } }),
    enabled: !!session && !authPending,

    staleTime: Infinity,
  })

  const [isSaved, setSaved] = useState(false)

  useEffect(() => {
    if (collection) {
      setSaved(collection.saves.length > 0)
    }
  }, [collection])

  useEffect(() => {
    if (lightboxIndex === null || !collection?.pages) return

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          setLightboxIndex(null)
          break

        case "ArrowLeft":
          setLightboxIndex((prev) =>
            prev !== null
              ? (prev - 1 + collection.pages.length) % collection.pages.length
              : null,
          )
          break

        case "ArrowRight":
          setLightboxIndex((prev) =>
            prev !== null ? (prev + 1) % collection.pages.length : null,
          )
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [lightboxIndex, collection?.pages])

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

  if (!collection)
    return (
      <div className="flex-center h-dvh px-5">
        <button
          className="fixed top-4 left-4 md:hidden"
          onClick={() => router.history.back()}
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} />
        </button>
        <div>
          <h1 className="font-heading mb-2 text-4xl font-bold">
            Collection not found :(
          </h1>
          <p className="text-muted-foreground max-w-prose text-base md:text-lg">
            This collection may have been deleted, made private, or the link may
            be incorrect. Browse other collections on the{" "}
            <Link
              to="/explore"
              className="text-foreground! whitespace-nowrap underline underline-offset-4"
            >
              Explore page
            </Link>
          </p>
        </div>
      </div>
    )

  const actionNotAvailable = () => {
    toast("This action is not available")
  }

  const handleToggleSave = async () => {
    if (isMine) return

    const previousValue = isSaved

    // optimistic update
    setSaved(!previousValue)

    try {
      await toggleSaveCollection({ data: { collectionId } })
    } catch {
      // rollback if server fails
      setSaved(previousValue)
      toast.error("Failed to update save")
    }
  }

  const {
    author,
    contributors,
    pages,
    _count: {
      comments: commentsCount,
      pages: pagesCount,
      saves: rawSavesCount,
    },
  } = collection

  const savesCount =
    rawSavesCount + (isSaved ? 1 : 0) - (collection.saves.length > 0 ? 1 : 0)

  const isMine = session.user.id === author.id

  return (
    <>
      <div className="flex h-dvh">
        {/* sidebar in larger screens */}
        <aside className="sidebar relative z-1010 hidden flex-col">
          <div className="flex-center">
            <Button
              variant="ghost"
              size="icon-lg"
              className=""
              onClick={() => router.history.back()}
            >
              <HugeiconsIcon
                icon={ArrowLeft02Icon}
                strokeWidth={2}
                className="size-6!"
              />
            </Button>
          </div>

          <ul className="flex-center h-full w-full flex-1 flex-col gap-10 px-4">
            <span className="bg-muted/40 text-muted-foreground flex flex-col items-center justify-start gap-1 rounded-full border p-2 select-none">
              <HugeiconsIcon icon={File02Icon} strokeWidth={2} />
              {pagesCount}
            </span>
            <button className="flex flex-col items-center gap-1">
              <HugeiconsIcon icon={Comment01Icon} strokeWidth={2} />
              {commentsCount}
            </button>
            <button
              className="disabled:text-muted-foreground flex flex-col items-center gap-1"
              disabled={isMine}
              onClick={handleToggleSave}
            >
              <HugeiconsIcon
                icon={Bookmark02Icon}
                strokeWidth={2}
                fill={isSaved ? "var(--foreground)" : "transparent"}
              />
              {savesCount}
            </button>
            <button className="flex flex-col items-center gap-1">
              <HugeiconsIcon icon={Share08Icon} strokeWidth={2} />
            </button>
          </ul>

          <div className="flex-center flex-col gap-2">
            {isMine && (
              <Button
                variant="ghost"
                size="icon-lg"
                onClick={actionNotAvailable}
              >
                <HugeiconsIcon
                  icon={PencilEdit02Icon}
                  strokeWidth={2}
                  className="size-6!"
                />
              </Button>
            )}{" "}
            <ThemeToggle className="" />
          </div>
        </aside>

        {/* body */}
        <section className="relative flex h-dvh flex-1 flex-col overflow-y-auto">
          {/* Mobile Header */}
          <div className="md:hidden">
            <header className="bg-background flex-between sticky top-0 z-1000 h-12 shrink-0">
              <Button
                variant="ghost"
                size="icon-lg"
                onClick={() => router.history.back()}
              >
                <HugeiconsIcon
                  icon={ArrowLeft02Icon}
                  strokeWidth={2}
                  className="size-6!"
                />
              </Button>

              <section className="flex items-center gap-2">
                {isMine && (
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    onClick={actionNotAvailable}
                  >
                    <HugeiconsIcon
                      icon={PencilEdit02Icon}
                      strokeWidth={2}
                      className="size-6!"
                    />
                  </Button>
                )}
                <ThemeToggle />
              </section>
            </header>

            <section className="flex flex-col pt-1 md:flex-row! md:px-4">
              <div
                className={cn(
                  "card-img mx-auto w-[calc(100%-20px)]! rounded-md",
                  !collection.bannerUrl && "card-img-fallback",
                )}
              >
                <img
                  src={
                    collection.bannerUrl ??
                    "/card-loading-skeleton-unsplash.jpg"
                  }
                  loading="eager"
                  alt={collection.name}
                />
              </div>
              <CollectionInfo
                collection={collection}
                author={author}
                contributors={contributors}
              />
            </section>
          </div>

          {/* Desktop Header */}
          <section className="relative hidden items-center gap-10 p-5 md:flex">
            {/* <div className="to-background absolute inset-0 z-2 bg-linear-to-b from-transparent" />
            <div
              className={cn(
                "bg-muted-foreground dark:bg-secondary! card-img absolute inset-0 z-1 aspect-auto! *:h-full! *:w-full!",
                !collection.bannerUrl && "card-img-fallback",
              )}
            >
              <img
                src={
                  collection.bannerUrl ?? "/card-loading-skeleton-unsplash.jpg"
                }
                className="blur-xl"
                alt="Collection Banner"
                loading="eager"
              />
            </div> */}

            <div
              className={cn(
                "card-img relative z-3 max-w-lg overflow-clip rounded-md shadow-md",
                !collection.bannerUrl && "card-img-fallback",
              )}
            >
              <img
                src={
                  collection.bannerUrl ?? "/card-loading-skeleton-unsplash.jpg"
                }
                alt="Collection Banner"
                loading="eager"
              />
            </div>

            <CollectionInfo
              collection={collection}
              author={author}
              contributors={contributors}
            />
          </section>

          <main className="relative flex-1 md:px-4">
            <div className="columns-1 gap-1 sm:columns-2 md:gap-2 lg:columns-3 2xl:columns-4">
              {pages.map((page, i) => (
                <div
                  key={page.id}
                  className="bg-muted dark:bg-card relative mb-1 cursor-pointer break-inside-avoid md:mb-2"
                  onClick={() => setLightboxIndex(i)}
                  style={
                    page.width && page.height
                      ? {
                          paddingBottom: `${(page.height / page.width) * 100}%`,
                        }
                      : { paddingBottom: "133%" } // fallback 3:4 ratio
                  }
                >
                  <img
                    src={page.imageUrl}
                    alt={`Page: ${i + 1}`}
                    loading="lazy"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    className="absolute inset-0 w-full object-contain"
                  />
                  <span className="font-heading absolute right-2 bottom-2 rounded-md bg-black/60 px-2 py-1 text-xs font-bold text-white">
                    {i < 10 && "0"}
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </main>
          <nav className="bg-background sticky right-0 bottom-0 left-0 z-1000 flex h-max border-t md:hidden">
            <ul className="flex-evenly h-12 w-full gap-10 px-4 py-2">
              <span className="bg-muted/40 text-muted-foreground flex items-center justify-start gap-1 rounded-full border p-1 px-3! select-none">
                <HugeiconsIcon icon={File02Icon} strokeWidth={2} />
                {pagesCount}
              </span>
              <button className="flex items-center gap-1">
                <HugeiconsIcon icon={Comment01Icon} strokeWidth={2} />
                {commentsCount}
              </button>
              <button
                className="disabled:text-muted-foreground flex items-center gap-1"
                disabled={isMine}
                onClick={handleToggleSave}
              >
                <HugeiconsIcon
                  icon={Bookmark02Icon}
                  fill={isSaved ? "var(--foreground)" : "transparent"}
                  strokeWidth={2}
                />
                {savesCount}
              </button>
              <button className="flex items-center gap-1">
                <HugeiconsIcon icon={Share08Icon} strokeWidth={2} />
              </button>
            </ul>
          </nav>
        </section>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxIndex(null)}
        >
          <img
            src={pages[lightboxIndex].imageUrl}
            alt={`page ${lightboxIndex + 1}`}
            className="max-h-[90dvh] max-w-[calc(100dvw-16px)] rounded-lg object-contain"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
          />
          {/* prev/next */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-1 left-1 disabled:pointer-events-auto! md:top-1/2 md:left-4 md:-translate-y-1/2"
            disabled={!(lightboxIndex > 0)}
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex(lightboxIndex - 1)
            }}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="size-5!"
              strokeWidth={2}
            />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="absolute right-1 bottom-1 disabled:pointer-events-auto! md:top-1/2 md:right-4 md:-translate-y-1/2"
            disabled={!(lightboxIndex < pages.length - 1)}
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex(lightboxIndex + 1)
            }}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="size-5!"
              strokeWidth={2}
            />
          </Button>
          <span className="flex-center absolute bottom-0 h-10 text-sm text-white">
            {lightboxIndex + 1} / {pages.length}
          </span>
        </div>
      )}
    </>
  )
}
