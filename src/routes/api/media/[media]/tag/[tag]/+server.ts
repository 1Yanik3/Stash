import type { RequestHandler } from '@sveltejs/kit'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const DELETE: RequestHandler = async ({ params }) => {

    const media = await prisma.media.findUniqueOrThrow({
        where: {
            id: params.media
        }
    })

    await prisma.media.update({
        data: {
            tags: media.tags.map(t => t.toLocaleLowerCase()).filter(t => t !== params.tag)
        },
        where: {
            id: media.id
        }
    })

    return new Response()

}