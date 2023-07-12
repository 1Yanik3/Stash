import { json, type RequestHandler } from '@sveltejs/kit'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const PATCH: RequestHandler = async ({ params }) => {
    if (!params.group)
        return new Response("", { status: 400 })

    const newState = !(
        await prisma.groups.findFirst({
            where: { id: +params.group },
            select: {
                collapsed: true
            }
        })
    )?.collapsed

    // Toggle collapsed attribute
    await prisma.groups.update({
        where: { id: +params.group },
        data: {
            collapsed: {
                set: newState
            }
        }
    })

    return json(newState)

}