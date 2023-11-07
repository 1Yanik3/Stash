import type { RequestHandler } from './$types'
import fs from 'fs/promises'

export const GET: RequestHandler = async ({ params }) => {
    const sourceFolderPath = `./comics_raw/${params.deviceId}/${params.comicName}`
    const targetFolderPath = `./comics_synced/${params.comicName}`

    await fs.cp(sourceFolderPath, targetFolderPath, { recursive: true })

    return new Response()
}
