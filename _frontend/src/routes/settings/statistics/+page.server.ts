import prisma from "$lib/server/prisma"

import { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => ({
  countOfMedia: await prisma.media.count()
})
