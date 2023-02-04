import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({ params }) => new Response(JSON.stringify(await prisma.$queryRaw`
    -- Count the number of matching Tags for a specific group ID
    SELECT "Tags"."name", COUNT(*)::int FROM "_MediaToTags"
    LEFT JOIN "Tags"   ON "Tags"."id"   = "_MediaToTags"."B"
    LEFT JOIN "Media"  ON "Media"."id"  = "_MediaToTags"."A"
    LEFT JOIN "Groups" ON "Groups"."id" = "Media"."groupId"
    WHERE CASE
        WHEN ${Number(params.group)} IN (SELECT "everythingGroupId" FROM "Clusters") THEN
            "Groups"."clusterId" = (SELECT "id" FROM "Clusters" WHERE "everythingGroupId" = ${Number(params.group)})
        ELSE
            "Media"."groupId" = ${Number(params.group)}
    END
    GROUP BY "Tags"."name"
`))