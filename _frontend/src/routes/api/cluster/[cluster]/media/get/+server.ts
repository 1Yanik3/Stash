import { json } from "@sveltejs/kit"

import { setMethods, sortingMethods } from "$lib/../types"
import prisma from "$lib/server/prisma"
import { pageSize } from "$lib/stores"

import type { RequestHandler } from "./$types"

export type MediaGetRequestBodyData = {
  tags: number[]
  offset: number
  favouritesOnly: boolean
  specialFilterAttribute: string | null
  seed: number
  activeSortingMethod: number
}

export const POST: RequestHandler = async ({ params, request }) => {
  const body: MediaGetRequestBodyData = await request.json()

  return json(
    await prisma.$queryRawUnsafe(/*sql*/ `
      SELECT
        "Media".*,
        STRING_AGG ("Tags"."id"::text, ',') as tags
      FROM
        "Media"
        RIGHT JOIN "_MediaToTags" ON "_MediaToTags"."A" = "Media"."id"
        RIGHT JOIN "Tags" ON "_MediaToTags"."B" = "Tags"."id"
      WHERE
        "Media"."clustersId" = (SELECT id FROM "Clusters" WHERE "Clusters".name = '${
          params.cluster
        }')
        ${assembleTagsFilter(body.tags)}
        ${assembleFavouritesOnlyFilter(body.favouritesOnly)}
        ${assembleSpecialFilterAttributeFilter(body.specialFilterAttribute)}
      GROUP BY
        "Media"."id"
      ${await assembleOrderBy(body)}
      LIMIT ${pageSize}
      OFFSET ${body.offset}
    `)
  )
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

const assembleOrderBy = async (body: MediaGetRequestBodyData) => {
  if (sortingMethods[body.activeSortingMethod].icon === "mdiSort")
    await prisma.$executeRawUnsafe(/*sql*/ `
      SELECT setseed(${body.seed});
    `)
  return /*sql*/ `
    ORDER BY ${sortingMethods[body.activeSortingMethod].orderBy}
  `
}
