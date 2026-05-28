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
import { HugeiconsIcon } from "@hugeicons/react"
import { File02Icon, FilterIcon, SearchIcon } from "@hugeicons/core-free-icons"

import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import { cn } from "#/lib/utils"
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

export const Route = createFileRoute("/_app/")({ component: Home })

function Home() {
  const [currentFilter, setCurrentFilter] = useState<
    "all" | "created" | "saved"
  >("all")

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
      tags: ["COS203", "self-made"],
      pages: 3,
      type: "created",
    },
    {
      author: "webs-techne",
      name: "CSC203 - Destructuring variables",
      description:
        "afnaif awidfjwdif jarifuoh adiuhawdufg asdgfowdf awdgofuadgo faud ohgaiod g dofgasod fgaod gfaiodfadfg",
      tags: ["COS203", "self-made", "science", "creative"],
      pages: 5,
      type: "saved",
    },
    {
      author: "webs-techne",
      name: "CSC203 - Destructuring variables",
      description:
        "afnaif awidfjwdif jarifuoh adiuhawdufg asdgfowdf awdgofuadgo faud ohgaiod g dofgasod fgaod gfaiodfadfg",
      tags: ["COS203", "self-made", "science", "x", "y"],
      pages: 27,
      type: "created",
    },
    {
      author: "webs-techne",
      name: "CSC203 - Destructuring variables",
      description:
        "afnaif awidfjwdif jarifuoh adiuhawdufg asdgfowdf awdgofuadgo faud ohgaiod g dofgasod fgaod gfaiodfadfg",
      tags: ["COS203", "self-made", "science", "x", "y", "z"],
      pages: 1,
      type: "saved",
    },
  ]

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
        {data.map((item, index) => (
          <Card size="sm" key={index} className="pt-0!">
            <Link to="/collections/ddfji" className="contents">
              <div className="card-img">
                <img
                  src={item.image ?? "/card-loading-skeleton-unsplash.jpg"}
                  alt={item.name}
                />
                <Badge
                  className={cn(
                    "text-foreground dark:text-background absolute top-2 right-2",
                    item.type === "saved" ? "bg-amber-300" : "bg-blue-300",
                  )}
                >
                  {item.type}
                </Badge>
              </div>
            </Link>
            <CardHeader className="gap-2">
              <CardTitle className="flex items-center gap-1">
                {item.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                {item.tags.slice(0, 3).map((tag, tagIndex) => (
                  <Badge
                    key={`${tag}-${tagIndex}`}
                    className="h-max px-2 py-1 text-xs"
                    variant="secondary"
                  >
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge className="h-max py-1 text-xs" variant="outline">
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-between py-0!">
              <div className="flex flex-1 items-center gap-1 overflow-x-hidden">
                <Avatar className="size-7">
                  <AvatarImage src={""} alt={item.author} />
                  <AvatarFallback>
                    {item.author.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">{item.author}</span>
              </div>

              <div className="flex-center text-muted-foreground gap-1 text-xs sm:text-sm">
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
