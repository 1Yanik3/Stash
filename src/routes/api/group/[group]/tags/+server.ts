import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'


import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({ params, request }) => {
    let tags: any

    if (new URL(request.url).searchParams.get("traverse") == "true")
        tags = await prisma.$queryRaw`
        -- Count the number of matching Tags for a specific group ID
            WITH RECURSIVE child_groups AS (
                SELECT "id"
                FROM "Groups"
                WHERE "id" = ${+params.group}
                UNION ALL
                SELECT "g"."id"
                FROM "Groups" "g"
                JOIN child_groups "cg" ON "g"."parentId" = "cg"."id"
            )
            SELECT "Tags"."name", COUNT(*)::int FROM "_MediaToTags"
            LEFT JOIN "Tags"   ON "Tags"."id"   = "_MediaToTags"."B"
            LEFT JOIN "Media"  ON "Media"."id"  = "_MediaToTags"."A"
            LEFT JOIN "Groups" ON "Groups"."id" = "Media"."groupId"
            JOIN child_groups ON "Media"."groupId" = child_groups."id"
            WHERE CASE
                WHEN ${+params.group} IN (SELECT "everythingGroupId" FROM "Clusters") THEN
                    "Groups"."clusterId" = (SELECT "id" FROM "Clusters" WHERE "everythingGroupId" = ${+params.group})
                ELSE
                    "Media"."groupId" = ${+params.group}
            END
            GROUP BY "Tags"."name"
        `

    else tags = await prisma.$queryRaw`
        -- Count the number of matching Tags for a specific group ID
        SELECT "Tags"."name", COUNT(*)::int FROM "_MediaToTags"
        LEFT JOIN "Tags"   ON "Tags"."id"   = "_MediaToTags"."B"
        LEFT JOIN "Media"  ON "Media"."id"  = "_MediaToTags"."A"
        LEFT JOIN "Groups" ON "Groups"."id" = "Media"."groupId"
        WHERE CASE
            WHEN ${+params.group} IN (SELECT "everythingGroupId" FROM "Clusters") THEN
                "Groups"."clusterId" = (SELECT "id" FROM "Clusters" WHERE "everythingGroupId" = ${+params.group})
            ELSE
                "Media"."groupId" = ${+params.group}
        END
        GROUP BY "Tags"."name"
    `

    return json([
        ...tags.map((t: any) => {
            t.active = false;
            return t;
        }),
        {
            name: "Untagged",
            // count: media.reduce((old, currentValue) => old + (+!currentValue.tags.length), 0),
            count: -1,
            active: false
        }
    ])

}