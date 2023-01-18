import type { RequestHandler } from '@sveltejs/kit'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const DELETE: RequestHandler = async ({ params }) => {

    await prisma.media.update({
        data: {
            tags: {
                disconnect: {
                    name: params.tag
                }
            }
        },
        where: {
            id: params.media
        }
    })

    return new Response()

}