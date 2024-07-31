import fs from "fs/promises"

import type { RequestHandler } from "./$types"
import prisma from "$lib/server/prisma"

const thumbnailRoot = "./thumbnails"

export const GET: RequestHandler = async ({ params }) => {
  try {
    return new Response(
      await fs.readFile(`${thumbnailRoot}/${params.media}.webp`)
    )
  } catch {
    try {
      // create thumbnail
      // TODO: this should be a task
      // sawait createThumbnail(params)

      // respond with thumbnail
      return new Response(
        await fs.readFile(`${thumbnailRoot}/${params.media}.webp`)
      )
    } catch (e: any) {
      console.error("Error generating thumbnail", e.message)
      return new Response("Thumbnail was unable to be found or generated!", {
        status: 500
      })
    }
  }
}

export const POST: RequestHandler = async ({ request, params }) => {
  const data = await request.formData()
  const file = data.get("file") as File
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  await fs.writeFile(
    `${thumbnailRoot}/${params.media}.original.webp`,
    fileBuffer
  )

  await prisma.job.create({
    data: {
      name: "createMediaThumbnail",
      data: JSON.stringify({ id: params.media })
    }
  })

  return new Response()
}