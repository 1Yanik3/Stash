import prisma from "$lib/server/prisma"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => ({
  imagesMissingAiTagMatching: prisma.media.findMany({
    where: {
      type: {
        startsWith: "image"
      },
      visualAiMatchingVersion: {
        lt: 1
      }
    },
    select: {
      id: true
    }
  })
})
