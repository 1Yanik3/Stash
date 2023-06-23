import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({ params }) => new Response(
    (
        await prisma.groupedIntoNames.findFirst({
            where: {
                id: +params.id
            }
        })
    )?.name || "Unknown"
)