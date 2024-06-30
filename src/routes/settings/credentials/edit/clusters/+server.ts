import prisma from "$lib/server/prisma"

import { error } from "@sveltejs/kit"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request }) => {
  const { id, clusters }: { id: number; clusters: number[] } =
    await request.json()

  if (!id || !clusters) throw error(400, "Missing required fields")

  await prisma.credentials.update({
    where: { id },
    data: {
      permittedClusters: {
        set: clusters.map(cluster => ({ id: cluster }))
      }
    }
  })

  return new Response(null, { status: 200 })
}
