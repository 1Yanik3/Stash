import type { PageServerLoad } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const load: PageServerLoad = async ({ params }) => {

    const group = await prisma.groups.findUniqueOrThrow({
        where: {
            id: +params.group
        },
        include: {
            parent: true,
            children: true
        }
    })

	const stories = await prisma.story.findMany({
        where: {
            cluster: {
                name: params.cluster
            }
        }
    })

	return {
        group,
		stories
	};
}
