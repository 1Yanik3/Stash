import prisma from "$lib/server/prisma"
import fs from "fs/promises"
import mime from "mime-types"

import { json } from "@sveltejs/kit"

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
  }: { filename: string; selectedTags: string[] } = await request.json()

  const { id: mediaId } = await prisma.media.create({
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
      },
      tags: selectedTags.map(t => t.toLocaleLowerCase()) || []
    }
  })

  await fs.copyFile(`${importFolderPath}/${filename}`, `./media/${mediaId}`)
  await fs.rm(`${importFolderPath}/${filename}`)

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
