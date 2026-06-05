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

const updateCollection = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      collectionId: string
      name: string
      description: string
      tagIds: string[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    return prisma.collection.update({
      where: { id: data.collectionId, authorId: session.user.id },
      data: {
        name: data.name,
        description: data.description,
        tags: {
          deleteMany: {},

          create: data.tagIds.map((tagId) => ({
            tag: {
              connect: {
                id: tagId,
              },
            },
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
              displayUsername: true,
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
          contributors: {
            select: {
              user: {
                select: {
                  id: true,
                  image: true,
                  username: true,
                  displayUsername: true,
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
        displayUsername: true
        image: true
        school: { select: { id: true; name: true } }
        department: { select: { id: true; name: true } }
      }
    }
    pages: true
    tags: { include: { tag: true } }
    saves: true
    contributors: {
      select: {
        user: {
          select: {
            id: true
            image: true
            username: true
            displayUsername: true
            school: { select: { id: true; name: true } }
            department: { select: { id: true; name: true } }
          }
        }
      }
    }
    _count: { select: { saves: true; comments: true; pages: true } }
  }
}>

// Fetch Collection List
const getCollectionList = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    try {
      const collections = await prisma.collection.findMany({
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayUsername: true,
              image: true,
              department: { select: { id: true, name: true } },
              school: { select: { id: true, name: true } },
            },
          },
          tags: { include: { tag: true } },
          saves: {
            where: { userId: session.user.id },
            take: 1,
          },
          contributors: {
            select: {
              user: {
                select: {
                  id: true,
                  image: true,
                  username: true,
                  displayUsername: true,
                  school: { select: { id: true, name: true } },
                  department: { select: { id: true, name: true } },
                },
              },
            },
            orderBy: { addedAt: "asc" },
          },
          _count: { select: { saves: true, pages: true } },
        },
        orderBy: { createdAt: "desc" },
      })

      return collections
    } catch (err) {
      console.error("❌ getCollectionList error:", err)
      throw err
    }
  },
)

const getMyCollections = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  try {
    const collections = await prisma.collection.findMany({
      where: { authorId: session.user.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayUsername: true,
            image: true,
            department: { select: { id: true, name: true } },
            school: { select: { id: true, name: true } },
          },
        },
        tags: { include: { tag: true } },
        saves: {
          where: { userId: session.user.id },
          take: 1,
        },
        contributors: {
          select: {
            user: {
              select: {
                id: true,
                image: true,
                username: true,
                displayUsername: true,
                school: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { addedAt: "asc" },
        },
        _count: { select: { saves: true, pages: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return collections
  } catch (err) {
    console.error("❌ getMyCollections error:", err)
    throw err
  }
})

const getSavedCollections = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    try {
      const saves = await prisma.save.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          collection: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  displayUsername: true,
                  image: true,
                  department: { select: { id: true, name: true } },
                  school: { select: { id: true, name: true } },
                },
              },
              tags: { include: { tag: true } },
              saves: {
                where: { userId: session.user.id },
                take: 1,
              },
              contributors: {
                select: {
                  user: {
                    select: {
                      id: true,
                      image: true,
                      username: true,
                      displayUsername: true,
                      school: { select: { id: true, name: true } },
                      department: { select: { id: true, name: true } },
                    },
                  },
                },
                orderBy: { addedAt: "asc" },
              },
              _count: { select: { saves: true, pages: true } },
            },
          },
        },
      })

      return saves.map((s) => s.collection)
    } catch (err) {
      console.error("❌ getSavedCollections error:", err)
      throw err
    }
  },
)

type CollectionListData = Prisma.CollectionGetPayload<{
  include: {
    author: {
      select: {
        id: true
        username: true
        displayUsername: true
        image: true
        school: { select: { id: true; name: true } }
        department: { select: { id: true; name: true } }
      }
    }
    tags: { include: { tag: true } }
    saves: true
    contributors: {
      select: {
        user: {
          select: {
            id: true
            image: true
            username: true
            displayUsername: true
            school: { select: { id: true; name: true } }
            department: { select: { id: true; name: true } }
          }
        }
      }
    }
    _count: { select: { saves: true; pages: true } }
  }
}>

const toggleSaveCollection = createServerFn({ method: "GET" })
  .inputValidator((data: { collectionId: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    const existingSave = await prisma.save.findUnique({
      where: {
        userId_collectionId: {
          userId: session.user.id,
          collectionId: data.collectionId,
        },
      },
    })

    if (existingSave)
      await prisma.save.delete({
        where: {
          userId_collectionId: {
            userId: session.user.id,
            collectionId: data.collectionId,
          },
        },
      })
    else
      await prisma.save.create({
        data: {
          userId: session.user.id,
          collectionId: data.collectionId,
        },
      })

    return { saved: true }
  })

export type { CollectionData, CollectionListData }
export {
  createCollection,
  createPages,
  deleteCollection,
  getCollectionById,
  getCollectionList,
  getMyCollections,
  getSavedCollections,
  updateCollection,
  toggleSaveCollection,
}
