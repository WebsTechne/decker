import { createServerFn } from "@tanstack/react-start"
import { prisma } from "#/db"
import type { Prisma } from "#/generated/prisma/client"

export const getSchools = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const data = await prisma.school.findMany({ orderBy: { name: "asc" } })
      return data
    } catch (err) {
      console.error("❌ getSchools error:", err)
      throw err
    }
  },
)

export type SchoolData = Prisma.SchoolGetPayload<{}>
