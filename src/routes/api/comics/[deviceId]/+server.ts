import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import fs from 'fs/promises'

export const GET: RequestHandler = async ({ params }) => {
    const sourceFolderPath = `./comics_raw/${params.deviceId}`
    const targetFolderPath = `./comics_synced`

    const sourceItems = (await fs.readdir(sourceFolderPath)).filter(a => !a.startsWith("."))
    const targetItems = (await fs.readdir(targetFolderPath)).filter(a => !a.startsWith("."))

    return json(sourceItems.map(id => { return { id, synced: targetItems.includes(id) } }))
}
