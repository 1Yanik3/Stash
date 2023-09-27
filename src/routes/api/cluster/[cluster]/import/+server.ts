import type { RequestHandler } from './$types'

import fs from 'fs/promises'
import { json } from '@sveltejs/kit'
import sharedImportLogic from '../../../../../lib/sharedImportLogic'
import mime from 'mime-types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const importFolderPath = "./importables"

export const GET: RequestHandler = async () => json(await fs.readdir(importFolderPath))

export const POST: RequestHandler = async ({ params, request }) => {
    const { filename, selectedTags }: { filename: string, selectedTags: string[] } = await request.json()

    const { id: mediaId } = await prisma.media.create({
        data: {
            name: filename,
            type: mime.lookup(`${importFolderPath}/${filename}`) || "Unknown",
            date: new Date(),
            height: 0,
            width: 0,
            cluster: {
                connect: {
                    id: +params.cluster
                }
            },
            tags: selectedTags.map(t => t.toLocaleLowerCase()) || []
        }
    })

    await fs.copyFile(`${importFolderPath}/${filename}`, `./media/${mediaId}`)
    await fs.rm(`${importFolderPath}/${filename}`)

    await sharedImportLogic(filename, mediaId)

    // TODO: Start thumbnail generation

    return new Response()
}