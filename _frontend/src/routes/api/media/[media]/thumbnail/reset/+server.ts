import fs from "fs/promises"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

const thumbnailRoot = "./thumbnails"

export const GET: RequestHandler = async ({ params }) => {
  await fs.rm(`${thumbnailRoot}/${params.media}.webp`, { force: true })

  await prisma.job.create({
    data: {
      name: "createMediaThumbnail",
      data: JSON.stringify({ id: params.media }),
      priority: 10
    }
  })

  return new Response(null, { status: 200 })
}
