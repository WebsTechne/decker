import { Spinner } from "#/components/ui/spinner"
import { getCollectionById } from "#/server/collections"
import {
  Bookmark02Icon,
  Comment01Icon,
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
    _count: { comments: commentsCount, pages: pagesCount, saves: savesCount },
  } = collection

  return (
    <section className="relative flex h-dvh flex-1 flex-col overflow-y-auto">
      <header></header>
      <main className="relative flex-1">{collectionId}</main>
      <nav className="bg-background sticky right-0 bottom-0 left-0 z-1000 flex h-max border-t md:hidden">
        <ul className="flex-evenly h-12 w-full px-4">
          <button className="flex items-center gap-1">
            <HugeiconsIcon icon={Comment01Icon} />
            {commentsCount}
          </button>
          <button className="flex items-center gap-1">
            <HugeiconsIcon icon={Bookmark02Icon} />
            {savesCount}
          </button>
          <button className="flex items-center gap-1">
            <HugeiconsIcon icon={Share08Icon} />
          </button>
        </ul>
      </nav>
    </section>
  )
}
