import type { RequestHandler } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

export const GET: RequestHandler = async ({ params }) => {
    if (!params.media) return new Response("No media provided", { status: 400 })

    await prisma.job.create({
        data: {
            name: "updateMediaMetadataFromFile",
            data: JSON.stringify({ id: params.media })
        }
    })

    return new Response()
}
