import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async () => new Response(JSON.stringify(
    await prisma.groups.findMany({
        select: {
            id: true,
            name: true,
            cluster: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })
))