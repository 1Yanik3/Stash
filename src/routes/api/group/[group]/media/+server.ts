import type { RequestHandler } from './$types'

import fs from 'fs/promises'
import { execSync } from 'child_process'
import { ExifParserFactory } from "ts-exif-parser"

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
// const prisma = new PrismaClient({
//     log: [
//         {
//             emit: 'event',
//             level: 'query',
//         },
//         {
//             emit: 'stdout',
//             level: 'error',
//         },
//         {
//             emit: 'stdout',
//             level: 'info',
//         },
//         {
//             emit: 'stdout',
//             level: 'warn',
//         },
//     ],
// })

// prisma.$on('query', (e) => {
//     console.log('Query: ' + e.query)
//     console.log('Params: ' + e.params)
//     console.log('Duration: ' + e.duration + 'ms')
// })

export const GET: RequestHandler = async ({ params }) => {

    const cluster = await prisma.clusters.findFirstOrThrow({
        where: {
            groups: {
                some: {
                    id: Number(params.group)
                }
            }
        }
    })

    // return all media of a cluster if it's the everything group
    if (Number(params.group) == cluster.everythingGroupId)
        return new Response(JSON.stringify(
            (
                await prisma.media.findMany({
                    where: {
                        group: {
                            cluster
                        }
                    },
                    include: {
                        tags: {
                            select: {
                                name: true
                            }
                        }
                    }
                })
            ).map(d => {
                d.date = d.date.getTime() as any
                return d
            })
        ))

    return new Response(JSON.stringify(
        (
            await prisma.media.findMany({
                where: { groupId: Number(params.group) },
                include: {
                    tags: {
                        select: {
                            name: true
                        }
                    }
                }
            })
        ).map(d => {
            d.date = d.date.getTime() as any
            return d
        })
    ))
}

export const POST: RequestHandler = async ({ params, request }) => {
    console.time("media post request: formData")
    const data = await request.formData()
    console.timeEnd("media post request: formData")

    console.time("media post request: get file")
    const file = data.get('file') as File
    console.timeEnd("media post request: get file")

    console.time("media post request: create db entry")

    const { id: mediaId } = await prisma.media.create({
        data: {
            name: file.name,
            type: file.type,
            date: new Date(),
            height: 0,
            width: 0,
            groupId: Number(params.group),
        }
    })
    console.timeEnd("media post request: create db entry")

    console.time("media post request: get buffer")
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    console.timeEnd("media post request: get buffer")

    console.time("media post request: store file")
    // store file
    const filePath = `./media/${mediaId}`
    await fs.writeFile(filePath, fileBuffer)
    console.timeEnd("media post request: store file")

    // TODO: Run this in a seperate thread
    console.time("media post request: get metadata")
    // get resolution of file
    const Data = ExifParserFactory.create(fileBuffer).parse()

    // Temporarely disabled
    // // get resolution of file
    // const information: any = await new Promise(resolve => ffmpeg.ffprobe(filePath, (_, d) => resolve(d)))
    // const { width, height } = information["streams"].find((d: any) => !!d['width'])

    const createdDateMatchFromFilename = file.name.match(/(20\d\d)([01]\d)([0123]\d)/)

    // Get width and height
    let width = Data.tags?.ExifImageWidth || Data.imageSize?.width
    let height = Data.tags?.ExifImageWidth || Data.imageSize?.width
    let [ffmpeg_width, ffmpeg_height, rotation] = [0, 0, 0]
    if (!width || !height) {
        [ffmpeg_width, ffmpeg_height, rotation] = execSync(`ffprobe -loglevel error  -select_streams v:0  -show_entries stream=width,height:side_data="rotation"  -of default=nw=1:nk=1 -i ${filePath}`).toString().split("\n") as any as number[]
        height = [90, 270, -90, -270].includes(rotation) ? +ffmpeg_width : +ffmpeg_height
        width = [90, 270, -90, -270].includes(rotation) ? +ffmpeg_height : +ffmpeg_width
    }
    console.timeEnd("media post request: get metadata")
    console.time("media post request: store metadata")
    // get resolution of file
    await prisma.media.update({
        data: {
            width,
            height,
            createdDate: (Data.tags?.CreateDate != undefined && new Date(Data.tags.CreateDate * 1000)) ||
                (createdDateMatchFromFilename && new Date(`${createdDateMatchFromFilename[1]}-${createdDateMatchFromFilename[2]}-${createdDateMatchFromFilename[3]}`))
                || new Date(0)
        },
        where: { id: mediaId }
    })
    console.timeEnd("media post request: store metadata")

    return new Response()
}
