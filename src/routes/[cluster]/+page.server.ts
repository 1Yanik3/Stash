import type { PageServerLoad } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const load: PageServerLoad = async ({ parent, depends }) => {
    depends("tags")

    const parentData = await parent()

    const tags: { tag: string[], direct_count: number, indirect_count: number }[] = await prisma.$queryRaw`
        WITH tags AS (
            SELECT tag, COUNT(*) AS direct_count
            FROM (
                SELECT t.tag
                FROM "Media", unnest("Media"."tags") AS t(tag)
                WHERE "Media"."clustersId" = ${parentData.cluster.id}
            ) subq
            GROUP BY tag
        )
        SELECT
            string_to_array(INITCAP(b.tag), '/') AS tag,
            b.direct_count::INTEGER,
            COALESCE(SUM(a.direct_count), 0)::INTEGER AS indirect_count
        FROM tags b
        LEFT JOIN tags a ON a.tag LIKE LOWER(b.tag) || '/%'
        GROUP BY b.tag, b.direct_count 
        ORDER BY b.direct_count DESC;
    `

    const counters: { untagged_count: number } = (await prisma.$queryRaw`
        SELECT COUNT(*) AS untagged_count
        FROM "Media"
        WHERE "clustersId" = ${parentData.cluster.id}
        AND NOT EXISTS (
            SELECT 1
            FROM unnest("Media"."tags") AS t(tag)
            WHERE tag IN ('Solo', 'Two', 'Group')
        )
    ` as any)[0]

    const stories = await prisma.story.findMany({
        where: {
            cluster: parentData.cluster
        }
    })

    return {
        tags,
        counters,
        stories
    }
}
