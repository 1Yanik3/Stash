import { error, type RequestHandler } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

export const POST: RequestHandler = async ({ request, params }) => {
    const { name, parentId } = await request.json()
  
    if (!name) throw error(400, "Missing name")
  
    if (!parentId) {
      const parent = await prisma.tags.findUnique({ where: { id: parentId } })
      if (parent) throw error(409, "Provided parent does not exist")
    }
  
    await prisma.tags.create({
      data: {
        tag: name,
        parentId: parentId,
        clusters: {
            connect: {
                name: params.cluster
            }
        }
      }
    })
  
    return new Response(null, { status: 200 })
  }
  