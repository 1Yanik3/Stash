import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const PUT: RequestHandler = async ({ params }) => {
    await prisma.media.updateMany({
        where: {
            content_hash: params.content_hash
        },
        data: {
            content_hash: "IGNORED"
        }
    })

    return new Response(null, { status: 204 })
}
