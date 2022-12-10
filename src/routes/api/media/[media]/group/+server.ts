import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const PUT: RequestHandler = async ({ request, params }) => {
    const { groupId } = await request.json()

    await prisma.media.update({
        where: {
            id: Number(params.media)
        },
        data: {
            groupId
        }
    })


    // TODO (for MediaViewer.svelte)
    return new Response(null)
    
}