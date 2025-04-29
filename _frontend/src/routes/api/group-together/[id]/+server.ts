import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ params }) =>
    new Response(
        (
            await prisma.groupedIntoNames.findFirst({
                where: {
                    id: +params.id
                }
            })
        )?.name || "Unknown"
    )

export const PUT: RequestHandler = async ({ params, request }) => {
    const { name }: { name: string } = await request.json()

    await prisma.groupedIntoNames.update({
        where: {
            id: +params.id
        },
        data: {
            name
        }
    })

    return new Response()
}
