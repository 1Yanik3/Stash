import prisma from "$lib/server/prisma"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ params }) => ({
  duplicate_media: await prisma.media.findMany({
    where: {
      content_hash: params.content_hash
    }
  })
})
