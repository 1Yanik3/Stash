import fs from "fs/promises"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ params, request }) => {
  const data = await request.formData()
  const file = data.get("file") as File
  const selectedTags: number[] = JSON.parse(data.get("selectedTags") as string)

  const { id: mediaId, type } = await prisma.media.create({
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
      }
    }
  })

  for (const tagId of selectedTags) {
    await prisma.tags.update({
      where: {
        id: tagId
      },
      data: {
        media: {
          connect: {
            id: mediaId
          }
        }
      }
    })
  }

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

  if (type.startsWith("video")) {
    await prisma.job.create({
      data: {
        name: "createMediaSeekThumbnails",
        data: JSON.stringify({ id: mediaId })
      }
    })
  }

  return new Response()
}
