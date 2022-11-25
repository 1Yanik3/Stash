import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async () => new Response(JSON.stringify(
    await prisma.clusters.findMany()
))