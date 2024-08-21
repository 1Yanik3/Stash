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
                -- Base case: start with all tags
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
                    "Tags"
                    INNER JOIN TagHierarchy ON "Tags"."parentId" = TagHierarchy."id"
            ),
            TagsWithMedia AS (
                -- Find tags with media associated
                SELECT
                    "Tags"."id" AS tag_id,
                    COUNT(DISTINCT "Media"."id")::INTEGER AS media_count
                FROM
                    "Tags"
                LEFT JOIN "_MediaToTags" ON "_MediaToTags"."B" = "Tags"."id"
                LEFT JOIN "Media" ON "_MediaToTags"."A" = "Media"."id"
                WHERE
                    "Media"."clustersId" = (SELECT id FROM "Clusters" WHERE "Clusters"."name" = '${params.cluster}')
                    ${typeFilter}
                    ${favouriteFilter}
                GROUP BY
                    "Tags"."id"
            ),
            ParentTags AS (
                -- Find parent tags which are parents of tags with media
                SELECT DISTINCT
                    "Tags"."id"
                FROM
                    "Tags"
                INNER JOIN TagHierarchy ON TagHierarchy."parentId" = "Tags"."id"
                INNER JOIN TagsWithMedia ON TagsWithMedia.tag_id = TagHierarchy.id
            )
        SELECT
            "Tags".*,
            COALESCE(TagsWithMedia.media_count, 0) AS count
        FROM
            "Tags"
        LEFT JOIN TagsWithMedia ON "Tags"."id" = TagsWithMedia.tag_id
        WHERE
            "Tags"."id" IN (SELECT id FROM ParentTags)
            OR TagsWithMedia.media_count > 0;

    `)
  )
}
