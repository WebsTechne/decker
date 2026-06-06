import { createServerFn } from "@tanstack/react-start"
import { prisma } from "#/db"

const getProfileByUsername = createServerFn({ method: "GET" })
  .inputValidator((data: { username: string }) => data)
  .handler(async ({ data: { username } }) => {
    try {
      const data = await prisma.user.findUnique({
        where: { username },
        select: {
          displayUsername: true,
          username: true,
          image: true,
          school: true,
          department: true,
          collections: {
            select: {
              bannerUrl: true,
              id: true,
              name: true,
              author: {
                select: { image: true, username: true },
              },
              contributors: {
                select: { user: { select: { image: true, username: true } } },
              },
              _count: { select: { pages: true, saves: true } },
            },
          },
          contributing: {
            select: {
              collection: {
                select: {
                  bannerUrl: true,
                  id: true,
                  name: true,
                  author: {
                    select: { image: true, username: true },
                  },
                  contributors: {
                    select: {
                      user: { select: { image: true, username: true } },
                    },
                  },
                  _count: { select: { pages: true, saves: true } },
                },
              },
            },
          },
          _count: {
            select: { collections: true, contributing: true },
          },
        },
      })
      return data
    } catch (err) {
      console.error("❌ getSchools error:", err)
      throw err
    }
  })

export { getProfileByUsername }
