import fs from "fs/promises"

import prisma from "$lib/server/prisma"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
    // Start reading the directory and querying the database in parallel
    const [fileNames, mediaRecords] = await Promise.all([
        fs.readdir("./media/"),
        prisma.media.findMany({
            select: { id: true }
        })
    ])

    // Convert media IDs to a Set for faster lookup
    const mediaIdSet = new Set(mediaRecords.map(record => record.id))

    return {
        // Filter files that are not in the mediaIdSet
        unimportedFiles: fileNames
            .map(fileName => fileName.split(".")[0])
            .filter(fileName => !mediaIdSet.has(fileName))
            .slice(0, 10)
    }
}
