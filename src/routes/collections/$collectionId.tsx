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
import { getCollectionById } from "#/server/collections"
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
  useNavigate,
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

type Author = {
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
type Collaborator = { user: Author }

const AuthorInfo = ({
  author,
  collaborators,
}: {
  author: Author
  collaborators: Collaborator[]
}) => {
  const hasCollaborators = collaborators.length > 0
  const allContributors = hasCollaborators
    ? [{ user: author }, ...collaborators]
    : null

  return (
    <div className="flex w-full items-center gap-2 py-2">
      {hasCollaborators ? (
        <Popover>
          <PopoverTrigger
            nativeButton={false}
            render={<AvatarGroup className="cursor-pointer" />}
          >
            {allContributors!.map((c) => (
              <Avatar key={c.user.id}>
                <AvatarImage src={c.user.image ?? ""} alt={c.user.username} />
                <AvatarFallback>
                  {c.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </PopoverTrigger>
        </Popover>
      ) : (
        // <Avatar>
        //   <AvatarImage src={author.image ?? ""} alt={author.username} />
        //   <AvatarFallback>
        //     {author.username.charAt(0).toUpperCase()}
        //   </AvatarFallback>
        // </Avatar>
        <Popover>
          <PopoverTrigger
            nativeButton={false}
            render={<AvatarGroup className="cursor-pointer" />}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <Avatar key={author.username + i}>
                <AvatarImage src={author.image ?? ""} alt={author.username} />
                <AvatarFallback>
                  {author.username.charAt(i).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </PopoverTrigger>
          <PopoverContent className="w-max rounded-lg! p-2!">
            <div className="flex flex-col gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Link
                  to={`/u/${author.username}`}
                  className="hover:bg-muted flex items-start gap-2 rounded-md p-2"
                >
                  <Avatar className="size-6">
                    <AvatarImage
                      src={author.image ?? ""}
                      alt={author.username}
                    />
                    <AvatarFallback>
                      {author.username.charAt(i).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start justify-center gap-1">
                    <span>{author.username}</span>
                    <span className="text-muted-foreground text-sm">
                      {author.school?.name} • {author.department?.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
      {!hasCollaborators ? (
        <span>
          {author.username} +{collaborators.length}
        </span>
      ) : (
        <Link
          className="underline-offset-4 hover:underline"
          to={`/u/${author.username}`}
        >
          {author.username}
        </Link>
      )}
    </div>
  )
}

function RouteComponent() {
  const navigate = useNavigate()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!isPending && !session) {
      navigate({ to: "/auth/sign-in" })
    }
  }, [session, isPending, navigate])

  const { collectionId } = useParams({ from: "/collections/$collectionId" })
  const { data: collection, isLoading: isLoadingCollection } = useQuery({
    queryKey: ["collection", collectionId],
    queryFn: () => getCollectionById({ data: { collectionId } }),
  })

  if (isLoadingCollection)
    return (
      <div className="flex-center h-dvh">
        <Spinner className="size-7" />
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
            Collection not found
          </h1>
          <p className="text-muted-foreground max-w-prose text-base md:text-lg">
            Collection with ID{" "}
            <code className="bg-muted rounded-sm px-1 font-mono text-sm md:text-base">
              {collectionId}
            </code>{" "}
            not found. You can explore all available collections on the{" "}
            <Link
              to="/explore"
              className="text-foreground! underline underline-offset-4"
            >
              Explore page
            </Link>
            .
          </p>
        </div>
      </div>
    )

  const actionNotAvailable = () => {
    toast("This action is not available")
  }

  const {
    author,
    collaborators,
    pages,
    _count: { comments: commentsCount, pages: pagesCount, saves: savesCount },
  } = collection

  const isMine = session?.user.id === author.id

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
            <button className="flex flex-col items-center gap-1">
              <HugeiconsIcon icon={Bookmark02Icon} strokeWidth={2} />
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
            <header className="bg-background flex-between sticky top-0 z-1000 h-12 shrink-0 border-b">
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
            <section className="flex flex-col sm:flex-row! md:px-4">
              <div
                className={cn(
                  "card-img",
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
              <div className="flex w-full flex-col px-3 pt-2">
                <h1 className="font-heading text-2xl font-bold md:text-3xl">
                  {collection.name}
                </h1>
                <p className="text-muted-foreground mb-2 text-sm md:text-lg!">
                  {collection.description}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {collection.tags.map((tag) => (
                    <Badge
                      key={tag.tagId}
                      variant="secondary"
                      className="not-dark:bg-muted px-2 py-2! text-sm"
                    >
                      {tag.tag.name}
                    </Badge>
                  ))}
                </div>

                <AuthorInfo author={author} collaborators={collaborators} />
              </div>
            </section>
          </div>

          {/* Desktop Header */}
          <section className="relative hidden items-center gap-10 p-5 md:flex">
            {/* <div className="to-background absolute inset-0 -inset-be-72 z-2 bg-linear-to-b from-transparent" />
          <div className="bg-muted-foreground dark:bg-secondary! card-img absolute inset-0 -inset-be-72 z-1 aspect-auto! *:h-full! *:w-full!">
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
            <div className="relative z-3 flex flex-1 flex-col gap-2">
              <div>
                <h1 className="font-heading mb-1 text-4xl font-bold">
                  {collection.name}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {collection.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {collection.tags.map((tag) => (
                  <Badge
                    key={tag.tagId}
                    variant="secondary"
                    className="not-dark:bg-muted px-2 py-2! text-sm"
                  >
                    {tag.tag.name}
                  </Badge>
                ))}
              </div>

              <AuthorInfo author={author} collaborators={collaborators} />
            </div>
          </section>

          <main className="relative flex-1 md:px-4">
            <div className="columns-1 gap-1 sm:columns-2 md:gap-2 lg:columns-3 2xl:columns-4">
              {pages.map((page, i) => (
                <div
                  key={page.id}
                  className="bg-muted dark:bg-card md: relative mb-1 cursor-pointer break-inside-avoid md:mb-2"
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
              <button className="flex items-center gap-1">
                <HugeiconsIcon icon={Bookmark02Icon} strokeWidth={2} />
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
            onClick={(e) => e.stopPropagation()}
            draggable={false}
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
