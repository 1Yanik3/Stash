import type { Story } from "@prisma/client/wasm"

import prisma from "$lib/server/prisma"

import type { PageServerLoad, PageServerParentData } from "./$types"

const loadCounters = async (clusterName: string) => {
  return [{ untagged_count: 0 }]
  return (
    (await prisma.$queryRaw`
        SELECT COUNT(*) AS untagged_count
        FROM "Media"
        WHERE "Media"."clustersId" = (SELECT id FROM "Clusters" WHERE "Clusters".name = ${clusterName})
        AND NOT EXISTS (
                SELECT 1
                FROM unnest("Media"."tags") AS t(tag)
                WHERE tag IN ('Solo', 'Two', 'Three', 'Group')
        )
    `) as any
  )[0] as { untagged_count: number }
}

const loadStories = (
  parent: Promise<PageServerParentData>
): Promise<{ id: string; title: string; date: Date }[]> =>
  new Promise(async resolve =>
    resolve(
      await prisma.story.findMany({
        select: {
          id: true,
          title: true,
          date: true
        },
        where: {
          cluster: {
            id: (await parent).cluster.id
          }
        }
      })
    )
  )

export const load: PageServerLoad = ({ parent, depends, params }) => {
  depends("tags")

  const counters = loadCounters(params.cluster)
  const stories = loadStories(parent())

  return {
    streamed: {
      counters,
      stories
    }
  }
}
