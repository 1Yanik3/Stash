import { error } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const PATCH: RequestHandler = async ({ request, params }) => {
  const { icon, collapsed } = await request.json()

  if (icon == undefined && collapsed == undefined)
    throw error(400, "Invalid or missing field(s)")

  if (icon != undefined) {
    await prisma.tags.update({
      where: {
        id: +params.id
      },
      data: {
        icon
      }
    })
  }

  if (collapsed != undefined) {
    if (collapsed != true && collapsed != false)
      throw error(400, "Collapsed can only be true or false")

    await prisma.tags.update({
      where: {
        id: +params.id
      },
      data: {
        collapsed
      }
    })
  }

  return new Response(null, { status: 200 })
}
