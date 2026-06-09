import { createServerFn } from "@tanstack/react-start"
import { prisma } from "#/db"
import { getSession } from "#/lib/auth-session"

const createPages = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      collectionId: string
      pages: {
        imageUrl: string
        position: number
        width?: number
        height?: number
      }[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    await prisma.page.createMany({
      data: data.pages.map((page) => ({
        collectionId: data.collectionId,
        imageUrl: page.imageUrl,
        position: page.position,
        width: page.width,
        height: page.height,
        uploadedById: session.user.id,
      })),
    })
  })

const reorderPages = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      collectionId: string
      pages: { id: string; position: number }[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    await prisma.$transaction(
      data.pages.map((page) =>
        prisma.page.update({
          where: { id: page.id, collectionId: data.collectionId },
          data: { position: page.position },
        }),
      ),
    )
  })

const deletePages = createServerFn({ method: "POST" })
  .inputValidator((data: { pageIds: string[] }) => data)
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    try {
      await prisma.page.deleteMany({
        where: {
          id: { in: data.pageIds },
        },
      })
    } catch (err) {
      console.error(err)
      throw new Error("Failed to delete")
    }
  })

export { createPages, reorderPages, deletePages }
