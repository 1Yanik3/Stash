import type { Media } from "@prisma/client"

import prisma from "$lib/server/prisma"
import { pageSize } from "$lib/stores"

import { sortingMethods } from "../../../types"

export const getMedia = async (d: {
  cluster: string
  tags: number[]
  offset: number
  favouritesOnly: boolean
  specialFilterAttribute: string | null
  seed: number
  activeSortingMethod: number
}) => {
  return (await prisma.$queryRawUnsafe(/*sql*/ `
        SELECT
            "Media".*,
            STRING_AGG ("Tags"."id"::text, ',') as tags
        FROM
            "Media"
            RIGHT JOIN "_MediaToTags" ON "_MediaToTags"."A" = "Media"."id"
            RIGHT JOIN "Tags" ON "_MediaToTags"."B" = "Tags"."id"
        WHERE
            "Media"."clustersId" = (SELECT id FROM "Clusters" WHERE "Clusters".name = '${d.cluster}')
            ${assembleTagsFilter(d.tags)}
            ${assembleFavouritesOnlyFilter(d.favouritesOnly)}
            ${assembleSpecialFilterAttributeFilter(d.specialFilterAttribute)}
        GROUP BY
            "Media"."id"
        ${await assembleOrderBy(d)}
        LIMIT ${pageSize}
        OFFSET ${d.offset}
    `)) as (Media & { tags: string })[]
}

const assembleTagsFilter = (tags: number[]) => {
  if (tags.length === 0) return ""
  return /*sql*/ `
      AND "Media"."id" IN (
        SELECT
          "_MediaToTags"."A"
        FROM
          "_MediaToTags"
        WHERE
          "_MediaToTags"."B" IN (${tags.join(",")})
      )
      `
}

const assembleFavouritesOnlyFilter = (favouritesOnly: boolean) => {
  if (!favouritesOnly) return ""
  return /*sql*/ `
      AND "Media"."favourited" = true
    `
}

const assembleSpecialFilterAttributeFilter = (
  specialFilterAttribute: string | null
) => {
  if (!specialFilterAttribute) return ""
  if (specialFilterAttribute == "show_unknown")
    return /*sql*/ `
        AND "Media"."specialFilterAttribute" IS NULL
      `
  return /*sql*/ `
      AND "Media"."specialFilterAttribute" = '${specialFilterAttribute}'
    `
}

const assembleOrderBy = async (d: {
  seed: number
  activeSortingMethod: number
}) => {
  if (sortingMethods[d.activeSortingMethod].icon === "mdiSort")
    await prisma.$executeRawUnsafe(/*sql*/ `
        SELECT setseed(${d.seed});
      `)
  return /*sql*/ `
      ORDER BY ${sortingMethods[d.activeSortingMethod].orderBy}
    `
}
