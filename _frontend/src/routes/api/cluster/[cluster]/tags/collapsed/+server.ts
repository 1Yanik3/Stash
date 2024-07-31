import prisma from "$lib/server/prisma"

import { type RequestHandler, json } from "@sveltejs/kit"

export const GET: RequestHandler = async ({ params }) =>
  json(
    (
      await prisma.collapsedTags.findMany({
        where: {
          Cluster: {
            name: params.cluster
          }
        },
        select: {
          tag: true
        }
      })
    ).map(({ tag }) => tag)
  )

export const POST: RequestHandler = async ({ request, params }) => {
  const { tag } = await request.json()
  if (!tag) return new Response(null, { status: 400 })

  await prisma.collapsedTags.create({
    data: {
      tag,
      Cluster: {
        connect: {
          name: params.cluster
        }
      }
    }
  })

  return new Response(null, { status: 201 })
}

export const DELETE: RequestHandler = async ({ request, params }) => {
  const { tag } = await request.json()
  if (!tag) return new Response(null, { status: 400 })

  await prisma.collapsedTags.delete({
    where: {
      tag,
      Cluster: {
        name: params.cluster
      }
    }
  })

  return new Response(null, { status: 200 })
}
