import { createServerFn } from "@tanstack/react-start"
import { prisma } from "#/db"
import { getSession } from "#/lib/auth-session"
import { generateActivityBody, type ActivityType } from "./activity-body"

const createActivity = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      type: ActivityType
      recipientIds: string[]
      actorId: string
      collectionId: string
      pageId?: string
      commentId?: string
      commentBody?: string
      pageCount?: number
    }) => data,
  )
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    const collection = await prisma.collection.findUnique({
      where: { id: data.collectionId },
      select: { name: true },
    })

    const body = generateActivityBody(
      data.type,
      session.user.username,
      collection?.name ?? "Unknown Collection",
      {
        commentBody: data.commentBody,
        pageCount: data.pageCount,
      },
    )

    try {
      const activity = await prisma.activity.createMany({
        data: data.recipientIds.map((recipientId) => ({
          type: data.type,
          recipientId: recipientId,
          actorId: data.actorId,
          collectionId: data.collectionId,
          pageId: data.pageId,
          commentId: data.commentId,
          body,
        })),
      })
      return activity
    } catch (err) {
      console.error(err)
      throw new Error("Failed to create activity")
    }
  })

const markActivityRead = createServerFn({ method: "POST" })
  .inputValidator((data: { activityId: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    try {
      await prisma.activity.update({
        where: { id: data.activityId },
        data: { read: true },
      })
    } catch (err) {
      console.error(err)
      throw new Error("Failed to mark activity read")
    }
  })

const getActivities = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  try {
    const activities = await prisma.activity.findMany({
      where: { recipientId: session.user.id },
      include: { actor: { select: { username: true, image: true } } },
      orderBy: { createdAt: "desc" },
    })
    return activities
  } catch (err) {
    console.error(err)
    throw new Error("Failed to get activities")
  }
})

export { createActivity, markActivityRead, getActivities }
