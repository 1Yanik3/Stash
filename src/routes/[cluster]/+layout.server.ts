import prisma from "$lib/server/prisma"

import { error } from "@sveltejs/kit"

import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ params, depends }) => {
  depends("cluster")

  const clusters = await prisma.clusters.findMany()
  const cluster = clusters.find(c => c.name == params.cluster) ||
    clusters[0] || {
      name: "default",
      id: 0,
      icon: "mdiUnknown",
      sortOrder: 1,
      type: "normal"
    }

  return {
    cluster
  }
}
