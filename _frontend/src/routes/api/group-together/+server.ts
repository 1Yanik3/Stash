import type { RequestHandler } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

export const POST: RequestHandler = async ({ request }) => {
    const ids: string[] = await request.json()

    await prisma.groupedIntoNames.create({
        data: {
            name: ids[0],
            Media: {
                connect: await prisma.media.findMany({
                    where: {
                        id: {
                            in: ids
                        }
                    },
                    select: {
                        id: true
                    }
                })
            }
        }
    })

    return new Response()
}
