import { setMethods } from '$lib/../types'
import { json, type RequestHandler } from '@sveltejs/kit'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({ params, request, url }) => {
    const activeSetMethod = setMethods[+(url.searchParams.get("activeSetMethod") || 0)]
    const tags = url.searchParams.get('tags')?.split(",") || []
    const mediaTypeFilter = url.searchParams.get('mediaTypeFilter') || ""

    let typeFilter: string = ``
    if (mediaTypeFilter) typeFilter = /*sql*/`
        AND "Media"."type" LIKE '${mediaTypeFilter}%'
    `

    let tagsFilter = ""
    if (activeSetMethod.title == "AND" && tags[0].length)
        tagsFilter = /*sql*/`
            AND (
                ${tags.map(tag => `("Media"."tags" @> ARRAY['${tag.toLowerCase()}'])`).join(' AND ')}
            )
        `

    return json(await prisma.$queryRawUnsafe(/*sql*/`
        WITH tags AS (
            SELECT tag, COUNT(*) AS direct_count
            FROM (
                SELECT t.tag
                FROM "Media", unnest("Media"."tags") AS t(tag)
                WHERE "Media"."clustersId" = (SELECT id FROM "Clusters" WHERE "Clusters".name = '${params.cluster}')
                ${typeFilter}
                ${tagsFilter}
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
    `))
}
