import { Button } from "#/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterIcon, SearchIcon } from "@hugeicons/core-free-icons"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
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
import { useQuery } from "@tanstack/react-query"
import { getMyCollections, getSavedCollections } from "#/server/collections"
import { authClient } from "#/lib/auth-client"
import { Spinner } from "#/components/ui/spinner"
import {
  CollectionCard,
  CollectionCardSkeleton,
} from "#/components/sections/collection-card"

export const Route = createFileRoute("/_app/")({ component: Home })

function Home() {
  const { data: session, isPending: authPending } = authClient.useSession()
  const [currentFilter, setCurrentFilter] = useState<
    "all" | "created" | "saved"
  >("all")

  const { data: libraryCollections = [], isPending } = useQuery({
    queryKey: ["collections", "library"],
    enabled: !!session && !authPending,
    queryFn: async () => {
      const [myCollections, savedCollections] = await Promise.all([
        getMyCollections(),
        getSavedCollections(),
      ])

      return [...myCollections, ...savedCollections].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    },
  })

  if (authPending)
    return (
      <div className="flex-center h-[calc(100dvh-48px-56px)]">
        <Spinner className="size-7" />
      </div>
    )

  if (!isPending && libraryCollections.length < 1)
    return (
      <div className="flex-center h-[calc(100dvh-48px-56px)] px-5">
        <div>
          <h1 className="font-heading mb-2 text-4xl font-bold">Ummm...</h1>
          <p className="text-muted-foreground max-w-prose text-base md:text-lg">
            You haven&apos;t saved or created any collections yet. You can find
            or create some at the{" "}
            <Link
              to="/explore"
              className="text-foreground! whitespace-nowrap underline underline-offset-4"
            >
              Explore
            </Link>{" "}
            {" and "}
            <Link
              to="/upload"
              className="text-foreground! whitespace-nowrap underline underline-offset-4"
            >
              Upload
            </Link>{" "}
            pages
          </p>
        </div>
      </div>
    )

  const filteredCollections = libraryCollections.filter((collection) => {
    switch (currentFilter) {
      case "created":
        return collection.authorId === session?.user.id

      case "saved":
        return collection.saves.length > 0

      default:
        return true
    }
  })

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
                onValueChange={(val) =>
                  setCurrentFilter(val as "all" | "created" | "saved")
                }
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

      {isPending ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </section>
      ) : filteredCollections.length < 1 ? (
        <section>
          {currentFilter === "created" && (
            <p className="rounded-md border border-dashed p-4">
              You haven't created any collections yet.{" "}
              <Link
                to="/upload"
                className="text-foreground! underline underline-offset-4"
              >
                Create one
              </Link>
              .
            </p>
          )}
          {currentFilter === "saved" && (
            <p className="rounded-md border border-dashed p-4">
              You haven't saved any collections yet.{" "}
              <Link
                to="/explore"
                className="text-foreground! underline underline-offset-4"
              >
                Explore collections
              </Link>
              .
            </p>
          )}
          {currentFilter === "all" && <>No collections found.</>}
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              session={session}
            />
          ))}
        </section>
      )}
    </>
  )
}
