import { error, json } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request }) => {
  const { tag, icon } = await request.json()

  if (!tag || !icon) throw error(400)

  await prisma.tagIcons.create({
    data: {
      tag,
      icon
    }
  })

  return new Response(null, { status: 201 })
}

export const DELETE: RequestHandler = async ({ request }) => {
  const { tag } = await request.json()

  if (!tag) throw error(404)

  await prisma.tagIcons.delete({
    where: {
      tag
    }
  })

  return new Response(null, { status: 200 })
}
