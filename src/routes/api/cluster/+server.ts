import prisma from "$lib/server/prisma"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async () =>
  new Response(JSON.stringify(await prisma.clusters.findMany()))
