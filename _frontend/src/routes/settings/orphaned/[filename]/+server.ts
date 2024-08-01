import fs from "fs/promises"

import { json } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const DELETE: RequestHandler = async ({ params }) => {
  const media = await prisma.media.findUnique({
    where: {
      id: params.filename
    }
  })

  if (media) {
    return json({ error: "Media found, won't delete" }, { status: 404 })
  }

  await fs.rm(`./media/${params.filename}`)

  return new Response(null, { status: 204 })
}
