import fs from "fs/promises"

import type { RequestHandler } from "./$types"

const thumbnailRoot = "./thumbnails"

export const GET: RequestHandler = async ({ params }) => {
  try {
    return new Response(
      await fs.readFile(`${thumbnailRoot}/${params.media}_seek.webm`)
    )
  } catch (e: any) {
    console.error(`No seek found for ${params.media}`, e.message)

    return new Response("No seek found", {
      status: 404
    })
  }
}
