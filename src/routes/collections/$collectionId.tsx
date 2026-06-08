import { AuthorInfo } from "#/components/sections/author-info"
import { DropZone } from "#/components/form/drop-zone"
import { ThemeToggle } from "#/components/theme-toggle"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog"
import { Badge } from "#/components/ui/badge"
import { Button } from "#/components/ui/button"
import { Field, FieldGroup } from "#/components/ui/field"
import { Spinner } from "#/components/ui/spinner"
import { authClient } from "#/lib/auth-client"
import { uploadPages } from "#/lib/upload"
import { cn } from "#/lib/utils"
import {
  getCollectionById,
  getSavesSimple,
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
  Plus,
  Share08Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createFileRoute,
  useParams,
  Link,
  useRouter,
  useRouterState,
} from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { CommentsSheet } from "#/components/sections/comment-section"
import { EditCollectionSheet } from "#/components/sections/edit-collection-section"
import { createPages } from "#/server/pages"
import { createActivity } from "#/lib/activity"

export const Route = createFileRoute("/collections/$collectionId")({
  component: CollectionIdComponent,
})

export type Author = {
  id: string
  image: string | null
  username: string
  displayUsername: string | null
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
    <AuthorInfo
      author={author}
      contributors={contributors}
      className="w-full items-center gap-2 py-2"
    />
  </div>
)

function CollectionIdComponent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const routerState = useRouterState()

  const { data: session, isPending: authPending } = authClient.useSession()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [editSectionOpen, setEditSectionOpen] = useState(false)

  const { collectionId } = useParams({ from: "/collections/$collectionId" })
  const { data: collection, isPending } = useQuery({
    queryKey: ["collections", collectionId],
    queryFn: () => getCollectionById({ data: { collectionId } }),
    enabled: !!session && !authPending,

    staleTime: Infinity,
  })

  const [isSaved, setSaved] = useState(false)

  const [orderedPages, setOrderedPages] = useState<CollectionData["pages"]>([])

  // reset when collection data changes (after save/refetch)
  useEffect(() => {
    if (collection) setOrderedPages(collection.pages)
  }, [collection?.pages])

  useEffect(() => {
    if (collection) setSaved(collection.saves.length > 0)
  }, [collection])

  useEffect(() => {
    if (lightboxIndex === null || !orderedPages.length) return

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          setLightboxIndex(null)
          break

        case "ArrowLeft":
          setLightboxIndex((prev) =>
            prev !== null
              ? (prev - 1 + orderedPages.length) % orderedPages.length
              : null,
          )
          break

        case "ArrowRight":
          setLightboxIndex((prev) =>
            prev !== null ? (prev + 1) % orderedPages.length : null,
          )
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [lightboxIndex, orderedPages])

  if (authPending || (!!session && isPending))
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
              search={{ redirect: routerState.location.href }}
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
  const isMine =
    session.user.id === author.id ||
    contributors.some((c) => c.user.id === session.user.id)

  const handleAddPages = async () => {
    if (uploadFiles.length === 0) {
      toast.warning("Add at least one image")
      return
    }

    setIsUploading(true)
    toast.loading("Uploading pages...", { id: "add-pages-toast" })

    try {
      const uploaded = await uploadPages(
        uploadFiles,
        collectionId,
        pages.length,
        (done, total) => {
          toast.loading(`Uploading ${done} of ${total}...`, {
            id: "add-pages-toast",
          })
        },
      )

      const saves = await getSavesSimple({
        data: { collectionId: collection.id },
      })

      const recipientIds = saves
        .map((s) => s.userId)
        .filter((id) => id !== session.user.id)

      await createPages({
        data: {
          collectionId,
          pages: uploaded.map(({ url, position, width, height }) => ({
            imageUrl: url,
            position,
            width,
            height,
          })),
        },
      })

      if (recipientIds.length > 0)
        await createActivity({
          data: {
            type: "PAGE_ADDED",
            recipientIds,
            actorId: session.user.id,
            collectionId: collection.id,
            pageCount: uploadFiles.length,
          },
        })

      toast.dismiss("add-pages-toast")
      toast.success("Pages added!")
      setUploadDialogOpen(false)
      setUploadFiles([])

      // refetch collection to show new pages
      queryClient.invalidateQueries({ queryKey: ["collections", collectionId] })
    } catch (err) {
      console.error(err)
      toast.dismiss("add-pages-toast")
      toast.error("Failed to upload pages")
    } finally {
      setIsUploading(false)
    }
  }

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
              <HugeiconsIcon icon={File02Icon} strokeWidth={1.5} />
              {pagesCount}
            </span>
            <button
              className="flex flex-col items-center gap-1"
              onClick={() => setCommentsOpen(true)}
            >
              <HugeiconsIcon icon={Comment01Icon} strokeWidth={1.5} />
              {commentsCount}
            </button>
            <button
              className="disabled:text-muted-foreground flex flex-col items-center gap-1"
              disabled={isMine}
              onClick={handleToggleSave}
            >
              <HugeiconsIcon
                icon={Bookmark02Icon}
                strokeWidth={1.5}
                fill={!isMine && isSaved ? "var(--foreground)" : "transparent"}
              />
              {savesCount}
            </button>
            <button className="flex flex-col items-center gap-1">
              <HugeiconsIcon icon={Share08Icon} strokeWidth={1.5} />
            </button>
          </ul>

          <div className="flex-center flex-col gap-2">
            {isMine && (
              <Button
                variant="ghost"
                size="icon-lg"
                onClick={() => setEditSectionOpen(true)}
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
                    onClick={() => setEditSectionOpen(true)}
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
              {orderedPages.map((page, i) => (
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
                    {i < 9 && "0"}
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>

            {isMine && (
              <Button
                size="icon-lg"
                className="hover:bg-primary! hover:ring-primary/40 fixed right-4! bottom-4 z-1020 rounded-full shadow-lg not-md:bottom-14 hover:ring-3 active:scale-90 md:size-13!"
                onClick={() => setUploadDialogOpen(true)}
              >
                <HugeiconsIcon
                  icon={Plus}
                  strokeWidth={2}
                  className="size-6!"
                />
              </Button>
            )}
          </main>

          {/* bottombar in smaller screens */}
          <nav className="bg-background sticky right-0 bottom-0 left-0 z-1000 flex h-max border-t md:hidden">
            <ul className="flex-evenly h-12 w-full gap-10 px-4 py-2">
              <span className="bg-muted/40 text-muted-foreground flex items-center justify-start gap-1 rounded-full border p-1 px-3! select-none">
                <HugeiconsIcon icon={File02Icon} strokeWidth={1.5} />
                {pagesCount}
              </span>
              <button
                className="flex items-center gap-1"
                onClick={() => setCommentsOpen(true)}
              >
                <HugeiconsIcon icon={Comment01Icon} strokeWidth={1.5} />
                {commentsCount}
              </button>
              <button
                className="disabled:text-muted-foreground flex items-center gap-1"
                disabled={isMine}
                onClick={handleToggleSave}
              >
                <HugeiconsIcon
                  icon={Bookmark02Icon}
                  fill={
                    !isMine && isSaved ? "var(--foreground)" : "transparent"
                  }
                  strokeWidth={1.5}
                />
                {savesCount}
              </button>
              <button className="flex items-center gap-1">
                <HugeiconsIcon icon={Share08Icon} strokeWidth={1.5} />
              </button>
            </ul>
          </nav>
        </section>
      </div>

      <AlertDialog
        open={uploadDialogOpen}
        onOpenChange={(open) => {
          setUploadDialogOpen(open)
          if (!open) setUploadFiles([])
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add pages</AlertDialogTitle>
          </AlertDialogHeader>
          <FieldGroup>
            <Field>
              <DropZone
                multiple
                startIndex={pages.length}
                onFiles={(files) => setUploadFiles(files)}
              />
            </Field>
          </FieldGroup>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUploading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isUploading || uploadFiles.length === 0}
              onClick={(e) => {
                e.preventDefault()
                handleAddPages()
              }}
            >
              {isUploading ? (
                <>
                  <Spinner /> Uploading...
                </>
              ) : (
                "Upload"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxIndex(null)}
        >
          <img
            src={orderedPages[lightboxIndex].imageUrl}
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
            disabled={!(lightboxIndex < orderedPages.length - 1)}
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
            {lightboxIndex + 1} / {orderedPages.length}
          </span>
        </div>
      )}

      <CommentsSheet
        collectionId={collectionId}
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
      />

      <EditCollectionSheet
        collection={collection}
        open={editSectionOpen}
        onOpenChange={setEditSectionOpen}
        orderedPages={orderedPages}
        onOrderChange={setOrderedPages}
        onPageClick={(index) => setLightboxIndex(index)}
      />
    </>
  )
}
