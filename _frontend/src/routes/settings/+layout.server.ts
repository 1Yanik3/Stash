import prisma from "$lib/server/prisma"

import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async () => {
  return {
    duplicates_count: (
      (await prisma.$queryRaw`
        SELECT COUNT(DISTINCT content_hash) 
        FROM "Media" 
        WHERE content_hash != 'IGNORED' 
            AND content_hash != 'ERROR' 
            AND content_hash IS NOT NULL
    `) as any
    )[0].count as number
  }
}
