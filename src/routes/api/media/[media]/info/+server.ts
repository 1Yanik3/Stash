import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({ params }) => {

    // TODO (for MediaViewer.svelte)
    return new Response(JSON.stringify(0))
    
}