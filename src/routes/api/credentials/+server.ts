import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async () => new Response(JSON.stringify(
    await prisma.credentials.findMany({
        select: {
            name: true,
            icon: true
        }
    })
))

export const POST: RequestHandler = async ({ request }) => {

    const { icon, name, token } = await request.json()

    const inviteCode = await prisma.credentials.create({
        data: {
            icon,
            name,
            credential: token
        }
    })

    return new Response()

}