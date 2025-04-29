import { error, type RequestHandler } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

export const PUT: RequestHandler = async ({ params }) => {
    if (!params.id) {
        return error(400, "Missing tag ID")
    }

    if (!params.id.match(/^\d+$/)) {
        return error(400, "Invalid tag ID")
    }

    const tagId = parseInt(params.id)

    await prisma.media.update({
        where: {
            id: params.media
        },
        data: {
            tags: {
                connect: {
                    id: tagId
                }
            }
        }
    })

    return new Response()
}

export const DELETE: RequestHandler = async ({ params }) => {
    if (!params.id) {
        return error(400, "Missing tag ID")
    }

    if (!params.id.match(/^\d+$/)) {
        return error(400, "Invalid tag ID")
    }

    const tagId = parseInt(params.id)

    await prisma.media.update({
        where: {
            id: params.media
        },
        data: {
            tags: {
                disconnect: {
                    id: tagId
                }
            }
        }
    })

    return new Response()
}
