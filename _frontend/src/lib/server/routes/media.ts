import prisma from "../prisma"

export const media_bulk_add_tags = async (d: {
  mediaIds: string[]
  tagId: number
}) => {
  for (const mediaId of d.mediaIds) {
    await prisma.media.update({
      where: {
        id: mediaId
      },
      data: {
        tags: {
          connect: {
            id: d.tagId
          }
        }
      }
    })
  }
}

export const media_bulk_remove_tags = async (d: {
  mediaIds: string[]
  tagId: number
}) => {
  for (const mediaId of d.mediaIds) {
    await prisma.media.update({
      where: {
        id: mediaId
      },
      data: {
        tags: {
          disconnect: {
            id: d.tagId
          }
        }
      }
    })
  }
}

export const markMediaAsDeleted = async (d: { mediaId: string }) => {
  await prisma.media.update({
    where: {
      id: d.mediaId
    },
    data: {
      deleted: true
    }
  })
}
