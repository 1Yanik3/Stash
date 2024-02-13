import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ params }) =>
  new Response(
    (
      await prisma.groupedIntoNames.findFirst({
        where: {
          id: +params.id
        }
      })
    )?.name || "Unknown"
  )
