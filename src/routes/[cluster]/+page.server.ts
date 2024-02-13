import prisma from "$lib/server/prisma"
import { resolve } from "path"

import type {
  PageServerData,
  PageServerLoad,
  PageServerParentData
} from "./$types"

const loadCounters = async () => {
  return (
    (await prisma.$queryRaw`
        SELECT COUNT(*) AS untagged_count
        FROM "Media"
        WHERE NOT EXISTS (
                SELECT 1
                FROM unnest("Media"."tags") AS t(tag)
                WHERE tag IN ('Solo', 'Two', 'Group')
        )
    `) as any
  )[0] as { untagged_count: number }
}

const loadStories = (parent: Promise<PageServerParentData>) =>
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

const loadCollapsedTags = (parent: Promise<PageServerParentData>) =>
  new Promise(async resolve => {
    resolve(
      await prisma.collapsedTags.findMany({
        where: {
          Cluster: {
            id: (await parent).cluster.id
          }
        }
      })
    )
  })

export const load: PageServerLoad = async ({ parent, depends, url }) => {
  depends("tags")

  const counters = loadCounters()
  const stories = loadStories(parent())
  const collapsedTags = loadCollapsedTags(parent())

  return {
    streamed: {
      counters,
      stories,
      collapsedTags
    }
  }
}
