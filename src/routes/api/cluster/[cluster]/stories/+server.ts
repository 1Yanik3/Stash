import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ params }) =>
  new Response(
    JSON.stringify(
      await prisma.story.findMany({
        where: {
          cluster: {
            name: params.cluster
          }
        }
      })
    )
  )

export const POST: RequestHandler = async ({ params, request }) => {
  const { title, source, content } = await request.json()

  const { id } = await prisma.story.create({
    data: {
      title,
      source,
      content,
      clusterId: +params.cluster
    }
  })

  return new Response(JSON.stringify({ id }))
}
