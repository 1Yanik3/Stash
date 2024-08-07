import { error, type RequestHandler } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

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
