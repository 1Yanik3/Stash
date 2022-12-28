import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

import fs from 'fs/promises'
import { execSync } from 'child_process'
import { ExifParserFactory } from "ts-exif-parser"

const media = await prisma.media.findMany({
    where: {
        OR: {
            width: 0,
            height: 0
        }
    }
})

for (const i in media) {
    const filePath = `./media/${media[i].id}`

    const Data = ExifParserFactory.create(await fs.readFile(filePath)).parse()

    let width = Data.tags?.ExifImageWidth || Data.imageSize?.width
    let height = Data.tags?.ExifImageWidth || Data.imageSize?.width
    let [ffmpeg_width, ffmpeg_height, rotation] = [0, 0, 0]
    if (!width || !height) {
        [ffmpeg_width, ffmpeg_height, rotation] = execSync(`ffprobe -loglevel error  -select_streams v:0  -show_entries stream=width,height:side_data="rotation"  -of default=nw=1:nk=1 -i ${filePath}`).toString().split("\n") as any as number[]
        height = [90, 270, -90, -270].includes(rotation) ? +ffmpeg_width : +ffmpeg_height
        width = [90, 270, -90, -270].includes(rotation) ? +ffmpeg_height : +ffmpeg_width
    }

    await prisma.media.update({
        where: media[i],
        data: {
            width,
            height
        }
    })
}