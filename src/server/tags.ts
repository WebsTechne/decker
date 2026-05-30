import { createServerFn } from "@tanstack/react-start"
import { prisma } from "#/db"
import type { Prisma } from "#/generated/prisma/client"

export const getTags = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const data = await prisma.tag.findMany({ orderBy: { name: "asc" } })
    return data
  } catch (err) {
    console.error("❌ getTags error:", err)
    throw err
  }
})

export type TagData = Prisma.TagGetPayload<{}>
