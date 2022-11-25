import type { RequestHandler } from './$types'

import fs from 'fs/promises'
import ffmpeg from 'fluent-ffmpeg'

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
            await prisma.media.findMany({
                where: {
                    group: {
                        cluster
                    }
                }
            })
        ))

    return new Response(JSON.stringify(
        await prisma.media.findMany({
            where: { groupId: Number(params.group) }
        })
    ))
}

export const POST: RequestHandler = async ({ params, request }) => {
    const data = await request.formData()

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

    // store file
    const filePath = `./media/${media.id}`
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()))

    // get resolution of file
    const information: any = await new Promise(resolve => ffmpeg.ffprobe(filePath, (_, d) => resolve(d)))
    const { width, height } = information["streams"].find((d: any) => !!d['width'])

    await prisma.media.update({
        data: {
            width,
            height
        },
        where: { id: media.id }
    })

    return new Response()
}
