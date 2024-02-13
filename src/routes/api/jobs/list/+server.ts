import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

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
