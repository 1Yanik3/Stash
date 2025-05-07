import { json } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

// TODO!!!
export const GET: RequestHandler = async ({ params }) =>
    json(
        await prisma.$queryRaw`
        SELECT DISTINCT ON ("Tags"."tag")
            "Tags"."id" AS tagid,
            "Tags"."tag",
            COALESCE("Media"."id", "ChildMedia"."id") AS mediaid
        FROM "Tags"
        LEFT JOIN "_ClustersToTags" ON "_ClustersToTags"."B" = "Tags"."id"
        LEFT JOIN "_MediaToTags" ON "_MediaToTags"."B" = "Tags"."id"
        LEFT JOIN "Media" ON "Media"."id" = "_MediaToTags"."A"
        LEFT JOIN LATERAL (
            SELECT "Media"."id"
            FROM "Tags" AS child
            JOIN "_MediaToTags" ON "_MediaToTags"."B" = child."id"
            JOIN "Media" ON "Media"."id" = "_MediaToTags"."A"
            WHERE child."parentId" = "Tags"."id"
            ORDER BY "Media"."date" ASC
            LIMIT 1
        ) AS "ChildMedia" ON TRUE
        WHERE "Tags"."parentId" IS NULL
            AND "_ClustersToTags"."A" = 3
        ORDER BY
            "Tags"."tag" DESC,
            "Media"."date" ASC;

`
    )
