import { createServerFn } from "@tanstack/react-start"
import { prisma } from "#/db"
import { getSession } from "#/lib/auth-session"
import { getCollectionSimple } from "./collections"
import { createActivity } from "#/lib/activity"

const getComments = createServerFn({ method: "GET" })
  .inputValidator((data: { collectionId: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    return prisma.comment.findMany({
      where: { collectionId: data.collectionId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayUsername: true,
            image: true,
          },
        },
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "asc" }],
    })
  })

const createComment = createServerFn({ method: "POST" })
  .inputValidator((data: { collectionId: string; body: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    // check if commenter is author or contributor
    const collection = await getCollectionSimple({
      data: { collectionId: data.collectionId },
    })

    const isAuthorOrContributor =
      collection.authorId === session.user.id ||
      collection.contributors.some((c) => c.userId === session.user.id)

    const recipientIds = [
      collection.authorId,
      ...collection.contributors.map((c) => c.userId),
    ].filter((id) => id !== session.user.id)

    const comment = await prisma.comment.create({
      data: {
        body: data.body,
        collectionId: data.collectionId,
        userId: session.user.id,
        pinned: isAuthorOrContributor,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayUsername: true,
            image: true,
          },
        },
      },
    })

    if (recipientIds.length > 0)
      await createActivity({
        data: {
          type: "COMMENT",
          recipientIds,
          actorId: session.user.id,
          collectionId: data.collectionId,
          commentId: comment.id,
          commentBody: data.body,
        },
      })

    return comment
  })

const deleteComment = createServerFn({ method: "POST" })
  .inputValidator((data: { commentId: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    // only comment author can delete
    await prisma.comment.delete({
      where: {
        id: data.commentId,
        userId: session.user.id,
      },
    })
  })

export { getComments, createComment, deleteComment }
