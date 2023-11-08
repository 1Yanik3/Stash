import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'

export const GET: RequestHandler = async ({ params }) => {
    const sourcesFolderPath = `./comics_raw/${params.deviceId}`
    const targetFolderPath = `./comics_synced`

    const sources = await fs.readdir(`${sourcesFolderPath}`)
    const sourceItems = (await Promise.all(
        sources
            .filter(a => !a.startsWith("."))
            .map(async s =>
                (await fs.readdir(`${sourcesFolderPath}/${s}`, { withFileTypes: true }))
                    .filter(s => s.isDirectory())
                    .filter(a => !a.name.startsWith("."))
                    .map(f => {
                        const fullFolderPath = path.join(path.resolve(`${sourcesFolderPath}/${s}`), f.name)
                        const stats = fsSync.statSync(fullFolderPath)
                        return { name: f.name, ...stats }
                    })
                    .sort((a, b) => {
                        return b.mtimeMs - a.mtimeMs
                    })
                    .map(i => {
                        return {
                            source: s,
                            id: i.name
                        }
                    })
            )
    )).flat()

    const targetItems = await fs.readdir(targetFolderPath)

    const syncedItems = sourceItems.map(item => ({ ...item, synced: targetItems.includes(item.id) }))

    return json(syncedItems)
}
