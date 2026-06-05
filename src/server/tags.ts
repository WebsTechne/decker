import { createServerFn } from "@tanstack/react-start"
import { prisma } from "#/db"
import { getSession } from "#/lib/auth-session"

const createTag = createServerFn({ method: "POST" })
  .inputValidator((data: { tag?: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    if (!data.tag || data.tag.length < 1) return

    try {
      const tag = await prisma.tag.upsert({
        where: {
          name: data.tag,
        },
        update: {},
        create: {
          name: data.tag,
        },
      })
      return tag
    } catch (err) {
      console.error("❌ createTag error:", err)
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
