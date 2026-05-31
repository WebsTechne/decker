import { createServerFn } from "@tanstack/react-start"
import { prisma } from "#/db"
import { getSession } from "#/lib/auth-session"
import type { Prisma } from "#/generated/prisma/client"

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

const getCollectionById = createServerFn({ method: "GET" })
  .inputValidator((data: { collectionId: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    try {
      const collection = await prisma.collection.findFirst({
        where: { id: data.collectionId },
        include: {
          author: { select: { id: true, username: true, image: true } },
          pages: { orderBy: { position: "asc" } },
          tags: { include: { tag: true } },
          saves: {
            where: { userId: session.user.id },
            take: 1,
          },
          _count: { select: { saves: true, comments: true, pages: true } },
        },
      })

      if (!collection) throw new Error("Collection not found")
      return collection
    } catch (err) {
      console.error("❌ getCollectionById error:", err)
      throw err
    }
  })

type CollectionData = Prisma.CollectionGetPayload<{
  include: {
    author: { select: { id: true; username: true; image: true } }
    pages: true
    tags: { include: { tag: true } }
    saves: true
    _count: { select: { saves: true; comments: true; pages: true } }
  }
}>

export type { CollectionData }
export { createCollection, createPages, deleteCollection, getCollectionById }
