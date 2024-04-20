import type { possibleIcons } from "$lib/possibleIcons"
import prisma from "$lib/server/prisma"

import type { LayoutServerLoad } from "./$types"

export const ssr = true

export const load: LayoutServerLoad = async ({ url }) => {
  console.log(new Date().toISOString(), "/+layout.server.ts1", url.pathname)

  let tagIcons = {} as { [icon in keyof typeof possibleIcons]: string[] }
  ;(
    (await prisma.tagIcons.findMany({
      orderBy: {
        tag: "asc"
      }
    })) as { icon: keyof typeof possibleIcons; tag: string }[]
  ).forEach(({ icon, tag }) => {
    if (!tagIcons[icon]) tagIcons[icon] = []
    tagIcons[icon].push(tag)
  })

  let serverURL = "https://stash.hera.lan"
  if (url.hostname == "stash.any.gay") serverURL = "https://stash.any.gay"
  console.log(new Date().toISOString(), "/+layout.server.ts2", url.pathname)

  return {
    clusters: prisma.clusters.findMany(),
    tagIcons,
    serverURL
  }
}
