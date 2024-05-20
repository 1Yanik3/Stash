import prisma from "$lib/server/prisma"
import fs from "fs/promises"

import type { RequestHandler } from "./$types"

const mediaRoot = "./media"

export const GET: RequestHandler = async ({ params }) => {
  const { id, name, type } = await prisma.media.findUniqueOrThrow({
    where: { id: params.media }
  })

  return new Response(await fs.readFile(`${mediaRoot}/${id}`), {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${name}"`
    }
  })
}
