export const ssr = true

import type { LayoutServerLoad } from './$types'

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const load: LayoutServerLoad = async ({ fetch, depends, params }) => {

    const clusters = await prisma.clusters.findMany()

    return {
        clusters
    }

}