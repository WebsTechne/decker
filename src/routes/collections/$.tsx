import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/collections/$")({
  component: CollectionNotFound,
})

function CollectionNotFound() {
  return (
    <section>
      <div className="flex-center min-h-25 flex-col gap-1 rounded-xl border border-dashed text-lg">
        Page not found
      </div>
    </section>
  )
}
