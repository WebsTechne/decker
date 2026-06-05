import { createServerFn } from "@tanstack/react-start"
import { prisma } from "#/db"
import type { Prisma } from "#/generated/prisma/client"
import { getSession } from "#/lib/auth-session"
import { toast } from "sonner"

const createTag = createServerFn({ method: "POST" })
  .inputValidator((data: { tag: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    toast.loading("Creating tag...", { id: "create-tag-toast" })

    try {
      const res = await prisma.tag.create({ data: { name: data.tag } })
      toast.dismiss("create-tag-toast")
      return res
    } catch (err) {
      console.error("❌ createTag error:", err)
      toast.dismiss("create-tag-toast")
      throw err
    }
  })

const getTags = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const data = await prisma.tag.findMany({ orderBy: { name: "asc" } })
    return data
  } catch (err) {
    console.error("❌ getTags error:", err)
    throw err
  }
})

export type TagData = Prisma.TagGetPayload<{}>
export { createTag, getTags }
