import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({ params }) => json(await prisma.$queryRaw`
    WITH exploded_tags AS (
        SELECT
            id,
            UNNEST(tags) AS tag
        FROM "Media"
        WHERE "clustersId" = 3
        ORDER BY "Media"."date" ASC
    ),

    tag_segments AS (
        SELECT 
            id,
            tag,
            ARRAY_LENGTH(string_to_array(tag, '/'), 1) AS depth
        FROM exploded_tags
        WHERE POSITION('/' IN tag) > 0        -- tags containing /
    ),

    least_segments_tag AS (
        SELECT MIN(ARRAY_LENGTH(string_to_array(tag, '/'), 1)) AS min_depth
        FROM tag_segments
    )

    SELECT
        DISTINCT ON (topLevel)
        SPLIT_PART(tag_segments.tag, '/', 1) as topLevel,
        tag_segments.tag,
        tag_segments.id 
    FROM tag_segments 
    JOIN least_segments_tag 
    ON tag_segments.depth = least_segments_tag.min_depth
    ORDER BY topLevel DESC;
`)
// export const GET: RequestHandler = async ({ params }) => json(await prisma.$queryRaw`
//     WITH exploded_tags AS (
//         SELECT id,
//             UNNEST(tags) AS tag
//         FROM "Media"
//         WHERE "clustersId" = 3
//     ),

//     tag_segments AS (
//     SELECT id,
//             tag,
//             ARRAY_LENGTH(string_to_array(tag, '/'), 1) AS depth
//     FROM exploded_tags
//     WHERE POSITION('/' IN tag) > 0        -- tags containing /
//     ),

//     least_segments_tag AS (
//     SELECT MIN(ARRAY_LENGTH(string_to_array(tag, '/'), 1)) AS min_depth
//     FROM tag_segments
//     )

//     SELECT DISTINCT ON (tag_segments.tag) tag_segments.tag, 
//                                         tag_segments.id 
//     FROM tag_segments 
//     JOIN least_segments_tag 
//     ON tag_segments.depth = least_segments_tag.min_depth
//     ORDER BY tag_segments.tag DESC;
// `)

// export const GET: RequestHandler = async ({ params }) => {

//     const data = await prisma.$queryRaw`
//         SELECT g1.name, 

//         CASE WHEN (
//             SELECT g2.id FROM "Groups" as g2
//             LEFT JOIN "Media" ON "Media"."groupId" = g2.id
//             WHERE g2."parentId" = g1.id
//             LIMIT 1
//         ) IS NULL
//         THEN g1.id
//         ELSE (
//             SELECT g2.id FROM "Groups" as g2
//             LEFT JOIN "Media" ON "Media"."groupId" = g2.id
//             WHERE g2."parentId" = g1.id
//             LIMIT 1
//         )
//         END id,
        
//         CASE WHEN (
//             SELECT MIN("Media".id) FROM "Media"
//             WHERE "Media"."groupId" = g1.id
//         ) IS NULL
//         THEN (
//             SELECT "Media".id FROM "Groups" as g2
//             LEFT JOIN "Media" ON "Media"."groupId" = g2.id
//             WHERE g2."parentId" = g1.id AND g2.name != 'transparent'
//             LIMIT 1
//         )
//         ELSE (
//             SELECT MIN("Media".id) FROM "Media"
//             WHERE "Media"."groupId" = g1.id
//         )
        
//         END "Media"
//         FROM "Groups" as g1
//         WHERE g1."clusterId" = ${Number(params.cluster)} AND g1."parentId" IS NULL AND g1."id" > 0
//     `

//     return new Response(JSON.stringify(data))
// }