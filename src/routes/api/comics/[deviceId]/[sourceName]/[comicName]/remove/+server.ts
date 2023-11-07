import type { RequestHandler } from './$types'
import fs from 'fs/promises'

export const GET: RequestHandler = async ({ params }) => {
    const targetFolderPath = `./comics_synced/${params.comicName}`

    await fs.rm(targetFolderPath, { recursive: true, force: true })

    return new Response()
}
