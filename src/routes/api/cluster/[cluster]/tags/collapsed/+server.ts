import { PrismaClient } from "@prisma/client"
import type { RequestHandler } from "@sveltejs/kit"

const prisma = new PrismaClient()

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
