import { setMethods, sortingMethods } from "$lib/../types"
import prisma from "$lib/server/prisma"
// import { ExifParserFactory } from "ts-exif-parser"
import { pageSize } from "$lib/stores"
import fs from "fs/promises"

import { json } from "@sveltejs/kit"

import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ params, request }) => {
  const searchParams = new URL(request.url).searchParams
  const traverse = searchParams.get("traverse") == "true"
  const tags = searchParams.get("tags")?.split(",") || []
  const activeSortingMethod =
    sortingMethods[+(searchParams.get("activeSortingMethod") || 0)]
  const activeSetMethod =
    setMethods[+(searchParams.get("activeSetMethod") || 0)]
  const mediaTypeFilter = searchParams.get("mediaTypeFilter") || ""
  const favouritesOnly = searchParams.get("favouritesOnly") == "true"
  const offset = searchParams.get("favouritesOnly")
    ? //   @ts-ignore
      +searchParams.get("offset")
    : 0
  const seed = searchParams.get("seed")
    ? //   @ts-ignore
      +searchParams.get("seed")
    : Math.random()

  let typeFilter: string = ``
  if (mediaTypeFilter)
    typeFilter = /*sql*/ `
        AND "Media"."type" LIKE '${mediaTypeFilter}%'
    `

  let tagsFilter: string = ``

  if (tags[0] == "SHOW_UNSORTED")
    tagsFilter = /*sql*/ `
        AND (array_length("Media"."tags", 1) IS NULL OR tag = 'show_unsorted' OR tag = '')
    `
  else if (tags[0] == "people_count_unknown")
    tagsFilter = /*sql*/ `
        AND NOT "Media"."tags" @> ARRAY['solo']
        AND NOT "Media"."tags" @> ARRAY['two']
        AND NOT "Media"."tags" @> ARRAY['three']
        AND NOT "Media"."tags" @> ARRAY['group']
    `
  else if (tags[0] == "show_single")
    tagsFilter = /*sql*/ `
            AND array_length("Media"."tags", 1) = 1 AND tag != 'show_unsorted'
        `
  else if (tags[0] == "show_dual")
    tagsFilter = /*sql*/ `
            AND array_length("Media"."tags", 1) = 2 AND tag != 'show_unsorted'
        `
  else if (tags[0] == "show_tripple")
    tagsFilter = /*sql*/ `
            AND array_length("Media"."tags", 1) = 3 AND tag != 'show_unsorted'
        `
  // TODO: Traverse for AND
  else if (tags[0]?.length) {
    if (activeSetMethod.title == "OR")
      tagsFilter = /*sql*/ `
                AND (
                    t.tag = ANY (ARRAY[${tags.map(
                      t => `'${t.toLowerCase()}'`
                    )}])
                    ${
                      traverse
                        ? `OR t.tag LIKE ANY (ARRAY[${tags.map(
                            t => `'${t.toLowerCase()}/%'`
                          )}])`
                        : ""
                    }
                )
            `
    else if (activeSetMethod.title == "AND")
      tagsFilter = /*sql*/ `
                AND (
                    ${tags
                      .map(
                        tag =>
                          `("Media"."tags" @> ARRAY['${tag.toLowerCase()}'])`
                      )
                      .join(" AND ")}
                )
            `
  }

  const favouriteFilter = favouritesOnly
    ? /*sql*/ `
            AND "Media"."favourited" = true
        `
    : ""

  // When random
  if (activeSortingMethod.icon == "mdiSort")
    await prisma.$executeRawUnsafe(/*sql*/ `
    SELECT setseed(${seed});
  `)

  const query = /*sql*/ `
        SELECT ${
          activeSortingMethod.icon == "mdiSort" ? "" : "DISTINCT"
        } "Media".*
        FROM "Media",
        unnest("Media"."tags") AS t(tag) 
        WHERE "Media"."clustersId" = (SELECT id FROM "Clusters" WHERE "Clusters".name = '${
          params.cluster
        }')
        ${typeFilter}
        ${tagsFilter}
        ${favouriteFilter}
        ORDER BY ${activeSortingMethod.orderBy}
        LIMIT ${pageSize}
        OFFSET ${offset}
    `

  return json(await prisma.$queryRawUnsafe(query))
}

export const POST: RequestHandler = async ({ params, request }) => {
  const data = await request.formData()
  const file = data.get("file") as File
  const selectedTags = (data.get("selectedTags") as string).split(",")

  const { id: mediaId } = await prisma.media.create({
    data: {
      name: file.name,
      type: file.type,
      date: new Date(),
      height: 0,
      width: 0,
      cluster: {
        connect: {
          name: params.cluster
        }
      },
      tags: selectedTags.map(t => t.toLocaleLowerCase())
    }
  })

  // TODO: Get rid of this step
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  await fs.writeFile(`./media/${mediaId}`, fileBuffer)
  console.timeEnd("media post request: store file")

  await prisma.job.create({
    data: {
      name: "updateMediaMetadataFromFile",
      data: JSON.stringify({ id: mediaId, initial: true })
    }
  })

  await prisma.job.create({
    data: {
      name: "createMediaThumbnail",
      data: JSON.stringify({ id: mediaId })
    }
  })

  return new Response()
}
