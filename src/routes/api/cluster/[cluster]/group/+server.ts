import type { RequestHandler } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

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

    groups.unshift({
        id: -1,
        name: "Unsorted",
        clusterId: Number(params.cluster),
        collapsed: false,
        icon: "",
        parentId: null as any,
        children: []
    })
    groups.unshift({
        id: -2,
        name: "Trash",
        clusterId: Number(params.cluster),
        collapsed: false,
        icon: "",
        parentId: null as any,
        children: []
    })
    groups.unshift({
        id: -3,
        name: "Everything",
        clusterId: Number(params.cluster),
        collapsed: false,
        icon: "",
        parentId: null as any,
        children: []
    })

    return new Response(JSON.stringify(groups))
    
}