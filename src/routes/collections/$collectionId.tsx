import { getCollectionById } from "#/server/collections"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useParams } from "@tanstack/react-router"

export const Route = createFileRoute("/collections/$collectionId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { collectionId } = useParams({ from: "/collections/$collectionId" })
  const { data: collection = {}, isLoading: isLoadingCollection } = useQuery({
    queryKey: `collection${collectionId}`,
    queryFn: getCollectionById({ data: { collectionId } }),
  })

  return (
    <section className="relative flex h-dvh flex-1 flex-col overflow-y-auto">
      <header></header>
      <main className="relative flex-1">{collectionId}</main>
      <nav className="bg-background sticky right-0 bottom-0 left-0 z-1000 flex h-max border-t md:hidden">
        <ul className="flex-evenly h-12 px-4">y</ul>
      </nav>
    </section>
  )
}
