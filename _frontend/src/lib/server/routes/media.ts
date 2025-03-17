import prisma from "../prisma"

export const bulkAddTagsToMedia = async (d: {
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

export const bulkRemoveTagsFromMedia = async (d: {
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

export const renameNameOfMedia = async (d: {
  mediaId: string
  newName: string
}) => {
  await prisma.media.update({
    where: {
      id: d.mediaId
    },
    data: {
      name: d.newName
    }
  })
}
