import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/activity/")({
  component: ActivityPage,
})

function ActivityPage() {
  return (
    <div className="flex-center h-[calc(100dvh-48px-56px)]">
      <p className="text-center text-lg">Your inbox is empty!</p>
    </div>
  )
}
