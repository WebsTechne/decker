import { createServerFn } from "@tanstack/react-start"
import { prisma } from "#/db"
import { getSession } from "#/lib/auth-session"

const createCollection = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { name: string; description: string; tagIds: string[] }) => data,
  )
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    return prisma.collection.create({
      data: {
        name: data.name,
        description: data.description,
        authorId: session.user.id,
        tags: {
          create: data.tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
    })
  })

const createPages = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      collectionId: string
      pages: { imageUrl: string; position: number }[]
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
        uploadedById: session.user.id,
      })),
    })
  })

const deleteCollection = createServerFn({ method: "POST" })
  .inputValidator((data: { collectionId: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    await prisma.collection.delete({
      where: {
        id: data.collectionId,
        authorId: session.user.id, // only author can delete
      },
    })
  })

export { createCollection, createPages, deleteCollection }
