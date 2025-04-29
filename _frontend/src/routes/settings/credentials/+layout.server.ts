import prisma from "$lib/server/prisma"

import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async () => ({
    allClusters: await prisma.clusters.findMany({
        orderBy: {
            sortOrder: "asc"
        }
    }),
    credentials: await prisma.credentials.findMany({
        select: {
            id: true,
            username: true,
            permittedClusters: {
                select: {
                    id: true,
                    name: true,
                    icon: true
                },
                orderBy: {
                    sortOrder: "asc"
                }
            }
        }
    })
})
