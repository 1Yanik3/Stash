import prisma from "$lib/server/prisma"

import { error } from "@sveltejs/kit"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request }) => {
  const { name, icon, type } = await request.json()

  if (!name || !icon || !type) throw error(400)

  await prisma.clusters.create({
    data: {
      name,
      icon,
      type
    }
  })

  return new Response(null, { status: 201 })
}
