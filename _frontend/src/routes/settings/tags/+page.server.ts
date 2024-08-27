import prisma from "$lib/server/prisma"

import type { PageServerLoad } from "./$types"

export const load = (async () => {
  return {
    allTags: await prisma.tags.findMany({
      include: {
        _count: {
          select: {
            media: true
          }
        },
        parent: {
          select: {
            id: true,
            tag: true
          }
        }
      },
      orderBy: {
        id: "asc"
      }
    })
  }
}) satisfies PageServerLoad
