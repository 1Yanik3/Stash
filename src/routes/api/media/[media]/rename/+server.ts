import type { RequestHandler } from '@sveltejs/kit'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const PUT: RequestHandler = async ({ params, request }) => {

    const media = await prisma.media.findUniqueOrThrow({
        where: {
            id: params.media
        }
    })

    await prisma.media.update({
        where: { id: media.id },
        data: {
            name: (await request.json()).name
        }
    })

    return new Response()

}