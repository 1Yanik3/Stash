import { json } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

// TODO
export const GET: RequestHandler = async ({ params }) =>
  json(
    await prisma.$queryRaw`
        SELECT DISTINCT ON ("Tags"."tag")
            "Tags"."id" as tagid,
            "Tags"."tag",
            "Media"."id" AS mediaid
        FROM "Tags"
        LEFT JOIN "_MediaToTags" ON "_MediaToTags"."B" = "Tags"."id"
        LEFT JOIN "Media" ON "Media"."id" = "_MediaToTags"."A"
        WHERE "Tags"."parentId" IS NULL AND "Media"."clustersId" = 3
        ORDER BY
            "Tags"."tag" DESC,
            "Media".date ASC;
`
  )
