import type { PageServerLoad } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const load: PageServerLoad = async ({ parent }) => {

    const parentData = await parent()

    const tags: { tag: string[], count: number }[] = await prisma.$queryRaw`
        SELECT
            COUNT(*)::INTEGER as count,
            string_to_array(INITCAP(UNNEST(tags)), '/') as tag
        FROM "Media"
        WHERE "Media"."clustersId"=${parentData.cluster.id}
        GROUP BY tag
        ORDER BY count desc
    `

	const stories = await prisma.story.findMany({
        where: {
            cluster: parentData.cluster
        }
    })

	return {
        tags,
		stories
	};
}
