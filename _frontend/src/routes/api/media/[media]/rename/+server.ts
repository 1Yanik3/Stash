import type { RequestHandler } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

export const PUT: RequestHandler = async ({ params, request }) => {
  await prisma.media.update({
    where: { id: params.media },
    data: {
      name: (await request.json()).name
    }
  })

  return new Response()
}
