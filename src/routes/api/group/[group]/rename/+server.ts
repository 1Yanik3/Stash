import type { RequestHandler } from '@sveltejs/kit'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const PUT: RequestHandler = async ({ params, request }) => {
    if (!params.group)
        return new Response("", { status: 400 })

    await prisma.groups.update({
        where: { id: +params.group },
        data: {
            name: (await request.json()).name
        }
    })

    return new Response()

}