import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar"
import { Badge } from "#/components/ui/badge"
import { Button } from "#/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card"
import { Input } from "#/components/ui/input"
import { useHeaderStore } from "#/lib/header-store"
import { HugeiconsIcon } from "@hugeicons/react"
import { File02Icon, FilterIcon } from "@hugeicons/core-free-icons"

import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { cn } from "#/lib/utils"

export const Route = createFileRoute("/_app/")({ component: Home })

function Home() {
  const setRightSlot = useHeaderStore((s) => s.setRightSlot)
  const [currentFilter, setCurrentFilter] = useState<
    "all" | "created" | "saved"
  >("all")

  // useEffect(() => {
  //   setRightSlot(
  //     <>
  //       <Button
  //         size="sm"
  //         variant={currentFilter === "all" ? "default" : "secondary"}
  //         onClick={() => setCurrentFilter("all")}
  //         className="rounded-full! px-3"
  //       >
  //         All
  //       </Button>
  //       <Button
  //         size="sm"
  //         variant={currentFilter === "created" ? "default" : "secondary"}
  //         onClick={() => setCurrentFilter("created")}
  //         className="rounded-full! px-3"
  //       >
  //         Created
  //       </Button>
  //       <Button
  //         size="sm"
  //         variant={currentFilter === "saved" ? "default" : "secondary"}
  //         onClick={() => setCurrentFilter("saved")}
  //         className="rounded-full! px-3"
  //       >
  //         Saved
  //       </Button>
  //     </>,
  //   )
  //   return () => setRightSlot(null) // cleanup on unmount
  // }, [currentFilter])

  const data = [
    {
      author: "0xZek",
      name: "CSC203 - Destructuring variables",
      description:
        "afnaif awidfjwdif jarifuoh adiuhawdufg asdgfowdf awdgofuadgo faud ohgaiod g dofgasod fgaod gfaiodfadfg",
      tags: ["COS203", "self-made", "science"],
      pages: 10,
      type: "created",
    },
    {
      author: "triumph_dev",
      name: "CSC203 - Destructuring variables",
      description:
        "afnaif awidfjwdif jarifuoh adiuhawdufg asdgfowdf awdgofuadgo faud ohgaiod g dofgasod fgaod gfaiodfadfg",
      tags: ["COS203", "self-made", "science"],
      pages: 3,
      type: "created",
    },
    {
      author: "webs-techne",
      name: "CSC203 - Destructuring variables",
      description:
        "afnaif awidfjwdif jarifuoh adiuhawdufg asdgfowdf awdgofuadgo faud ohgaiod g dofgasod fgaod gfaiodfadfg",
      tags: ["COS203", "self-made", "science"],
      pages: 5,
      type: "saved",
    },
    {
      author: "webs-techne",
      name: "CSC203 - Destructuring variables",
      description:
        "afnaif awidfjwdif jarifuoh adiuhawdufg asdgfowdf awdgofuadgo faud ohgaiod g dofgasod fgaod gfaiodfadfg",
      tags: ["COS203", "self-made", "science"],
      pages: 27,
      type: "created",
    },
    {
      author: "webs-techne",
      name: "CSC203 - Destructuring variables",
      description:
        "afnaif awidfjwdif jarifuoh adiuhawdufg asdgfowdf awdgofuadgo faud ohgaiod g dofgasod fgaod gfaiodfadfg",
      tags: ["COS203", "self-made", "science"],
      pages: 1,
      type: "saved",
    },
  ]

  return (
    <>
      <section className="flex-between gap-2">
        <Input placeholder="Search collections" className="h-11 w-full" />
        <Button variant="ghost" size="lg">
          <HugeiconsIcon icon={FilterIcon} className="size-6!" />
        </Button>
      </section>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {data.map((item, index) => (
          <Card size="sm" key={index} className="pt-0!">
            <div className="bg-secondary relative aspect-2/1 w-full overflow-clip">
              <img
                src={item.image ?? "/loading-skeleton.jpg"}
                alt={item.name}
                className="aspect-2/1 w-full object-cover opacity-20 mix-blend-overlay grayscale-100"
              />
              <Badge
                className={cn(
                  "absolute top-2 right-2",
                  item.type === "saved" ? "text-background bg-amber-500" : "",
                )}
              >
                {item.type}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                {item.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Avatar className="size-7">
                  <AvatarImage src={""} alt={item.author} />
                  <AvatarFallback>
                    {item.author.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">{item.author}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-between py-0!">
              <div className="flex items-center gap-1">
                {item.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="rounded-full bg-blue-500/30 px-2 py-1 text-xs text-blue-500"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <Badge className="px-2 py-1 text-xs" variant="outline">
                    +{item.tags.length - 2}
                  </Badge>
                )}
              </div>

              <div className="flex-center text-muted-foreground gap-1 text-sm">
                <HugeiconsIcon icon={File02Icon} size={16} />
                <span>
                  {item.pages} page{item.pages !== 1 && "s"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  )
}
