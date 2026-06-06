import { createServerFn } from "@tanstack/react-start"
import { prisma } from "#/db"

const createDepartment = createServerFn({ method: "POST" })
  .inputValidator((data: { department: string }) => data)
  .handler(async ({ data }) => {
    try {
      const department = await prisma.department.upsert({
        where: {
          name: data.department,
        },
        update: {},
        create: {
          name: data.department,
        },
      })
      return department
    } catch (err) {
      console.error("❌ createDepartment error:", err)
      throw err
    }
  })

const getDepartments = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const data = await prisma.department.findMany({
      orderBy: { name: "asc" },
    })
    return data
  } catch (err) {
    console.error("❌ getDepartments error:", err)
    throw err
  }
})

export { createDepartment, getDepartments }
