import type { RequestHandler } from './$types'

import fs from 'fs/promises'
import { ExifParserFactory } from "ts-exif-parser"

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

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
                    }
                })
            )
                .map(d => {
                    d.date = d.date.getTime() as any
                    return d
                })
        ))

    return new Response(JSON.stringify(
        (
            await prisma.media.findMany({
                where: { groupId: Number(params.group) },
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

    console.time("media post request: get file and create db entry")
    const file = data.get('file') as File

    const media = await prisma.media.create({
        data: {
            name: file.name,
            type: file.type,
            date: new Date(),
            height: 0,
            width: 0,
            groupId: Number(params.group)
        }
    })
    console.timeEnd("media post request: get file and create db entry")


    console.time("media post request: get buffer")
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    console.timeEnd("media post request: get buffer")

    console.time("media post request: store file")
    // store file
    const filePath = `./media/${media.id}`
    await fs.writeFile(filePath, fileBuffer)
    console.timeEnd("media post request: store file")

    console.time("media post request: get metadata")
    // get resolution of file
    const Data = ExifParserFactory.create(fileBuffer).parse()

    // Temporarely disabled
    // // get resolution of file
    // const information: any = await new Promise(resolve => ffmpeg.ffprobe(filePath, (_, d) => resolve(d)))
    // const { width, height } = information["streams"].find((d: any) => !!d['width'])

    const createdDateMatchFromFilename = file.name.match(/(20\d\d)([01]\d)([0123]\d)/)
    console.log({
        1: (Data.tags?.CreateDate != undefined && new Date(Data.tags.CreateDate * 1000)),
        2: createdDateMatchFromFilename
    })

    // get resolution of file
    await prisma.media.update({
        data: {
            width: Data.tags?.ExifImageWidth || Data.imageSize?.width,
            height: Data.tags?.ExifImageHeight || Data.imageSize?.height,
            createdDate: (Data.tags?.CreateDate != undefined && new Date(Data.tags.CreateDate * 1000)) ||
                (createdDateMatchFromFilename && new Date(`${createdDateMatchFromFilename[1]}-${createdDateMatchFromFilename[2]}-${createdDateMatchFromFilename[3]}`))
                || new Date(0)
        },
        where: { id: media.id }
    })
    console.timeEnd("media post request: get metadata")

    return new Response()
}
