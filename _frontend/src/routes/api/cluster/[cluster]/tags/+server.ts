import { error, json, type RequestHandler } from "@sveltejs/kit"

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
            TagsWithCluster AS (
                -- Find tags associated with the current cluster
                SELECT
                    "Tags"."id" AS tag_id
                FROM
                    "Tags"
                INNER JOIN "_ClustersToTags" ON "_ClustersToTags"."B" = "Tags"."id"
                WHERE
                    "_ClustersToTags"."A" = (SELECT id FROM "Clusters" WHERE "Clusters"."name" = '${params.cluster}')
            )
        SELECT
            "Tags".*,
            COALESCE(TagsWithMedia.media_count, 0) AS count
        FROM
            "Tags"
        LEFT JOIN TagsWithMedia ON "Tags"."id" = TagsWithMedia.tag_id
        WHERE "Tags"."id" IN (SELECT tag_id FROM TagsWithCluster)
    `)
  )
}

export const POST: RequestHandler = async ({ request, params }) => {
    const { name, parentId } = await request.json()
  
    if (!name) throw error(400, "Missing name")
  
    if (!parentId) {
      const parent = await prisma.tags.findUnique({ where: { id: parentId } })
      if (parent) throw error(409, "Provided parent does not exist")
    }
  
    await prisma.tags.create({
      data: {
        tag: name,
        parentId: parentId,
        clusters: {
            connect: {
                name: params.cluster
            }
        }
      }
    })
  
    return new Response(null, { status: 200 })
  }
  