import { PrismaClient } from "@prisma/client"

import type { RequestHandler } from "./$types"

const prisma = new PrismaClient()

export const GET: RequestHandler = async () =>
  new Response(
    JSON.stringify({
      missingDateExtraction: await prisma.media.count({
        where: {
          createdDate: new Date(0)
        }
      }),

      inTrash: await prisma.media.count({
        where: {
          groupId: {
            in: (await prisma.clusters.findMany())
              .map(c => c.trashGroupId)
              .filter(a => typeof a == "number") as number[]
          }
        }
      })
    })
  )
