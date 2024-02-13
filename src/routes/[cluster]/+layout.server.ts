import prisma from "$lib/server/prisma"

import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ params, depends, url }) => {
  depends("cluster")

  const clusters = await prisma.clusters.findMany()
  const cluster = clusters.find(c => c.name == params.cluster) || clusters[0]

  return {
    cluster
  }
}
