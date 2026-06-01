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
          author: {
            select: {
              id: true,
              username: true,
              image: true,
              department: { select: { id: true, name: true } },
              school: { select: { id: true, name: true } },
            },
          },
          pages: { orderBy: { position: "asc" } },
          tags: { include: { tag: true } },
          saves: {
            where: { userId: session.user.id },
            take: 1,
          },
          collaborators: {
            select: {
              user: {
                select: {
                  id: true,
                  image: true,
                  username: true,
                  school: { select: { id: true, name: true } },
                  department: { select: { id: true, name: true } },
                },
              },
            },
            orderBy: { addedAt: "asc" },
          },
          _count: { select: { saves: true, comments: true, pages: true } },
        },
      })

      if (!collection) return null
      return collection
    } catch (err) {
      console.error("❌ getCollectionById error:", err)
      throw err
    }
  })

type CollectionData = Prisma.CollectionGetPayload<{
  include: {
    author: {
      select: {
        id: true
        username: true
        image: true
        school: { select: { id: true; name: true } }
        department: { select: { id: true; name: true } }
      }
    }
    pages: true
    tags: { include: { tag: true } }
    saves: true
    collaborators: {
      select: {
        user: {
          select: {
            id: true
            image: true
            username: true
            school: { select: { id: true; name: true } }
            department: { select: { id: true; name: true } }
          }
        }
      }
    }
    _count: { select: { saves: true; comments: true; pages: true } }
  }
}>

export type { CollectionData }
export { createCollection, createPages, deleteCollection, getCollectionById }
