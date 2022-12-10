import type { RequestHandler } from './$types'

import fs from 'fs/promises'
import ffmpeg from 'fluent-ffmpeg'

export const GET: RequestHandler = async ({ params }) => {

    try {
        // thumbnail exists
        return new Response(
            await fs.readFile(`./thumbnails/${params.media}.webp`)
        )
    }
    catch {
        // thumbnail needs to be created

        // get resolution and duration of file
        const information: any = await new Promise(resolve => ffmpeg.ffprobe(`./media/${params.media}`, (_: any, d: any) => resolve(d)))

        const { duration } = information["format"]
        const outputOptions = !isNaN(duration) ? [
            `-vframes 1`,
            `-ss ${duration > 7 ? 7 : (duration / 2).toFixed()}`
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