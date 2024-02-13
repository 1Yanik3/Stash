import prisma from "$lib/server/prisma"

import { type RequestHandler, error } from "@sveltejs/kit"

export const PUT: RequestHandler = async ({ params, request }) => {
  const { name } = await request.json()

  await prisma.media.update({
    data: {
      tags: {
        push: name.toLowerCase()
      }
    },
    where: {
      id: params.media
    }
  })

  return new Response()
}

export const DELETE: RequestHandler = async ({ params, request }) => {
  const { name } = await request.json()

  if (!name) {
    throw error(400, "No tag name supplied")
  }

  const media = await prisma.media.findUniqueOrThrow({
    where: {
      id: params.media
    }
  })

  await prisma.media.update({
    data: {
      tags: media.tags
        .map(t => t.toLowerCase())
        .filter(t => t !== name.toLowerCase())
    },
    where: {
      id: media.id
    }
  })

  return new Response()
}
