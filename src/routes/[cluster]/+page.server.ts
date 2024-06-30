import prisma from "$lib/server/prisma"

import { Story } from "@prisma/client"

import type { PageServerLoad, PageServerParentData } from "./$types"

const loadCounters = async (clusterName: string) => {
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

const loadStories = (parent: Promise<PageServerParentData>): Promise<Story[]> =>
  new Promise(async resolve =>
    resolve(
      await prisma.story.findMany({
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
