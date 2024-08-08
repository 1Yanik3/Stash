import prisma from "$lib/server/prisma"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => ({
  countOfMedia: await prisma.media.count()
})
