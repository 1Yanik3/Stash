import { PrismaClient } from "@prisma/client"

import type { RequestHandler } from "./$types"

const prisma = new PrismaClient()

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
