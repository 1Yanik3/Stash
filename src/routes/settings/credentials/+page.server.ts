import prisma from "$lib/server/prisma"

import { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => ({
  credentials: await prisma.credentials.findMany({
    select: {
      id: true,
      username: true,
      permittedClusters: {
        select: {
          id: true,
          name: true,
          icon: true
        }
      }
    }
  })
})
