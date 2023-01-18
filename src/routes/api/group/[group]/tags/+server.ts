import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({ params }) => {

    const groupToSearchFor = Number(params.group)

    let output: any = []

    // normal group
    if (groupToSearchFor > 0) {
        output = await prisma.tags.findMany({
            where: {
                media: {
                    some: {
                        groupId: Number(params.group)
                    }
                }
            },
            include: {
                _count: true
            }
        })
    }

    // special group
    if (groupToSearchFor <= 0) {
        output = (
            await prisma.tags.findMany({
                where: {
                    media: {
                        some: {
                            group: {
                                cluster: {
                                    everythingGroupId: -6
                                }
                            }
                        }
                    }
                },
                include: {
                    _count: true
                }
            })
        )
    }

    return new Response(JSON.stringify(
        output.map((r: any) => {return {
            id: r.id,
            name: r.name,
            count: r._count.media
        }})
    ))
}