import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({ params }) => {

    const data = await prisma.$queryRaw`
        SELECT g1.name, 

        CASE WHEN (
            SELECT g2.id FROM "Groups" as g2
            LEFT JOIN "Media" ON "Media"."groupId" = g2.id
            WHERE g2."parentId" = g1.id
            LIMIT 1
        ) IS NULL
        THEN g1.id
        ELSE (
            SELECT g2.id FROM "Groups" as g2
            LEFT JOIN "Media" ON "Media"."groupId" = g2.id
            WHERE g2."parentId" = g1.id
            LIMIT 1
        )
        END id,
        
        CASE WHEN (
            SELECT MIN("Media".id) FROM "Media"
            WHERE "Media"."groupId" = g1.id
        ) IS NULL
        THEN (
            SELECT "Media".id FROM "Groups" as g2
            LEFT JOIN "Media" ON "Media"."groupId" = g2.id
            WHERE g2."parentId" = g1.id AND g2.name != 'transparent'
            LIMIT 1
        )
        ELSE (
            SELECT MIN("Media".id) FROM "Media"
            WHERE "Media"."groupId" = g1.id
        )
        
        END "Media"
        FROM "Groups" as g1
        WHERE g1."clusterId" = ${Number(params.cluster)} AND g1."parentId" IS NULL AND g1."id" > 0
    `

    return new Response(JSON.stringify(data))
}