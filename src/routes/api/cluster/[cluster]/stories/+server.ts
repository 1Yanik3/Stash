import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({ params }) => new Response(JSON.stringify(
    await prisma.story.findMany({
        where: {
            clusterId: Number(params.cluster)
        }
    })
))