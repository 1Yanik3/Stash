import fs from "fs/promises"

import { json } from "@sveltejs/kit"
import mime from "mime-types"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

const importFolderPath = "./importables"

export const GET: RequestHandler = async () =>
  json(
    (await fs.readdir(importFolderPath, { withFileTypes: true }))
      .filter(f => f.isFile() && !f.name.startsWith("."))
      .map(f => f.name)
  )

export const POST: RequestHandler = async ({ params, request }) => {
  const {
    filename,
    selectedTags
  }: { filename: string; selectedTags: number[] } = await request.json()

  const { id: mediaId, type } = await prisma.media.create({
    data: {
      name: filename,
      type: mime.lookup(`${importFolderPath}/${filename}`) || "Unknown",
      date: new Date(),
      height: 0,
      width: 0,
      cluster: {
        connect: {
          id: +params.cluster
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

  await fs.copyFile(`${importFolderPath}/${filename}`, `./media/${mediaId}`)
  await fs.rm(`${importFolderPath}/${filename}`)

  await prisma.job.create({
    data: {
      name: "updateMediaMetadataFromFile",
      data: JSON.stringify({ id: mediaId, initial: true }),
      priority: 15
    }
  })

  await prisma.job.create({
    data: {
      name: "createMediaThumbnail",
      data: JSON.stringify({ id: mediaId }),
      priority: 10
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
