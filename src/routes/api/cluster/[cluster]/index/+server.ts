import { PrismaClient } from "@prisma/client"
import { json } from "@sveltejs/kit"

import type { RequestHandler } from "./$types"

const prisma = new PrismaClient()

// TODO
export const GET: RequestHandler = async ({ params }) =>
  json(
    await prisma.$queryRaw`
    SELECT DISTINCT ON (tag)
        SPLIT_PART(UNNEST(tags), '/', 1) AS tag,
        "Media".id
    FROM "Media"
    WHERE "clustersId" = 3
    ORDER BY
        tag DESC,
        "Media".date ASC
`
  )
