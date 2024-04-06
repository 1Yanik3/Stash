import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async () => {
  const clusters = await prisma.clusters.findMany({
    include: {
      _count: {
        select: {
          Media: true,
          stories: true
        }
      }
    },
    orderBy: {
      sortOrder: "asc"
    }
  })

  const output = {
    media_count: clusters.reduce(
      (acc, cluster) => acc + cluster._count.Media,
      0
    ),
    clusters: clusters.map(cluster => ({
      id: cluster.id,
      name: cluster.name,
      icon: cluster.icon,
      type: cluster.type,
      media_count: cluster._count.Media || cluster._count.stories
    }))
  }

  return new Response(JSON.stringify(output))
}
