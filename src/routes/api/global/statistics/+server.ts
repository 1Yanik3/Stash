import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

// TODO: Do we still use this?

export const GET: RequestHandler = async () => {
  const clusters = await prisma.clusters.findMany()

  let output: any[] = []

  for (const i in clusters) {
    const cluster = clusters[i]

    output.push({
      id: cluster.id,
      mediaCount:
        (await prisma.media.count({ where: { group: { cluster } } })) +
        (await prisma.story.count({ where: { cluster } }))
    })
  }

  return new Response(JSON.stringify(output))
}
