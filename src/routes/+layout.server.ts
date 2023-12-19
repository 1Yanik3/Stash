import { PrismaClient } from "@prisma/client"

import type { LayoutServerLoad } from "./$types"

export const ssr = true

const prisma = new PrismaClient()

export const load: LayoutServerLoad = async ({ url }) => {
  const clusters = await prisma.clusters.findMany()

  const tagIcons = await prisma.tagIcons.findMany()

  let serverURL = "https://stash.hera.lan"
  if (url.hostname == "stash.any.gay") serverURL = "https://stash.any.gay"

  return {
    clusters,
    tagIcons,
    serverURL
  }
}
