import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const POST: RequestHandler = async ({ params, request }) => {

    const { name, parentId } = await request.json()

    await prisma.groups.create({
        data: {
            name,
            parentId: parentId > 0 ? parentId : null,
            clusterId: Number(params.cluster)
        }
    })

    return new Response()
}

export const GET: RequestHandler = async ({ params }) => {

    const groups = await prisma.groups.findMany({
        where: {
            clusterId: Number(params.cluster),
            parentId: null,
            id: {
                gt: 0
            }
        },
        include: { // 1
            children: { // 2
                include: { // 3
                    children: { // 4
                        include: { // 5
                            children: { // 6
                                include: { // 7
                                    children: { // 8
                                        include: { // 9
                                            children: {
                                                include: { // 1
                                                    children: { // 2
                                                        include: { // 3
                                                            children: { // 4
                                                                include: { // 5
                                                                    children: { // 6
                                                                        include: { // 7
                                                                            children: { // 8
                                                                                include: { // 9
                                                                                    children: true
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })


    const { everythingGroupId, unsortedGroupId, trashGroupId } = await prisma.clusters.findFirstOrThrow({
        where: {
            id: Number(params.cluster)
        }
    })
    groups.unshift({
        id: unsortedGroupId || 0,
        name: "Unsorted",
        clusterId: Number(params.cluster),
        collapsed: false,
        icon: "",
        parentId: null as any,
        children: []
    })
    groups.unshift({
        id: trashGroupId || 0,
        name: "Trash",
        clusterId: Number(params.cluster),
        collapsed: false,
        icon: "",
        parentId: null as any,
        children: []
    })
    groups.unshift({
        id: everythingGroupId || 0,
        name: "Everything",
        clusterId: Number(params.cluster),
        collapsed: false,
        icon: "",
        parentId: null as any,
        children: []
    })

    return new Response(JSON.stringify(groups))
    
}