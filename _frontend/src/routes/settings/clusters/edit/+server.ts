import prisma from "$lib/server/prisma"

import { error } from "@sveltejs/kit"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request }) => {
  const { id, attribute, value } = await request.json()

  if (!id || !attribute || !value) throw error(400, "Missing required fields")

  switch (attribute) {
    case "name":
      await prisma.clusters.update({
        where: {
          id
        },
        data: {
          name: value
        }
      })
      break
    case "icon":
      await prisma.clusters.update({
        where: {
          id
        },
        data: {
          icon: value
        }
      })
      break
    case "type":
      await prisma.clusters.update({
        where: {
          id
        },
        data: {
          type: value
        }
      })
      break
    default:
      throw error(400, "Invalid attribute")
  }

  return new Response(null, { status: 200 })
}
