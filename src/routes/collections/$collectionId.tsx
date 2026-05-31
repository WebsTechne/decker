import { Spinner } from "#/components/ui/spinner"
import { getCollectionById } from "#/server/collections"
import {
  Bookmark02Icon,
  Comment01Icon,
  File02Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useParams } from "@tanstack/react-router"

export const Route = createFileRoute("/collections/$collectionId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { collectionId } = useParams({ from: "/collections/$collectionId" })
  const { data: collection, isLoading: isLoadingCollection } = useQuery({
    queryKey: ["collection", collectionId],
    queryFn: () => getCollectionById({ data: { collectionId } }),
  })

  if (isLoadingCollection)
    return (
      <div className="flex-center h-dvh">
        <Spinner />
      </div>
    )
  if (!collection) return <div>Collection not found</div>

  const {
    pages,
    _count: { comments: commentsCount, pages: pagesCount, saves: savesCount },
  } = collection

  return (
    <div className="flex h-dvh">
      {/* sidebar in larger screens */}
      <aside className="sidebar z-1010 hidden flex-col">
        <ul className="flex-center h-full w-full flex-col gap-20 px-4">
          <span className="text-muted-foreground flex flex-col items-center justify-start gap-1 select-none">
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
      </aside>

      {/* body */}
      <section className="relative flex h-dvh flex-1 flex-col overflow-y-auto md:px-4">
        <header></header>
        <main className="relative flex-1 pb-4">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
            {pages.map((page, i) => (
              <div
                key={page.id}
                className="bg-muted dark:bg-card relative flex cursor-pointer items-center"
              >
                <img
                  src={page.imageUrl}
                  alt={`Collection: ${collection.name} Page: ${i + 1}`}
                  className="object-contain"
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
          <ul className="flex-between h-12 w-full gap-10 px-4">
            <span className="text-muted-foreground flex flex-1 items-center justify-start gap-1 select-none">
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
  )
}
