import { PrismaClient } from "@prisma/client"

import type { RequestHandler } from "./$types"

const prisma = new PrismaClient()

export const GET: RequestHandler = async () =>
  new Response(JSON.stringify(await prisma.clusters.findMany()))
