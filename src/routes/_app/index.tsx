import { Button } from '#/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/')({ component: Home })

function Home() {
  return (
    <div className="">
      <h1 className="font-heading text-2xl font-bold md:text-4xl">
        Welcome to TanStack Start
      </h1>
      <p className="mt-4 text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
        <br />
        <Button size="lg">Create Collection</Button>
      </p>
    </div>
  )
}
