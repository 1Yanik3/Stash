import prisma from "../prisma"

export const getTags = async (d: {
  cluster: string
  mediaTypeFilter: string
  favouritesOnly: boolean
}) => {
  const typeFilter = d.mediaTypeFilter
    ? /*sql*/ `
        AND "Media"."type" LIKE '${d.mediaTypeFilter}%'
    `
    : ""

  const favouriteFilter = d.favouritesOnly
    ? /*sql*/ `
        AND "Media"."favourited" = true
    `
    : ""

  return (await prisma.$queryRawUnsafe(/*sql*/ `
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
                    "Media"."clustersId" = (SELECT id FROM "Clusters" WHERE "Clusters"."name" = '${d.cluster}')
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
                    "_ClustersToTags"."A" = (SELECT id FROM "Clusters" WHERE "Clusters"."name" = '${d.cluster}')
            ),
            AllRelatedTags AS (
                -- Get all tags related to the TagsWithCluster (including parent tags)
                SELECT
                    th1."id"
                FROM
                    TagHierarchy th1
                INNER JOIN TagsWithCluster twc ON th1."id" = twc.tag_id
                UNION
                -- Include parents of the related tags
                SELECT
                    th2."parentId" AS "id"
                FROM
                    TagHierarchy th2
                WHERE
                    th2."id" IN (SELECT tag_id FROM TagsWithCluster)
            )
        SELECT
            "Tags".*,
            COALESCE(TagsWithMedia.media_count, 0) AS count
        FROM
            "Tags"
        LEFT JOIN TagsWithMedia ON "Tags"."id" = TagsWithMedia.tag_id
        WHERE "Tags"."id" IN (SELECT "id" FROM AllRelatedTags);
    `)) as any
}
