import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import fs from 'fs/promises'

export const GET: RequestHandler = async ({ params }) => {
    const sourcesFolderPath = `./comics_raw/${params.deviceId}`
    const targetFolderPath = `./comics_synced`

    const sources = await fs.readdir(`${sourcesFolderPath}`)
    const sourceItems = (await Promise.all(
        sources
            .filter(a => !a.startsWith("."))
            .map(async s => {
                const subItems = await fs.readdir(`${sourcesFolderPath}/${s}`)
                return subItems.filter(a => !a.startsWith(".")).map(i => {
                    return {
                        source: s,
                        id: i
                    }
                })
            })
    )).flat()

    const targetItems = await fs.readdir(targetFolderPath)

    const syncedItems = sourceItems.map(item => ({ ...item, synced: targetItems.includes(item.id) }))

    return json(syncedItems)
}
