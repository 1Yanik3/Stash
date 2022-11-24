import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({ params }) => new Response(JSON.stringify(
    (await prisma.tags.findMany({
        where: {
            media: {
                some: {
                    groupId: Number(params.group)
                }
            }
        },
        include: {
            _count: true
        }
    })).map(r => {return {
        id: r.id,
        name: r.name,
        count: r._count.media
    }})
))