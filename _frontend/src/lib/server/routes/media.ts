import prisma from "../prisma"

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
