import prisma from "$lib/server/prisma"

import type { RequestHandler } from "@sveltejs/kit"

export const PUT: RequestHandler = async ({ params, request }) => {
  await prisma.media.update({
    where: { id: params.media },
    data: {
      name: (await request.json()).name
    }
  })

  return new Response()
}
