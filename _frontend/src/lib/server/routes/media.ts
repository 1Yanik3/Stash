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

export const addTagsToMedias = async (d: {
    mediaIds: string[]
    tagIds: number[]
}) => {
    const { default: prisma } = await import("$lib/server/prisma")
    for (const tagId of d.tagIds) {
        for (const mediaId of d.mediaIds) {
            await prisma.media.update({
                where: {
                    id: mediaId
                },
                data: {
                    tags: {
                        connect: {
                            id: tagId
                        }
                    }
                }
            })
        }
    }
}

export const removeTagsFromMedias = async (d: {
    mediaIds: string[]
    tagIds: number[]
}) => {
    const { default: prisma } = await import("$lib/server/prisma")
    for (const tagId of d.tagIds) {
        for (const mediaId of d.mediaIds) {
            await prisma.media.update({
                where: {
                    id: mediaId
                },
                data: {
                    tags: {
                        disconnect: {
                            id: tagId
                        }
                    }
                }
            })
        }
    }
}
