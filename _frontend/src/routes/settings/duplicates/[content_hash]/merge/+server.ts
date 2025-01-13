import fs from "fs/promises"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export type DuplicatesMergeServerPutRequestData = {
  idToKeep: string
  idsToRemove: string[]
  attributesToKeep: {
    name: string
    clustersId: number
    favourited: boolean
    tags: number[]
    createdDate: string
    date: string
    groupedIntoNamesId: number | null
    specialFilterAttribute: string
  }
}

export const PUT: RequestHandler = async ({ request }) => {
  const data: DuplicatesMergeServerPutRequestData = await request.json()

  if (!data.idToKeep) {
    return new Response("Did not specify 'idToKeep'", { status: 400 })
  }
  if (!data.idsToRemove) {
    return new Response("Did not specify 'idsToRemove'", { status: 400 })
  }
  if (!data.attributesToKeep) {
    return new Response("Did not specify 'attributesToKeep'", { status: 400 })
  }
  if (!data.attributesToKeep.name) {
    return new Response("Did not specify 'attributesToKeep.name'", {
      status: 400
    })
  }
  if (!data.attributesToKeep.clustersId) {
    return new Response("Did not specify 'attributesToKeep.clustersId'", {
      status: 400
    })
  }
  if (!data.attributesToKeep.tags) {
    return new Response("Did not specify 'attributesToKeep.tags'", {
      status: 400
    })
  }
  if (!data.attributesToKeep.createdDate) {
    return new Response("Did not specify 'attributesToKeep.createdDate'", {
      status: 400
    })
  }
  if (!data.attributesToKeep.date) {
    return new Response("Did not specify 'attributesToKeep.date'", {
      status: 400
    })
  }
  if (!data.attributesToKeep.groupedIntoNamesId && data.attributesToKeep.groupedIntoNamesId !== null) {
    return new Response(
      "Did not specify 'attributesToKeep.groupedIntoNamesId'",
      { status: 400 }
    )
  }
  if (!data.attributesToKeep.specialFilterAttribute) {
    return new Response(
      "Did not specify 'attributesToKeep.specialFilterAttribute'",
      { status: 400 }
    )
  }

  await prisma.media.update({
    where: { id: data.idToKeep },
    data: {
      name: data.attributesToKeep.name,
      clustersId: data.attributesToKeep.clustersId,
      favourited: data.attributesToKeep.favourited,
      tags: {
        set: data.attributesToKeep.tags.map(tag => ({ id: tag }))
      },
      createdDate: new Date(data.attributesToKeep.createdDate),
      date: new Date(data.attributesToKeep.date),
      groupedIntoNamesId: data.attributesToKeep.groupedIntoNamesId,
      specialFilterAttribute: data.attributesToKeep.specialFilterAttribute
    }
  })

  for (const id of data.idsToRemove) {
    await fs.rm(`./media/${id}`)
    await fs.rm(`./thumb/${id}.webp`)
    await fs.rm(`./thumb/${id}_seek.webm`, { force: true })
    await prisma.media.delete({ where: { id } })
  }

  return new Response(null, { status: 204 })
}
