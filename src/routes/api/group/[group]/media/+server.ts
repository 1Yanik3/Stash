import type { RequestHandler } from './$types'

import fs from 'fs/promises'
// import { ExifParserFactory } from "ts-exif-parser"

import { PrismaClient } from '@prisma/client'
import sharedImportLogic from '../sharedImportLogic'
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

    // TODO: Get rid of this step
    console.time("media post request: get buffer")
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    console.timeEnd("media post request: get buffer")

    console.time("media post request: store file")
    // store file
    await fs.writeFile(`./media/${mediaId}`, fileBuffer)
    console.timeEnd("media post request: store file")

    await sharedImportLogic(file.name, mediaId)

    return new Response()
}
