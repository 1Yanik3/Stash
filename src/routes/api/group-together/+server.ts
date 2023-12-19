import { PrismaClient } from "@prisma/client"
import type { RequestHandler } from "@sveltejs/kit"

const prisma = new PrismaClient()

export const POST: RequestHandler = async ({ request }) => {
  const ids: string[] = await request.json()

  await prisma.groupedIntoNames.create({
    data: {
      name: ids[0],
      Media: {
        connect: await prisma.media.findMany({
          where: {
            id: {
              in: ids
            }
          },
          select: {
            id: true
          }
        })
      }
    }
  })

  return new Response()
}
