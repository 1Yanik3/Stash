import type { RequestHandler } from './$types'

import fs from 'fs/promises'
import ffmpeg from 'fluent-ffmpeg'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


export const GET: RequestHandler = async ({ params }) => {

    try {
        // thumbnail exists
        return new Response(
            await fs.readFile(`./thumbnails/${params.media}.webp`)
        )
    }
    catch {
        // thumbnail needs to be created

        const group = prisma.groups.findFirst({
            where: {
                media: {
                    some: {
                        id: params.media
                    }
                }
            }
        })
        let defaultDuration = 7
        if (group.cluster.name == "Studios")
            defaultDuration = 30

        // get resolution and duration of file
        // TODO: Do not do this, instead do this on upload
        const information: any = await new Promise(resolve => ffmpeg.ffprobe(`./media/${params.media}`, (_: any, d: any) => resolve(d)))
        const { duration } = (information && information["format"]) || { duration: null }
        const outputOptions = !isNaN(duration) ? [
            `-vframes 1`,
            `-ss ${duration > defaultDuration ? defaultDuration : (duration / 2).toFixed()}`
        ] : []

        // create thumbnail
        await new Promise(resolve => ffmpeg()
            .input(`./media/${params.media}`)
            .complexFilter([
                'scale=w=650:h=650:force_original_aspect_ratio=increase'
            ])
            .output(`./thumbnails/${params.media}.webp`)
            .on('end', resolve)
            .outputOptions(outputOptions)
            .run()
        )

        // respond with thumbnail
        return new Response(
            await fs.readFile(`./thumbnails/${params.media}.webp`)
        )
    }

}