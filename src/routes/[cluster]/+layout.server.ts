import type { LayoutServerLoad } from './$types'

import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const load: LayoutServerLoad = async ({ parent, params, depends }) => {
    depends("clusters-and-groups")

    const data = await parent()

    const cluster = data.clusters.find(c => c.name == params.cluster) || data.clusters[0]

    const groups = await prisma.groups.findMany({
        where: {
            clusterId: cluster.id,
            parentId: null,
            id: {
                gt: 0
            }
        },
        orderBy: {
            name: cluster.type == "collection" ? "desc" : "asc"
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

    return {
        cluster,
        groups
    }


}