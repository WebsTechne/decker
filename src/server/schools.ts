import { createServerFn } from "@tanstack/react-start"
import { prisma } from "#/db"

const createSchool = createServerFn({ method: "POST" })
  .inputValidator((data: { school: string }) => data)
  .handler(async ({ data }) => {
    try {
      const school = await prisma.school.upsert({
        where: {
          name: data.school,
        },
        update: {},
        create: {
          name: data.school,
        },
      })
      return school
    } catch (err) {
      console.error("❌ createSchool error:", err)
      throw err
    }
  })

const getSchools = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const data = await prisma.school.findMany({ orderBy: { name: "asc" } })
    return data
  } catch (err) {
    console.error("❌ getSchools error:", err)
    throw err
  }
})

export { createSchool, getSchools }
