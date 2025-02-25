import prisma from "$lib/server/prisma"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => ({
  jobs: await prisma.job.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 1000
  })
})
