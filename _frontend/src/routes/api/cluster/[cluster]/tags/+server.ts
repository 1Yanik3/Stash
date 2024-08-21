import { json, type RequestHandler } from "@sveltejs/kit"

import { setMethods } from "$lib/../types"
import prisma from "$lib/server/prisma"

export const GET: RequestHandler = async ({ params, url }) => {
  //   const activeSetMethod =
  //     setMethods[+(url.searchParams.get("activeSetMethod") || 0)]
  //   const tags = url.searchParams.get("tags")?.split(",") || []
  const mediaTypeFilter = url.searchParams.get("mediaTypeFilter") || ""
  const favouritesOnly = url.searchParams.get("favouritesOnly") == "true"

  //   let tagsFilter = ""
  //   if (activeSetMethod.title == "AND" && tags[0].length)
  //     tagsFilter = /*sql*/ `
  //             AND (
  //                 ${tags
  //                   .map(
  //                     tag => `("Media"."tags" @> ARRAY['${tag.toLowerCase()}'])`
  //                   )
  //                   .join(" AND ")}
  //             )
  //         `

  const typeFilter = mediaTypeFilter
    ? /*sql*/ `
                AND "Media"."type" LIKE '${mediaTypeFilter}%'
            `
    : ""

  const favouriteFilter = favouritesOnly
    ? /*sql*/ `
                AND "Media"."favourited" = true
            `
    : ""

  return json(
    await prisma.$queryRawUnsafe(/*sql*/ `
        WITH RECURSIVE
            TagHierarchy AS (
                -- Base case: start with the tag itself
                SELECT
                    "id",
                    "parentId"
                FROM
                    "Tags"
                UNION ALL
                -- Recursive case: find children of the current tag
                SELECT
                    "Tags"."id",
                    "Tags"."parentId"
                FROM
                    "Tags" "Tags"
                    INNER JOIN TagHierarchy ON "Tags"."parentId" = TagHierarchy."id"
            )
        SELECT
            "Tags".*,
            COUNT(DISTINCT "Media"."id")::INTEGER AS count
            -- COALESCE(
            --     SUM(
            --         CASE
            --             WHEN TagHierarchy.id IS NOT NULL THEN 1
            --             ELSE 0
            --         END
            --     ),
            --     0
            -- )::INTEGER AS indirect_count
        FROM
            "Tags"
            LEFT JOIN "_MediaToTags" ON "_MediaToTags"."B" = "Tags"."id"
            LEFT JOIN "Media" ON "_MediaToTags"."A" = "Media"."id"
            LEFT JOIN TagHierarchy ON TagHierarchy."parentId" = "Tags"."id"
        WHERE
            "Media"."clustersId" = (SELECT id FROM "Clusters" WHERE "Clusters".name = '${params.cluster}')
            ${typeFilter}
            ${favouriteFilter}
        GROUP BY
            "Tags"."id";
    `)
  )
}
