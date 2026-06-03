import { CollectionCard } from "#/components/sections/collection-card"
import { Button } from "#/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "#/components/ui/input-group"
import { Spinner } from "#/components/ui/spinner"
import { authClient } from "#/lib/auth-client"
import { getCollectionList } from "#/server/collections"
import { FilterIcon, SearchIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/_app/explore/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: session, isPending: authPending } = authClient.useSession()
  const [currentFilter, setCurrentFilter] = useState<
    "all" | "created" | "saved"
  >("all")

  const { data: collections, isPending } = useQuery({
    queryKey: ["collectionsList"],
    queryFn: () => getCollectionList(),
    enabled: !!session && !authPending,
    staleTime: 1000 * 60 * 60,
  })

  if (authPending || isPending)
    return (
      <div className="flex-center h-[calc(100dvh-48px-56px)]">
        <Spinner className="size-7" />
      </div>
    )

  if (!collections)
    return (
      <div className="flex-center h-[calc(100dvh-48px-56px)] px-5">
        <div>
          <h1 className="font-heading mb-2 text-4xl font-bold">Ummm...</h1>
          <p className="text-muted-foreground max-w-prose text-base md:text-lg">
            We don&apos;t have any collections yet. But you can make some of
            yours and share with the world from the{" "}
            <Link
              to="/upload"
              className="text-foreground! whitespace-nowrap underline underline-offset-4"
            >
              Upload page
            </Link>
          </p>
        </div>
      </div>
    )

  return (
    <>
      <section className="flex-between gap-2">
        <InputGroup className="h-10 w-full">
          <InputGroupAddon>
            <HugeiconsIcon icon={SearchIcon} className="size-5!" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search collections and tags" />
        </InputGroup>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="lg" className="px-1!" />}
          >
            <HugeiconsIcon icon={FilterIcon} className="size-6!" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Filter list</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={currentFilter}
                onValueChange={setCurrentFilter}
                defaultValue="all"
              >
                <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="created">
                  Created
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="saved">
                  Saved
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            session={session}
          />
        ))}
      </section>
    </>
  )
}
