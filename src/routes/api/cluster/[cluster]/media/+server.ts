import { setMethods, sortingMethods } from "$lib/../types"
// import { ExifParserFactory } from "ts-exif-parser"
import sharedImportLogic from "$lib/sharedImportLogic"
import fs from "fs/promises"

import { json } from "@sveltejs/kit"

import type { RequestHandler } from "./$types"
import prisma from "$lib/server/prisma"

export const GET: RequestHandler = async ({ params, request }) => {
  const searchParams = new URL(request.url).searchParams
  const traverse = searchParams.get("traverse") == "true"
  const tags = searchParams.get("tags")?.split(",") || []
  const activeSortingMethod =
    sortingMethods[+(searchParams.get("activeSortingMethod") || 0)]
  const activeSetMethod =
    setMethods[+(searchParams.get("activeSetMethod") || 0)]
  const mediaTypeFilter = searchParams.get("mediaTypeFilter") || ""

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
        AND NOT "Media"."tags" @> ARRAY['group']
    `
  // TODO: Traverse for AND
  else if (tags[0]?.length)
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

  const query = /*sql*/ `
        SELECT m.*
        FROM (
            SELECT DISTINCT "Media".*
            FROM "Media",
            unnest("Media"."tags") AS t(tag) 
            WHERE "Media"."clustersId" = (SELECT id FROM "Clusters" WHERE "Clusters".name = '${params.cluster}')
            ${typeFilter}
            ${tagsFilter}
        ) AS m
        ORDER BY ${activeSortingMethod.orderBy}
    `

  return json(await prisma.$queryRawUnsafe(query))
}

export const POST: RequestHandler = async ({ params, request }) => {
  console.time("media post request: formData")
  const data = await request.formData()
  console.timeEnd("media post request: formData")

  console.time("media post request: get file")
  const file = data.get("file") as File
  const selectedTags = (data.get("selectedTags") as string).split(",")
  console.timeEnd("media post request: get file")

  console.time("media post request: create db entry")

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
  console.timeEnd("media post request: create db entry")

  // TODO: Get rid of this step
  console.time("media post request: get buffer")
  const fileBuffer = Buffer.from(await file.arrayBuffer())
  console.timeEnd("media post request: get buffer")

  console.time("media post request: store file")
  // store file
  await fs.writeFile(`./media/${mediaId}`, fileBuffer)
  console.timeEnd("media post request: store file")

  await sharedImportLogic(file.name, mediaId)

  return new Response()
}
