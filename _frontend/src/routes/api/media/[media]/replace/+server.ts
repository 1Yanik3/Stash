import fs from "fs/promises"

import type { RequestHandler } from "@sveltejs/kit"

export const PUT: RequestHandler = async ({ params, request }) => {
  const filePath = `./media/${params.media}`
  const thumbnailPath = `./thumbnails/${params.media}.webp`

  // extract data from request
  const data = await request.formData()
  const file = data.get("file") as File
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  // move old file
  await fs.rename(
    filePath,
    filePath + Math.random().toString(16).substring(2, 8)
  )

  // safe new file
  await fs.writeFile(filePath, fileBuffer)

  // // delte thumbnail
  // await fs.rm(thumbnailPath, { force: true })

  return new Response()
}
