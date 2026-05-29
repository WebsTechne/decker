import { createServerFn } from "@tanstack/react-start"
import { prisma } from "#/db"

const updateUserProfile = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      userId: string
      schoolId: string
      departmentId: string
      image?: string
    }) => data,
  )
  .handler(async ({ data }) => {
    return prisma.user.update({
      where: { id: data.userId },
      data: {
        schoolId: data.schoolId,
        departmentId: data.departmentId,
        image: data.image,
      },
    })
  })
const deleteUser = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    return prisma.user.delete({
      where: { id: data.userId },
    })
  })

export { updateUserProfile, deleteUser }
