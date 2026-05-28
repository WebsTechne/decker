import { createServerFn } from "@tanstack/react-start"
import { prisma } from "#/db"
import type { Prisma } from "#/generated/prisma/client"

export const getDepartments = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const data = await prisma.department.findMany({
        orderBy: { name: "asc" },
      })
      return data
    } catch (err) {
      console.error("❌ getDepartments error:", err)
      throw err
    }
  },
)

export type DepartmentData = Prisma.DepartmentGetPayload<{}>
